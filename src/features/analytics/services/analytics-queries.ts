"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function getTopProducts(days: number = 7) {
  const supabase = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .rpc("get_top_viewed_products", { since_date: since.toISOString() })

  if (error) {
    // Fallback if RPC doesn't exist yet
    const { data: fallbackData } = await supabase
      .from("product_views")
      .select("product_id, products(name)")
      .gte("created_at", since.toISOString())

    if (!fallbackData) return []

    const counts: Record<string, { name: string; views: number }> = {}
    for (const row of fallbackData) {
      const pid = row.product_id
      const product = row.products as unknown as { name: string } | null
      if (!counts[pid]) {
        counts[pid] = { name: product?.name ?? "?", views: 0 }
      }
      counts[pid].views++
    }

    return Object.entries(counts)
      .map(([id, { name, views }]) => ({ id, name, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
  }

  return data ?? []
}
