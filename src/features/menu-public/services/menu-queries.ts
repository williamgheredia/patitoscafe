"use server"

import { createClient } from "@/lib/supabase/server"
import type { Category, Product, Extra } from "../types/menu"

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) throw error
  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (error) return null
  return data
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .order("display_order")

  if (error) throw error
  return data ?? []
}

export async function getExtras(): Promise<Extra[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("extras")
    .select("*")
    .eq("is_active", true)
    .order("display_order")

  if (error) throw error
  return data ?? []
}
