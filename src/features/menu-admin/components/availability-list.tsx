"use client"

import { useRouter } from "next/navigation"
import type { Product, Category } from "@/features/menu-public/types/menu"
import { toggleProductAvailability } from "../services/menu-actions"

export function AvailabilityList({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const router = useRouter()
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  // Group by category
  const grouped = categories.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.category_id === cat.id),
  })).filter((g) => g.products.length > 0)

  async function handleToggle(id: string, current: boolean) {
    await toggleProductAvailability(id, !current)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-[#3D2B1F]">Disponibilidad del Día</h2>
      <p className="text-xs text-[#3D2B1F]/50 -mt-4">
        Activa o desactiva productos para hoy
      </p>

      {grouped.map(({ category, products }) => (
        <div key={category.id}>
          <h3 className="font-bold text-sm text-[#3D2B1F] mb-2">
            {category.emoji} {category.name}
          </h3>
          <div className="space-y-1">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-white rounded-xl px-3 py-2"
              >
                <span
                  className={`text-sm ${
                    product.is_available ? "text-[#3D2B1F]" : "text-[#3D2B1F]/40 line-through"
                  }`}
                >
                  {product.name}
                </span>
                <button
                  onClick={() => handleToggle(product.id, product.is_available)}
                  className={`w-12 h-7 rounded-full transition-colors relative ${
                    product.is_available ? "bg-green-400" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      product.is_available ? "left-[calc(100%-1.625rem)]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
