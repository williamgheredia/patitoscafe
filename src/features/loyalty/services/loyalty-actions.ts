"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "./pin-actions"

async function requireStaff() {
  const session = await getStaffSession()
  if (!session) throw new Error("No autorizado")
  return session
}

export async function lookupCard(whatsapp: string) {
  const supabase = createAdminClient()
  const clean = whatsapp.replace(/\D/g, "")

  const { data, error } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("whatsapp_number", clean)
    .single()

  if (error?.code === "PGRST116") return null // not found
  if (error) throw error
  return data
}

export async function addStamp(whatsapp: string, customerName?: string) {
  const session = await requireStaff()
  const supabase = createAdminClient()
  const clean = whatsapp.replace(/\D/g, "")

  // Upsert card
  let { data: card } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("whatsapp_number", clean)
    .single()

  if (!card) {
    const { data: newCard, error: createError } = await supabase
      .from("loyalty_cards")
      .insert({
        whatsapp_number: clean,
        customer_name: customerName || null,
        stamps_count: 0,
      })
      .select()
      .single()

    if (createError) throw createError
    card = newCard
  }

  if (card.stamps_count >= 10) {
    return { success: false, error: "La tarjeta está llena (10/10). Canjea primero.", card }
  }

  // Add stamp atomically
  const { error: updateError } = await supabase
    .from("loyalty_cards")
    .update({
      stamps_count: card.stamps_count + 1,
      customer_name: customerName || card.customer_name,
    })
    .eq("id", card.id)
    .eq("stamps_count", card.stamps_count) // optimistic lock

  if (updateError) throw updateError

  // Log event
  await supabase.from("loyalty_events").insert({
    card_id: card.id,
    event_type: "stamp",
    employee_id: session.employeeId,
  })

  return {
    success: true,
    card: { ...card, stamps_count: card.stamps_count + 1 },
  }
}

export async function redeemDrink(whatsapp: string) {
  const session = await requireStaff()
  const supabase = createAdminClient()
  const clean = whatsapp.replace(/\D/g, "")

  const { data: card, error: findError } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("whatsapp_number", clean)
    .single()

  if (findError || !card) {
    return { success: false, error: "Tarjeta no encontrada" }
  }

  if (card.stamps_count < 10) {
    return { success: false, error: `Faltan ${10 - card.stamps_count} sellos para canjear`, card }
  }

  // Reset stamps, increment redeemed
  const { error: updateError } = await supabase
    .from("loyalty_cards")
    .update({
      stamps_count: 0,
      total_redeemed: card.total_redeemed + 1,
    })
    .eq("id", card.id)
    .eq("stamps_count", 10) // optimistic lock

  if (updateError) throw updateError

  // Log event
  await supabase.from("loyalty_events").insert({
    card_id: card.id,
    event_type: "redeem",
    employee_id: session.employeeId,
  })

  return {
    success: true,
    card: { ...card, stamps_count: 0, total_redeemed: card.total_redeemed + 1 },
  }
}
