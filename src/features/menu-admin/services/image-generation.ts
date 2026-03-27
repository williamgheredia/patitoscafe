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

  const prompt = `Generate a photo: ${STARBUCKS_STYLE}

IMPORTANT: The drink is EXACTLY a "${productName}". This is the SPECIFIC drink you must show — not a generic café drink.

Rules for "${productName}":
- If the name contains "Espresso": show a small ceramic espresso cup with dark concentrated coffee, crema on top. NOT a frappe, NOT a large drink.
- If the name contains "Americano": show a clear glass or ceramic mug with black coffee, slightly transparent. NOT a latte.
- If the name contains "Capuccino" or "Latte": show a ceramic cup with steamed milk and latte art on top.
- If the name contains "Moka": show a coffee drink with visible chocolate swirls.
- If the name contains "Frappe": show a tall clear plastic cup with blended icy drink, whipped cream on top, straw.
- If the name contains "Smoothie" or "Licuado": show a tall glass with vibrant blended fruit, bright colors.
- If the name contains "Té" or "Tea" or "Chai": show a clear glass cup with tea, you can see through the liquid.
- If the name contains "Soda": show a tall glass with sparkling colored drink, ice, bubbles visible.
- If the name contains "Matcha": show vibrant green colored drink.
- If the name contains "Taro": show purple/lavender colored drink.
- Otherwise: show a beautiful "${productName}" drink in the style of category "${categoryName}".

The drink must be RECOGNIZABLE as "${productName}". Do not substitute with a different drink type.`

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
