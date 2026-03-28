import { createClient } from "@/lib/supabase/server"
import { NotificationBell } from "./notification-bell"

async function getNotificationCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("push_notifications_log")
    .select("*", { count: "exact", head: true })
  return count ?? 0
}

export async function MenuHeader() {
  const totalCount = await getNotificationCount()

  return (
    <header className="sticky top-0 z-40 glass border-b border-[#C8956C]/10">
      <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl group-hover:animate-float transition-transform">🐥</span>
          <div className="leading-none">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-black text-[#3D2B1F] tracking-tight italic">
              Patitos Café
            </h1>
            <p className="text-xs font-bold text-[#C8956C] uppercase tracking-[0.12em] mt-0.5">
              & Drinks
            </p>
          </div>
        </a>
        <div className="flex items-center gap-2">
          <NotificationBell totalCount={totalCount} />
          <a
            href="/mi-tarjeta"
            className="flex items-center gap-1.5 text-sm font-bold text-[#3D2B1F]/70 hover:text-[#F4A261] transition-colors bg-white/60 px-4 py-2 rounded-full border border-[#C8956C]/15"
          >
            <span className="text-base">🐥</span>
            Mi Tarjeta
          </a>
        </div>
      </div>
    </header>
  )
}
