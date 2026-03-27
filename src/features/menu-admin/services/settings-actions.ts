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
  revalidatePath("/staff/config")
}

export async function uploadAppIcon(base64Data: string): Promise<{ url: string }> {
  await requireStaff()
  const supabase = createAdminClient()

  const buffer = Buffer.from(base64Data, "base64")

  const iconBuffer = await sharp(buffer)
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

  await supabase.from("app_settings").update({ value: url }).eq("key", "icon_url")

  revalidatePath("/")
  revalidatePath("/staff/config")
  return { url }
}

export async function uploadFavicon(base64Data: string): Promise<{ url: string }> {
  await requireStaff()
  const supabase = createAdminClient()

  const buffer = Buffer.from(base64Data, "base64")

  const faviconBuffer = await sharp(buffer)
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
  revalidatePath("/staff/config")
  return { url }
}
