"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product, Category } from "@/features/menu-public/types/menu"
import { ProductForm } from "./product-form"
import { deleteProduct } from "../services/menu-actions"

export function AdminProductList({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const router = useRouter()

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    await deleteProduct(id)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#3D2B1F]">Productos ({products.length})</h2>
        <button
          onClick={() => setShowNew(!showNew)}
          className="px-4 py-2 rounded-xl bg-[#F4A261] text-white text-sm font-bold"
        >
          + Nuevo
        </button>
      </div>

      {showNew && (
        <ProductForm
          categories={categories}
          onDone={() => {
            setShowNew(false)
            router.refresh()
          }}
        />
      )}

      {products.map((product) => {
        const cat = categoryMap[product.category_id]

        if (editingId === product.id) {
          return (
            <ProductForm
              key={product.id}
              categories={categories}
              product={product}
              onDone={() => {
                setEditingId(null)
                router.refresh()
              }}
            />
          )
        }

        return (
          <div
            key={product.id}
            className="flex items-center justify-between bg-white rounded-xl p-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat?.emoji}</span>
                <span className="font-bold text-sm text-[#3D2B1F]">{product.name}</span>
                {!product.is_available && (
                  <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                    Agotado
                  </span>
                )}
              </div>
              <div className="text-xs text-[#3D2B1F]/50 mt-0.5">
                {product.precio_unico
                  ? `$${product.precio_unico}`
                  : `M: $${product.precio_m ?? "-"} / G: $${product.precio_g ?? "-"}`}
                {product.sabores.length > 0 && ` · ${product.sabores.join(", ")}`}
              </div>
            </div>
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => setEditingId(product.id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F4A261]/10 text-[#F4A261] text-sm"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(product.id, product.name)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-400 text-sm"
              >
                🗑
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
