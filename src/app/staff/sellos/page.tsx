import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { PinLogin } from "@/features/loyalty/components/pin-login"
import { AdminStampForm } from "@/features/loyalty/components/admin-stamp-form"
import { StaffHeader } from "../admin/staff-header"

export default async function SellosPage() {
  const session = await getStaffSession()
  if (!session) return <PinLogin />

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <StaffHeader employeeName={session.employeeName} />
      <div className="max-w-lg mx-auto px-4 py-4">
        <AdminStampForm />
      </div>
    </div>
  )
}
