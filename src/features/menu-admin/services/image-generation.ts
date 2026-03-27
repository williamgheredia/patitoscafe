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

  const prompt = `Generate a photo: Professional food photography, aesthetic Instagram style. A beautiful "${productName}" drink from Patitos Café (${categoryName}). Style: clean minimalist, soft pastel background in cream and beige tones, natural lighting from a window, shallow depth of field. The drink is centered, perfectly styled with subtle garnishes. Warm color palette, no harsh shadows. Shot on 85mm lens, slightly overhead angle. No text, no logos, no watermarks. Mood: cozy café, instagrammable, warm and inviting.`

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://patitoscafe.vercel.app",
        "X-Title": "Patitos Cafe Menu",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter error:", errorData)
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    const msg = data.choices?.[0]?.message

    // Gemini image models return images in message.images[]
    // Format: [{ type: "image_url", image_url: { url: "data:image/png;base64,..." } }]
    const images = msg?.images as { type: string; image_url: { url: string } }[] | undefined

    if (!images || images.length === 0) {
      console.error("No images in response:", JSON.stringify(data).slice(0, 300))
      return { success: false, error: "El modelo no generó imagen. Intenta de nuevo." }
    }

    const dataUrl = images[0]?.image_url?.url
    if (!dataUrl) {
      return { success: false, error: "Formato de imagen no reconocido" }
    }

    // Parse data URL: "data:image/png;base64,iVBORw..."
    const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/)
    if (!match) {
      return { success: false, error: "Imagen en formato inesperado" }
    }

    const mimeType = match[1]
    const base64Data = match[2]
    const buffer = Buffer.from(base64Data, "base64")

    // Upload to Supabase Storage
    const supabase = createAdminClient()
    const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg"
    const path = `${productId}-ai.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, buffer, { contentType: mimeType, upsert: true })

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
  } catch (err) {
    console.error("Image generation error:", err)
    return { success: false, error: "Error generando imagen" }
  }
}
