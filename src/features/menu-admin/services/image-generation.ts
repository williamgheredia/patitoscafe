"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { revalidatePath } from "next/cache"

async function requireStaff() {
  const session = await getStaffSession()
  if (!session) throw new Error("No autorizado")
  return session
}

const STARBUCKS_STYLE = `Starbucks-style professional product photography. Clean, premium, aspirational. Soft diffused studio lighting, seamless gradient background in warm cream to white tones. The drink is the hero — perfectly styled, condensation droplets visible, garnished elegantly. Shallow depth of field, shot on 85mm lens. Color grading: warm highlights, soft shadows, slightly desaturated greens. No text, no logos, no watermarks. Mood: premium café, Instagram-worthy, clean and polished like a Starbucks menu board.`

async function callGeminiImage(
  prompt: string,
  aspectRatio: string
): Promise<{ success: boolean; error?: string; buffer?: Buffer; mimeType?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return { success: false, error: "OPENROUTER_API_KEY no configurada" }

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
      image_config: { aspect_ratio: aspectRatio },
    }),
  })

  if (!response.ok) {
    const errorData = await response.text()
    console.error("OpenRouter error:", errorData)
    return { success: false, error: `API error: ${response.status}` }
  }

  const data = await response.json()
  const images = data.choices?.[0]?.message?.images as
    | { type: string; image_url: { url: string } }[]
    | undefined

  if (!images || images.length === 0) {
    console.error("No images in response:", JSON.stringify(data).slice(0, 300))
    return { success: false, error: "El modelo no generó imagen. Intenta de nuevo." }
  }

  const dataUrl = images[0]?.image_url?.url
  if (!dataUrl) return { success: false, error: "Formato de imagen no reconocido" }

  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if (!match) return { success: false, error: "Imagen en formato inesperado" }

  return {
    success: true,
    buffer: Buffer.from(match[2], "base64"),
    mimeType: match[1],
  }
}

async function uploadImage(
  path: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ publicUrl: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, buffer, { contentType: mimeType, upsert: true })

  if (error) throw new Error(`Upload error: ${error.message}`)

  const { data } = supabase.storage.from("product-images").getPublicUrl(path)
  return { publicUrl: data.publicUrl }
}

// --- Product image ---

export async function generateProductImage(
  productId: string,
  productName: string,
  categoryName: string
): Promise<{ success: boolean; error?: string; imageUrl?: string }> {
  await requireStaff()

  const prompt = `Generate a photo: ${STARBUCKS_STYLE} The drink is a "${productName}" (category: ${categoryName}). Show the actual drink beautifully presented — if it's a frappe show the blended texture with whipped cream, if it's a hot coffee show the latte art, if it's a smoothie show the vibrant fruit colors. Make it look absolutely delicious.`

  try {
    const result = await callGeminiImage(prompt, "3:4")
    if (!result.success) return result

    const ext = result.mimeType!.includes("png") ? "png" : "jpg"
    const { publicUrl } = await uploadImage(
      `${productId}-${Date.now()}.${ext}`,
      result.buffer!,
      result.mimeType!
    )

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("id", productId)

    if (error) return { success: false, error: `DB error: ${error.message}` }

    revalidatePath("/")
    revalidatePath("/staff/admin")
    return { success: true, imageUrl: publicUrl }
  } catch (err) {
    console.error("Product image error:", err)
    return { success: false, error: "Error generando imagen" }
  }
}

// --- Category image ---

export async function generateCategoryImage(
  categoryId: string,
  categoryName: string,
  productNames: string[]
): Promise<{ success: boolean; error?: string; imageUrl?: string }> {
  await requireStaff()

  const productsContext = productNames.length > 0
    ? `This category includes drinks like: ${productNames.slice(0, 5).join(", ")}.`
    : ""

  const prompt = `Generate a photo: ${STARBUCKS_STYLE} Create a category hero image for "${categoryName}" at a premium café. ${productsContext} Instead of showing one specific drink, capture the FEELING and EXPERIENCE of this category — the textures, colors, and mood. For example: if it's "Frappes" show a beautiful arrangement of blended icy drinks; if it's "Café" show steam rising from a perfect cup; if it's "Smoothies" show vibrant tropical fruits and blended colors. Make it feel like a lifestyle photo from a Starbucks seasonal campaign.`

  try {
    const result = await callGeminiImage(prompt, "1:1")
    if (!result.success) return result

    const ext = result.mimeType!.includes("png") ? "png" : "jpg"
    const { publicUrl } = await uploadImage(
      `cat-${categoryId}-${Date.now()}.${ext}`,
      result.buffer!,
      result.mimeType!
    )

    const supabase = createAdminClient()
    const { error } = await supabase
      .from("categories")
      .update({ image_url: publicUrl })
      .eq("id", categoryId)

    if (error) return { success: false, error: `DB error: ${error.message}` }

    revalidatePath("/")
    revalidatePath("/staff/admin")
    return { success: true, imageUrl: publicUrl }
  } catch (err) {
    console.error("Category image error:", err)
    return { success: false, error: "Error generando imagen" }
  }
}
