import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

async function getSettings() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["app_name", "app_description", "icon_url", "theme_color"])

    const settings: Record<string, string> = {}
    for (const row of data ?? []) {
      settings[row.key] = row.value
    }
    return settings
  } catch {
    return {}
  }
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings()

  const name = s.app_name || "Patitos Café"
  const description = s.app_description || "Menú digital de Patitos Café"
  const themeColor = s.theme_color || "#FFF8F0"
  const hasCustomIcon = !!s.icon_url

  const icons = hasCustomIcon
    ? [
        { src: s.icon_url, sizes: "512x512", type: "image/png", purpose: "any" as const },
        { src: s.icon_url, sizes: "192x192", type: "image/png", purpose: "maskable" as const },
      ]
    : [
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" as const },
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" as const },
      ]

  return {
    name,
    short_name: name.split(" ")[0] ?? "Patitos",
    description,
    start_url: "/",
    display: "standalone",
    background_color: themeColor,
    theme_color: themeColor,
    orientation: "portrait",
    icons,
  }
}
