import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { PinLogin } from "@/features/loyalty/components/pin-login"
import { AdminSettings } from "@/features/menu-admin/components/admin-settings"
import { getAppSettings } from "@/features/menu-admin/services/settings-actions"
import { StaffHeader } from "../admin/staff-header"

export default async function StaffConfigPage() {
  const session = await getStaffSession()
  if (!session) return <PinLogin />

  const settings = await getAppSettings()

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <StaffHeader employeeName={session.employeeName} />
      <div className="max-w-lg mx-auto px-4 py-6">
        <h2 className="text-xl font-extrabold text-[#3D2B1F] mb-1">Configuración</h2>
        <p className="text-sm text-[#3D2B1F]/40 mb-6">Personaliza la app de Patitos</p>
        <AdminSettings settings={settings} />
      </div>
    </div>
  )
}
