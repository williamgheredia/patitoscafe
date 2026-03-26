"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "@/features/loyalty/services/pin-actions"

async function requireStaff() {
  const session = await getStaffSession()
  if (!session) throw new Error("No autorizado")
  return session
}

// --- Products ---

export async function createProduct(formData: FormData): Promise<string> {
  await requireStaff()
  const supabase = createAdminClient()

  const saboresRaw = formData.get("sabores") as string
  const sabores = saboresRaw
    ? saboresRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const { data, error } = await supabase.from("products").insert({
    category_id: formData.get("category_id") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    precio_m: formData.get("precio_m") ? Number(formData.get("precio_m")) : null,
    precio_g: formData.get("precio_g") ? Number(formData.get("precio_g")) : null,
    precio_unico: formData.get("precio_unico") ? Number(formData.get("precio_unico")) : null,
    sabores,
    is_available: true,
  }).select("id").single()

  if (error) throw error
  revalidatePath("/")
  revalidatePath("/staff/admin")
  return data.id
}

export async function updateProduct(id: string, formData: FormData) {
  await requireStaff()
  const supabase = createAdminClient()

  const saboresRaw = formData.get("sabores") as string
  const sabores = saboresRaw
    ? saboresRaw.split(",").map((s) => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from("products")
    .update({
      category_id: formData.get("category_id") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      precio_m: formData.get("precio_m") ? Number(formData.get("precio_m")) : null,
      precio_g: formData.get("precio_g") ? Number(formData.get("precio_g")) : null,
      precio_unico: formData.get("precio_unico") ? Number(formData.get("precio_unico")) : null,
      sabores,
    })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/")
  revalidatePath("/staff/admin")
}

export async function deleteProduct(id: string) {
  await requireStaff()
  const supabase = createAdminClient()

  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/staff/admin")
}

export async function toggleProductAvailability(id: string, available: boolean) {
  await requireStaff()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("products")
    .update({ is_available: available })
    .eq("id", id)

  if (error) throw error
  revalidatePath("/")
  revalidatePath("/staff/disponibilidad")
}

// --- Categories ---

export async function createCategory(formData: FormData) {
  await requireStaff()
  const supabase = createAdminClient()

  const name = formData.get("name") as string
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    emoji: (formData.get("emoji") as string) || null,
    color: (formData.get("color") as string) || "#f5f5f5",
  })

  if (error) throw error
  revalidatePath("/")
  revalidatePath("/staff/admin")
}

export async function deleteCategory(id: string) {
  await requireStaff()
  const supabase = createAdminClient()

  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/")
  revalidatePath("/staff/admin")
}

// --- Image upload ---

export async function uploadProductImage(productId: string, formData: FormData) {
  await requireStaff()
  const supabase = createAdminClient()

  const file = formData.get("image") as File
  if (!file || file.size === 0) return

  const ext = file.name.split(".").pop()
  const path = `${productId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("products")
    .update({ image_url: urlData.publicUrl })
    .eq("id", productId)

  if (updateError) throw updateError
  revalidatePath("/")
  revalidatePath("/staff/admin")
}
