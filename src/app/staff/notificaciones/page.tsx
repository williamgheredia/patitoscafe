import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { PinLogin } from "@/features/loyalty/components/pin-login"
import { StaffHeader } from "../admin/staff-header"
import { getSubscriberCount, getNotificationLog } from "@/features/menu-admin/services/push-actions"
import { SendNotificationForm } from "./send-form"
import { NotificationLog } from "./notification-log"

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

        <SendNotificationForm subscriberCount={subscriberCount} />

        <NotificationLog entries={log} />
      </div>
    </div>
  )
}
