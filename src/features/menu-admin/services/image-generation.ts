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

  const prompt = `Professional food photography, aesthetic Instagram style. A beautiful "${productName}" drink from Patitos Café (${categoryName}). Style: clean minimalist, soft pastel background in cream and beige tones, natural lighting from a window, shallow depth of field. The drink is centered, perfectly styled with subtle garnishes. Warm color palette, no harsh shadows. Shot on 85mm lens, slightly overhead angle. No text, no logos, no watermarks. Mood: cozy café, instagrammable, warm and inviting.`

  try {
    // Call OpenRouter with an image generation model
    const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://patitoscafe.vercel.app",
        "X-Title": "Patitos Cafe Menu",
      },
      body: JSON.stringify({
        model: "openai/dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter error:", errorData)
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      return { success: false, error: "No se generó imagen" }
    }

    // Download the image
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()

    // Upload to Supabase Storage
    const supabase = createAdminClient()
    const path = `${productId}-ai.webp`

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, imageBuffer, {
        contentType: "image/webp",
        upsert: true,
      })

    if (uploadError) {
      return { success: false, error: `Upload error: ${uploadError.message}` }
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path)

    // Update product with new image URL
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
