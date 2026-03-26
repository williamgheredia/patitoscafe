import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { PinLogin } from "@/features/loyalty/components/pin-login"
import { AdminProductList } from "@/features/menu-admin/components/admin-product-list"
import { TopProductsCard } from "@/features/analytics/components/top-products-card"
import { getCategories } from "@/features/menu-public/services/menu-queries"
import { getTopProducts } from "@/features/analytics/services/analytics-queries"
import { createAdminClient } from "@/lib/supabase/admin"
import { StaffHeader } from "./staff-header"

async function getAllProducts() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("display_order")
  if (error) throw error
  return data ?? []
}

export default async function StaffAdminPage() {
  const session = await getStaffSession()
  if (!session) return <PinLogin />

  const [products, categories, topProducts] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getTopProducts(),
  ])

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <StaffHeader employeeName={session.employeeName} />
      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        <TopProductsCard products={topProducts} />
        <AdminProductList products={products} categories={categories} />
      </div>
    </div>
  )
}
