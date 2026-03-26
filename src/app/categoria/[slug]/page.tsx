import Link from "next/link"
import { notFound } from "next/navigation"
import { MenuHeader } from "@/features/menu-public/components/menu-header"
import { ProductList } from "@/features/menu-public/components/product-list"
import { OrderSummary } from "@/features/whatsapp-order/components/order-summary"
import { WhatsAppButton } from "@/features/whatsapp-order/components/whatsapp-button"
import {
  getCategoryBySlug,
  getProductsByCategory,
  getExtras,
} from "@/features/menu-public/services/menu-queries"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) notFound()

  const [products, extras] = await Promise.all([
    getProductsByCategory(category.id),
    getExtras(),
  ])

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-24">
      <MenuHeader />

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/"
            className="text-sm text-[#3D2B1F]/50 hover:text-[#F4A261] transition-colors"
          >
            ← Menú
          </Link>
        </div>

        {/* Category header */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ backgroundColor: `${category.color}40` }}
        >
          <span className="text-4xl">{category.emoji}</span>
          <div>
            <h2 className="text-xl font-bold text-[#3D2B1F]">{category.name}</h2>
            <p className="text-sm text-[#3D2B1F]/60">
              {products.length} {products.length === 1 ? "producto" : "productos"}
            </p>
          </div>
        </div>

        {/* Order summary */}
        <OrderSummary />

        {/* Products */}
        <ProductList
          products={products}
          categoryColor={category.color ?? "#f5f5f5"}
          categoryEmoji={category.emoji ?? "🐥"}
          extras={extras}
        />
      </div>

      {/* WhatsApp sticky button */}
      <WhatsAppButton />
    </div>
  )
}
