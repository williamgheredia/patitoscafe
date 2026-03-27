"use client"

import { useState } from "react"
import type { Product, Extra } from "../types/menu"
import { AddToOrder } from "@/features/whatsapp-order/components/add-to-order"
import { trackProductView } from "@/features/analytics/services/track-view"

function formatPrice(product: Product): string {
  if (product.precio_unico) return `$${product.precio_unico}`
  if (product.precio_m && product.precio_g) return `$${product.precio_m}–$${product.precio_g}`
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
  const [orderMode, setOrderMode] = useState(false)
  const sizeLabel = formatSizeLabel(product)

  function handleClose() {
    setExpanded(false)
    setOrderMode(false)
  }

  return (
    <>
      {/* Card */}
      <div
        className={`group relative rounded-[20px] overflow-hidden transition-all duration-300 ${
          !product.is_available
            ? "opacity-45 grayscale-[30%]"
            : "cursor-pointer hover:shadow-[var(--shadow-lift)] hover:-translate-y-1"
        }`}
        style={{ boxShadow: "var(--shadow-card)" }}
        onClick={() => {
          if (product.is_available && !expanded) {
            setExpanded(true)
            trackProductView(product.id)
          }
        }}
      >
        {!product.is_available && (
          <div className="absolute top-3 right-3 z-10 bg-[#3D2B1F] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full tracking-wide uppercase">
            Agotado
          </div>
        )}

        {product.image_url ? (
          <div className="aspect-[3/4] bg-white overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div
            className="aspect-[3/4] flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: `${categoryColor}40` }}
          >
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-20"
              style={{ backgroundColor: categoryColor }}
            />
            <div
              className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full opacity-15"
              style={{ backgroundColor: categoryColor }}
            />
            <span className="text-5xl relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
              {categoryEmoji}
            </span>
          </div>
        )}

        <div className="p-3.5 bg-white">
          <h3 className="font-extrabold text-[#3D2B1F] text-[13px] leading-tight tracking-tight">
            {product.name}
          </h3>

          {product.sabores.length > 0 && (
            <p className="text-[10px] text-[#C8956C] mt-1 line-clamp-1 font-medium">
              {product.sabores.join(" · ")}
            </p>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-1.5">
              <span className="price-tag">{formatPrice(product)}</span>
              {sizeLabel && (
                <span className="text-[9px] font-bold text-[#3D2B1F]/30 uppercase">{sizeLabel}</span>
              )}
            </div>
            {product.is_available && (
              <div className="w-7 h-7 rounded-full bg-[#F4A261]/10 flex items-center justify-center transition-colors group-hover:bg-[#F4A261]/20">
                <svg className="w-3.5 h-3.5 text-[#F4A261]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-lg bg-white rounded-t-[28px] p-6 pt-5 animate-scale-in"
            style={{ maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-[#3D2B1F]/10" />
            </div>

            {/* Product header */}
            <div className="flex items-start gap-4 mb-5">
              {product.image_url ? (
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${categoryColor}40` }}
                >
                  <span className="text-3xl">{categoryEmoji}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-black text-[#3D2B1F] tracking-tight italic leading-tight">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-[#3D2B1F]/50 mt-1">{product.description}</p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3D2B1F]/5 text-[#3D2B1F]/40 hover:bg-[#3D2B1F]/10 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info section — always visible */}
            <div className="space-y-4">
              {/* Prices */}
              <div>
                <label className="text-[10px] font-bold text-[#3D2B1F]/40 uppercase tracking-wider mb-2 block">
                  Precios
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {product.precio_unico !== null && (
                    <div className="price-tag text-base py-2 px-4">
                      ${product.precio_unico}
                    </div>
                  )}
                  {product.precio_m !== null && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="price-tag text-base py-2 px-4">
                        ${product.precio_m}
                      </div>
                      <span className="text-[9px] font-bold text-[#3D2B1F]/30 uppercase">Mediano</span>
                    </div>
                  )}
                  {product.precio_g !== null && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="price-tag text-base py-2 px-4">
                        ${product.precio_g}
                      </div>
                      <span className="text-[9px] font-bold text-[#3D2B1F]/30 uppercase">Grande</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sabores — informational */}
              {product.sabores.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-[#3D2B1F]/40 uppercase tracking-wider mb-2 block">
                    Sabores disponibles
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sabores.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFF8F0] text-[#3D2B1F]/60 border border-[#C8956C]/12"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extras — informational */}
              {extras.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-[#3D2B1F]/40 uppercase tracking-wider mb-2 block">
                    Extras disponibles
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {extras.map((extra) => (
                      <span
                        key={extra.id}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8F0] text-[#3D2B1F]/50 border border-[#C8956C]/12"
                      >
                        {extra.name} <span className="text-[#F4A261]">+${extra.price}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#C8956C]/10 my-5" />

            {/* Order mode toggle / AddToOrder */}
            {!orderMode ? (
              <button
                onClick={() => setOrderMode(true)}
                className="w-full py-3.5 rounded-2xl text-sm font-bold border-2 border-[#C8956C]/20 text-[#3D2B1F]/50 hover:border-[#25D366]/40 hover:text-[#25D366] transition-all flex items-center justify-center gap-2"
              >
                <span>📱</span> Agregar al pedido por WhatsApp
              </button>
            ) : (
              <div className="animate-fade-up">
                <AddToOrder product={product} extras={extras} onAdded={handleClose} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
