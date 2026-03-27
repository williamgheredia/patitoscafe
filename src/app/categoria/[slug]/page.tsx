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
    <div className="min-h-screen bg-[#FFF8F0] pb-8">
      <MenuHeader />

      <div className="max-w-lg mx-auto">
        {/* Category banner */}
        <div
          className="relative mx-4 mt-4 rounded-[24px] overflow-hidden"
          style={{ backgroundColor: `${category.color}50` }}
        >
          {/* Decorative shapes */}
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
            style={{ backgroundColor: category.color ?? undefined }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-15"
            style={{ backgroundColor: category.color ?? undefined }}
          />

          <div className="relative px-6 py-6">
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#3D2B1F]/60 hover:text-[#F4A261] transition-colors mb-4 uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Menú
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-5xl">{category.emoji}</span>
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-black text-[#3D2B1F] tracking-tight italic leading-tight">
                  {category.name}
                </h2>
                <p className="text-sm text-[#3D2B1F]/60 font-bold mt-1">
                  {products.length} {products.length === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-5">
          <OrderSummary />

          <ProductList
            products={products}
            categoryColor={category.color ?? "#f5f5f5"}
            categoryEmoji={category.emoji ?? "🐥"}
            extras={extras}
          />
        </div>
      </div>

      <WhatsAppButton />
    </div>
  )
}
