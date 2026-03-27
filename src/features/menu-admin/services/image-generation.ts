"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { revalidatePath } from "next/cache"

async function requireStaff() {
  const session = await getStaffSession()
  if (!session) throw new Error("No autorizado")
  return session
}

export async function generateProductImage(
  productId: string,
  productName: string,
  categoryName: string
): Promise<{ success: boolean; error?: string; imageUrl?: string }> {
  await requireStaff()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return { success: false, error: "OPENROUTER_API_KEY no configurada" }
  }

  const prompt = `Generate an image: Professional food photography, aesthetic Instagram style. A beautiful "${productName}" drink from Patitos Café (${categoryName}). Style: clean minimalist, soft pastel background in cream and beige tones, natural lighting from a window, shallow depth of field. The drink is centered, perfectly styled with subtle garnishes. Warm color palette, no harsh shadows. Shot on 85mm lens, slightly overhead angle. No text, no logos, no watermarks. Mood: cozy café, instagrammable, warm and inviting.`

  try {
    // Use Gemini via chat completions (supports inline image generation)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://patitoscafe.vercel.app",
        "X-Title": "Patitos Cafe Menu",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter error:", errorData)
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json()

    // Gemini returns image as base64 in multipart content
    const content = data.choices?.[0]?.message?.content
    const parts = data.choices?.[0]?.message?.parts

    // Try to find base64 image in parts (multimodal response)
    let imageBase64: string | null = null
    let mimeType = "image/png"

    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        if (part.type === "image" && part.image) {
          imageBase64 = part.image
          mimeType = part.mime_type ?? "image/png"
          break
        }
        if (part.inline_data) {
          imageBase64 = part.inline_data.data
          mimeType = part.inline_data.mime_type ?? "image/png"
          break
        }
      }
    }

    // Also check if content contains a URL or base64
    if (!imageBase64 && typeof content === "string") {
      // Check for markdown image URL
      const urlMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/)
      if (urlMatch) {
        const imgUrl = urlMatch[1]
        const imgResp = await fetch(imgUrl)
        const buffer = await imgResp.arrayBuffer()
        return await uploadAndSave(productId, buffer, "image/png")
      }

      // Check for inline base64
      const b64Match = content.match(/data:(image\/[^;]+);base64,([A-Za-z0-9+/=]+)/)
      if (b64Match) {
        mimeType = b64Match[1]
        imageBase64 = b64Match[2]
      }
    }

    // Check multimodal content array format
    if (!imageBase64 && Array.isArray(data.choices?.[0]?.message?.content)) {
      for (const block of data.choices[0].message.content) {
        if (block.type === "image_url" && block.image_url?.url) {
          const url = block.image_url.url
          if (url.startsWith("data:")) {
            const match = url.match(/data:(image\/[^;]+);base64,(.+)/)
            if (match) {
              mimeType = match[1]
              imageBase64 = match[2]
              break
            }
          } else {
            const imgResp = await fetch(url)
            const buffer = await imgResp.arrayBuffer()
            return await uploadAndSave(productId, buffer, "image/png")
          }
        }
      }
    }

    if (!imageBase64) {
      console.error("No image found in response:", JSON.stringify(data).slice(0, 500))
      return { success: false, error: "El modelo no generó imagen. Intenta de nuevo." }
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageBase64, "base64")
    return await uploadAndSave(productId, buffer, mimeType)
  } catch (err) {
    console.error("Image generation error:", err)
    return { success: false, error: "Error generando imagen" }
  }
}

async function uploadAndSave(
  productId: string,
  imageData: ArrayBuffer | Buffer,
  contentType: string
): Promise<{ success: boolean; error?: string; imageUrl?: string }> {
  const supabase = createAdminClient()
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg"
  const path = `${productId}-ai.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, imageData, { contentType, upsert: true })

  if (uploadError) {
    return { success: false, error: `Upload error: ${uploadError.message}` }
  }

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: urlData.publicUrl })
    .eq("id", productId)

  if (updateError) {
    return { success: false, error: `DB error: ${updateError.message}` }
  }

  revalidatePath("/")
  revalidatePath("/staff/admin")

  return { success: true, imageUrl: urlData.publicUrl }
}
