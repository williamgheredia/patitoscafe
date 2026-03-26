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
      <div className="text-center py-16 animate-fade-up">
        <span className="text-6xl block mb-3">🐥</span>
        <p className="text-sm text-[#3D2B1F]/40 font-bold">
          No hay productos aquí todavía
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 stagger-children">
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
