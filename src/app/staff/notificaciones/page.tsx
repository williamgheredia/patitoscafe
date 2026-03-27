import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { PinLogin } from "@/features/loyalty/components/pin-login"
import { StaffHeader } from "../admin/staff-header"
import { getSubscriberCount, getNotificationLog } from "@/features/menu-admin/services/push-actions"
import { SendNotificationForm } from "./send-form"

export default async function NotificacionesPage() {
  const session = await getStaffSession()
  if (!session) return <PinLogin />

  const [subscriberCount, log] = await Promise.all([
    getSubscriberCount(),
    getNotificationLog(),
  ])

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <StaffHeader employeeName={session.employeeName} />
      <div className="max-w-lg mx-auto px-4 py-6">
        <h2 className="text-xl font-extrabold text-[#3D2B1F] mb-1">Notificaciones</h2>
        <p className="text-sm text-[#3D2B1F]/40 mb-6">
          Envía avisos a {subscriberCount} suscriptor{subscriberCount !== 1 ? "es" : ""}
        </p>

        {/* Send form */}
        <SendNotificationForm subscriberCount={subscriberCount} />

        {/* Log */}
        {log.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-sm text-[#3D2B1F]/60 mb-3 uppercase tracking-wider">
              Historial
            </h3>
            <div className="space-y-2">
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl p-3 border border-[#C8956C]/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#3D2B1F] truncate">{entry.title}</p>
                      <p className="text-xs text-[#3D2B1F]/50 mt-0.5 line-clamp-2">{entry.body}</p>
                    </div>
                    <span className="text-[10px] text-[#3D2B1F]/30 flex-shrink-0 whitespace-nowrap">
                      {entry.sent_count} enviado{entry.sent_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#3D2B1F]/25 mt-1.5">
                    {new Date(entry.created_at).toLocaleString("es-MX", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
