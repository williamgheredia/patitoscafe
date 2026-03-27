import { NextResponse } from "next/server"
import sharp from "sharp"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "@/features/loyalty/services/pin-actions"

export async function POST(request: Request) {
  try {
    const session = await getStaffSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "icon" or "favicon"

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const supabase = createAdminClient()

    let processedBuffer: Buffer
    let contentType: string
    let path: string
    let settingKey: string

    if (type === "favicon") {
      processedBuffer = await sharp(Buffer.from(arrayBuffer))
        .resize(32, 32, { fit: "cover" })
        .png()
        .toBuffer()
      contentType = "image/png"
      path = `favicon-${Date.now()}.png`
      settingKey = "favicon_url"
    } else {
      processedBuffer = await sharp(Buffer.from(arrayBuffer))
        .resize(512, 512, { fit: "cover" })
        .webp({ quality: 90 })
        .toBuffer()
      contentType = "image/webp"
      path = `app-icon-${Date.now()}.webp`
      settingKey = "icon_url"
    }

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, processedBuffer, { contentType, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path)
    const url = data.publicUrl

    await supabase.from("app_settings").update({ value: url }).eq("key", settingKey)

    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload icon error:", err)
    return NextResponse.json({ error: "Error al procesar imagen" }, { status: 500 })
  }
}
