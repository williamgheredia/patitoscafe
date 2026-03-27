"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { revalidatePath } from "next/cache"

async function requireStaff() {
  const session = await getStaffSession()
  if (!session) throw new Error("No autorizado")
  return session
}

export async function generateProductDescription(
  productId: string,
  productName: string,
  categoryName: string,
  sabores: string[]
): Promise<{ success: boolean; error?: string; description?: string }> {
  await requireStaff()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return { success: false, error: "OPENROUTER_API_KEY no configurada" }
  }

  const saboresText = sabores.length > 0
    ? `Sabores disponibles: ${sabores.join(", ")}.`
    : ""

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
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `Eres el copywriter de Patitos Café, una cafetería cute y playful en Cancún. Escribes descripciones de productos para el menú digital. Tu tono es: cálido, amigable, joven, con un toque juguetón. Usas máximo 1-2 oraciones cortas. NUNCA uses emojis. NUNCA uses exclamaciones excesivas. Solo devuelve la descripción, nada más.`
          },
          {
            role: "user",
            content: `Escribe una descripción breve y aesthetic para el menú de: "${productName}" (categoría: ${categoryName}). ${saboresText} Máximo 15 palabras. Que suene natural, como si un barista lo describiera a un amigo.`
          }
        ],
        max_tokens: 80,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter error:", errorData)
      return { success: false, error: `API error: ${response.status}` }
    }

    const data = await response.json()
    const description = data.choices?.[0]?.message?.content?.trim()

    if (!description) {
      return { success: false, error: "No se generó descripción" }
    }

    // Save to DB
    const supabase = createAdminClient()
    const { error: updateError } = await supabase
      .from("products")
      .update({ description })
      .eq("id", productId)

    if (updateError) {
      return { success: false, error: `DB error: ${updateError.message}` }
    }

    revalidatePath("/")
    revalidatePath("/staff/admin")

    return { success: true, description }
  } catch (err) {
    console.error("Description generation error:", err)
    return { success: false, error: "Error generando descripción" }
  }
}
