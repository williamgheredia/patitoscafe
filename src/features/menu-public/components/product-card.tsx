"use client"

import { useState } from "react"
import type { Product, Extra } from "../types/menu"
import { AddToOrder } from "@/features/whatsapp-order/components/add-to-order"
import { trackProductView } from "@/features/analytics/services/track-view"

function formatPrice(product: Product): string {
  if (product.precio_unico) return `$${product.precio_unico}`
  if (product.precio_m && product.precio_g) return `$${product.precio_m} / $${product.precio_g}`
  if (product.precio_m) return `$${product.precio_m}`
  if (product.precio_g) return `$${product.precio_g}`
  return ""
}

function formatSizeLabel(product: Product): string | null {
  if (product.precio_unico) return null
  if (product.precio_m && product.precio_g) return "M / G"
  if (product.precio_m) return "M"
  if (product.precio_g) return "G"
  return null
}

export function ProductCard({
  product,
  categoryColor,
  categoryEmoji,
  extras,
}: {
  product: Product
  categoryColor: string
  categoryEmoji: string
  extras: Extra[]
}) {
  const [expanded, setExpanded] = useState(false)
  const sizeLabel = formatSizeLabel(product)

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all ${
        !product.is_available ? "opacity-50" : "cursor-pointer"
      } ${expanded ? "col-span-2" : ""}`}
      style={{ backgroundColor: `${categoryColor}30` }}
      onClick={() => {
        if (product.is_available && !expanded) {
          setExpanded(true)
          trackProductView(product.id)
        }
      }}
    >
      {!product.is_available && (
        <div className="absolute top-2 right-2 z-10 bg-[#3D2B1F] text-white text-xs font-bold px-2 py-1 rounded-full">
          🐥 Agotado
        </div>
      )}

      <div className="flex flex-col">
        {!expanded && (
          <>
            {product.image_url ? (
              <div className="aspect-square bg-white/50">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center" style={{ backgroundColor: `${categoryColor}50` }}>
                <span className="text-5xl">{categoryEmoji}</span>
              </div>
            )}
          </>
        )}

        <div className="p-3">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-[#3D2B1F] text-sm leading-tight">{product.name}</h3>
            {expanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(false)
                }}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/60 text-[#3D2B1F]/50 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {product.sabores.length > 0 && !expanded && (
            <p className="text-xs text-[#3D2B1F]/60 mt-1 line-clamp-2">
              {product.sabores.join(" · ")}
            </p>
          )}

          {!expanded && (
            <div className="flex items-end justify-between mt-2">
              <div>
                <span className="text-base font-bold text-[#F4A261]">{formatPrice(product)}</span>
                {sizeLabel && <span className="text-xs text-[#3D2B1F]/50 ml-1">{sizeLabel}</span>}
              </div>
            </div>
          )}

          {expanded && product.is_available && (
            <AddToOrder product={product} extras={extras} />
          )}
        </div>
      </div>
    </div>
  )
}
