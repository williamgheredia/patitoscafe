import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { PinLogin } from "@/features/loyalty/components/pin-login"
import { AvailabilityList } from "@/features/menu-admin/components/availability-list"
import { getCategories } from "@/features/menu-public/services/menu-queries"
import { createAdminClient } from "@/lib/supabase/admin"
import { StaffHeader } from "../admin/staff-header"

async function getAllProducts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("display_order")
  if (error) throw error
  return data ?? []
}

export default async function DisponibilidadPage() {
  const session = await getStaffSession()
  if (!session) return <PinLogin />

  const [products, categories] = await Promise.all([
    getAllProducts(),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <StaffHeader employeeName={session.employeeName} />
      <div className="max-w-lg mx-auto px-4 py-4">
        <AvailabilityList products={products} categories={categories} />
      </div>
    </div>
  )
}
