"use client"

import { useState, useMemo } from "react"
import type { Product, Extra } from "@/features/menu-public/types/menu"
import { useOrderStore } from "../store/order-store"

function groupExtrasByPrice(extras: Extra[]): { price: number; items: Extra[] }[] {
  const groups = new Map<number, Extra[]>()
  for (const extra of extras) {
    const existing = groups.get(extra.price) ?? []
    existing.push(extra)
    groups.set(extra.price, existing)
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([price, items]) => ({ price, items }))
}

export function AddToOrder({
  product,
  extras,
  onAdded,
}: {
  product: Product
  extras: Extra[]
  onAdded?: () => void
}) {
  const addItem = useOrderStore((s) => s.addItem)

  const hasSize = product.precio_m !== null || product.precio_g !== null
  const hasSabores = product.sabores.length > 0

  const defaultSize = hasSize
    ? product.precio_m !== null ? "M" : "G"
    : null

  const [size, setSize] = useState<"M" | "G" | null>(defaultSize as "M" | "G" | null)
  const [sabor, setSabor] = useState<string | null>(
    hasSabores ? product.sabores[0] : null
  )
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [showConfirm, setShowConfirm] = useState(false)

  const extraGroups = useMemo(() => groupExtrasByPrice(extras), [extras])

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
    setTimeout(() => {
      setShowConfirm(false)
      onAdded?.()
    }, 800)
  }

  if (!product.is_available) return null

  return (
    <div className="space-y-5">
      {/* Size selector */}
      {hasSize && (
        <div>
          <label className="text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-2.5 block">
            Tamaño
          </label>
          <div className="flex gap-2.5">
            {product.precio_m !== null && (
              <button
                onClick={() => setSize("M")}
                className={`flex-1 py-3.5 rounded-2xl text-base font-extrabold transition-all border-2 ${
                  size === "M"
                    ? "bg-[#F4A261] text-white border-[#F4A261] shadow-md shadow-[#F4A261]/20"
                    : "bg-white text-[#3D2B1F]/70 border-[#C8956C]/15 hover:border-[#F4A261]/40"
                }`}
              >
                Mediano · ${product.precio_m}
              </button>
            )}
            {product.precio_g !== null && (
              <button
                onClick={() => setSize("G")}
                className={`flex-1 py-3.5 rounded-2xl text-base font-extrabold transition-all border-2 ${
                  size === "G"
                    ? "bg-[#F4A261] text-white border-[#F4A261] shadow-md shadow-[#F4A261]/20"
                    : "bg-white text-[#3D2B1F]/70 border-[#C8956C]/15 hover:border-[#F4A261]/40"
                }`}
              >
                Grande · ${product.precio_g}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Precio único */}
      {product.precio_unico !== null && !hasSize && (
        <div>
          <label className="text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-2.5 block">
            Precio
          </label>
          <div className="price-tag text-lg py-2.5 px-5 inline-block">
            ${product.precio_unico}
          </div>
        </div>
      )}

      {/* Sabor selector */}
      {hasSabores && (
        <div>
          <label className="text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-2.5 block">
            Sabor
          </label>
          <div className="flex flex-wrap gap-2">
            {product.sabores.map((s) => (
              <button
                key={s}
                onClick={() => setSabor(s)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all border-2 ${
                  sabor === s
                    ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                    : "bg-white text-[#3D2B1F]/70 border-[#C8956C]/15 hover:border-[#3D2B1F]/30"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extras — grouped by price */}
      {extraGroups.length > 0 && (
        <div>
          <label className="text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-3 block">
            Personaliza tu bebida
          </label>
          <div className="space-y-3.5">
            {extraGroups.map(({ price, items }) => (
              <div key={price}>
                <span className="text-sm font-bold text-[#F4A261] mb-2 block">
                  +${price}{items.length > 1 ? " c/u" : ""}
                </span>
                <div className="flex flex-wrap gap-2">
                  {items.map((extra) => (
                    <button
                      key={extra.id}
                      onClick={() => toggleExtra(extra.name)}
                      className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all border ${
                        selectedExtras.includes(extra.name)
                          ? "bg-[#3D2B1F] text-white border-[#3D2B1F]"
                          : "bg-[#FFF8F0] text-[#3D2B1F]/70 border-[#C8956C]/15 hover:border-[#C8956C]/30"
                      }`}
                    >
                      {extra.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add button */}
      <div className="pt-2">
        <button
          onClick={handleAdd}
          disabled={showConfirm}
          className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all active:scale-[0.97] ${
            showConfirm
              ? "bg-green-500 text-white"
              : "bg-[#F4A261] text-white hover:bg-[#e8914f] shadow-lg shadow-[#F4A261]/25"
          }`}
        >
          {showConfirm ? "✓ Agregado al pedido!" : `Agrega y pide por WhatsApp — $${getPrice()}`}
        </button>
        <p className="text-center text-sm text-[#3D2B1F]/50 mt-3 font-medium">
          ¿Solo ves el menú? Cierra y pide directo en mostrador
        </p>
      </div>
    </div>
  )
}
