"use client"

import { createClient } from "@/lib/supabase/client"

let sessionId: string | null = null

function getSessionId(): string {
  if (sessionId) return sessionId
  sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36)
  return sessionId
}

export async function trackProductView(productId: string) {
  const supabase = createClient()
  await supabase.from("product_views").insert({
    product_id: productId,
    session_id: getSessionId(),
  })
}
