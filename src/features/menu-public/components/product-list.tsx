"use client"

import type { Product, Extra } from "../types/menu"
import { ProductCard } from "./product-card"

export function ProductList({
  products,
  categoryColor,
  categoryEmoji,
  extras,
}: {
  products: Product[]
  categoryColor: string
  categoryEmoji: string
  extras: Extra[]
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl">🐥</span>
        <p className="mt-3 text-[#3D2B1F]/60 text-sm">
          No hay productos en esta categoría todavía
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryColor={categoryColor}
          categoryEmoji={categoryEmoji}
          extras={extras}
        />
      ))}
    </div>
  )
}
