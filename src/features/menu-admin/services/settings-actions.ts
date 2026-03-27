"use server"

import sharp from "sharp"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "@/features/loyalty/services/pin-actions"

async function requireStaff() {
  const session = await getStaffSession()
  if (!session) throw new Error("No autorizado")
  return session
}

export async function getAppSettings(): Promise<Record<string, string>> {
  const supabase = createAdminClient()
  const { data } = await supabase.from("app_settings").select("key, value")
  const settings: Record<string, string> = {}
  for (const row of data ?? []) {
    settings[row.key] = row.value
  }
  return settings
}

export async function updateAppSetting(key: string, value: string) {
  await requireStaff()
  const supabase = createAdminClient()

  const { error } = await supabase
    .from("app_settings")
    .update({ value })
    .eq("key", key)

  if (error) throw error
  revalidatePath("/")
  revalidatePath("/staff/admin")
}

export async function uploadAppIcon(formData: FormData): Promise<{ url: string }> {
  await requireStaff()
  const supabase = createAdminClient()

  const file = formData.get("icon") as File
  if (!file || file.size === 0) throw new Error("No file")

  const arrayBuffer = await file.arrayBuffer()

  // Generate 512x512 WebP icon
  const iconBuffer = await sharp(Buffer.from(arrayBuffer))
    .resize(512, 512, { fit: "cover" })
    .webp({ quality: 90 })
    .toBuffer()

  const path = `app-icon-${Date.now()}.webp`

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, iconBuffer, { contentType: "image/webp", upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from("product-images").getPublicUrl(path)
  const url = data.publicUrl

  // Save to settings
  await supabase.from("app_settings").update({ value: url }).eq("key", "icon_url")

  revalidatePath("/")
  revalidatePath("/staff/admin")
  return { url }
}

export async function uploadFavicon(formData: FormData): Promise<{ url: string }> {
  await requireStaff()
  const supabase = createAdminClient()

  const file = formData.get("favicon") as File
  if (!file || file.size === 0) throw new Error("No file")

  const arrayBuffer = await file.arrayBuffer()

  // Generate 32x32 PNG favicon
  const faviconBuffer = await sharp(Buffer.from(arrayBuffer))
    .resize(32, 32, { fit: "cover" })
    .png()
    .toBuffer()

  const path = `favicon-${Date.now()}.png`

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, faviconBuffer, { contentType: "image/png", upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from("product-images").getPublicUrl(path)
  const url = data.publicUrl

  await supabase.from("app_settings").update({ value: url }).eq("key", "favicon_url")

  revalidatePath("/")
  revalidatePath("/staff/admin")
  return { url }
}
