"use client"

import { useState } from "react"
import type { Product, Extra } from "@/features/menu-public/types/menu"
import { useOrderStore } from "../store/order-store"

export function AddToOrder({
  product,
  extras,
}: {
  product: Product
  extras: Extra[]
}) {
  const addItem = useOrderStore((s) => s.addItem)

  const hasSize = product.precio_m !== null || product.precio_g !== null
  const hasSabores = product.sabores.length > 0

  const defaultSize = hasSize
    ? product.precio_m !== null
      ? "M"
      : "G"
    : null

  const [size, setSize] = useState<"M" | "G" | null>(defaultSize as "M" | "G" | null)
  const [sabor, setSabor] = useState<string | null>(
    hasSabores ? product.sabores[0] : null
  )
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  function getPrice(): number {
    let base = 0
    if (product.precio_unico) {
      base = product.precio_unico
    } else if (size === "M" && product.precio_m) {
      base = product.precio_m
    } else if (size === "G" && product.precio_g) {
      base = product.precio_g
    }
    const extrasTotal = selectedExtras.reduce((sum, name) => {
      const extra = extras.find((e) => e.name === name)
      return sum + (extra?.price ?? 0)
    }, 0)
    return base + extrasTotal
  }

  function toggleExtra(name: string) {
    setSelectedExtras((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    )
  }

  function handleAdd() {
    addItem({
      productId: product.id,
      productName: product.name,
      size: hasSize ? size : "unico",
      sabor,
      extras: selectedExtras,
      price: getPrice(),
    })
    setShowConfirm(true)
    setTimeout(() => setShowConfirm(false), 2000)
  }

  if (!product.is_available) return null

  return (
    <div className="mt-3 space-y-3">
      {/* Size selector */}
      {hasSize && (
        <div className="flex gap-2">
          {product.precio_m !== null && (
            <button
              onClick={() => setSize("M")}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                size === "M"
                  ? "bg-[#F4A261] text-white"
                  : "bg-white/60 text-[#3D2B1F]/70"
              }`}
            >
              M — ${product.precio_m}
            </button>
          )}
          {product.precio_g !== null && (
            <button
              onClick={() => setSize("G")}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                size === "G"
                  ? "bg-[#F4A261] text-white"
                  : "bg-white/60 text-[#3D2B1F]/70"
              }`}
            >
              G — ${product.precio_g}
            </button>
          )}
        </div>
      )}

      {/* Sabor selector */}
      {hasSabores && (
        <div className="flex flex-wrap gap-1.5">
          {product.sabores.map((s) => (
            <button
              key={s}
              onClick={() => setSabor(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                sabor === s
                  ? "bg-[#F4A261] text-white"
                  : "bg-white/60 text-[#3D2B1F]/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Extras */}
      {extras.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {extras.map((extra) => (
            <button
              key={extra.id}
              onClick={() => toggleExtra(extra.name)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedExtras.includes(extra.name)
                  ? "bg-[#3D2B1F] text-white"
                  : "bg-white/60 text-[#3D2B1F]/60"
              }`}
            >
              +{extra.name} ${extra.price}
            </button>
          ))}
        </div>
      )}

      {/* Add button */}
      <button
        onClick={handleAdd}
        className="w-full py-2.5 rounded-xl bg-[#F4A261] text-white font-bold text-sm hover:bg-[#e8914f] active:scale-95 transition-all"
      >
        {showConfirm ? "✓ Agregado!" : `Agregar — $${getPrice()}`}
      </button>
    </div>
  )
}
