import { createClient } from "@/lib/supabase/server"
import { MenuHeader } from "@/features/menu-public/components/menu-header"
import Link from "next/link"

export const revalidate = 60 // revalidate every minute

async function getNotifications() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("push_notifications_log")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })
    .limit(30)
  return data ?? []
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins}min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" })
}

export default async function NotificacionesPage() {
  const notifications = await getNotifications()

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <MenuHeader />
      <div className="max-w-lg mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-[#C8956C]/15 text-[#3D2B1F]/60 hover:text-[#F4A261] transition-colors"
          >
            ←
          </Link>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-black text-[#3D2B1F] tracking-tight">
              Promos y Avisos
            </h1>
            <p className="text-sm text-[#3D2B1F]/50">
              Novedades de Patitos Café
            </p>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🐥</div>
            <p className="text-[#3D2B1F]/50 text-lg font-medium">
              Aún no hay avisos
            </p>
            <p className="text-[#3D2B1F]/35 text-sm mt-1">
              Suscríbete para enterarte de promos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div
                key={n.id}
                className="bg-white rounded-2xl p-4 border border-[#C8956C]/10 shadow-sm"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🔔</span>
                      <h3 className="font-bold text-[#3D2B1F] text-[15px] truncate">
                        {n.title}
                      </h3>
                    </div>
                    <p className="text-[#3D2B1F]/65 text-sm leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                  <span className="text-xs text-[#3D2B1F]/35 whitespace-nowrap mt-1">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
