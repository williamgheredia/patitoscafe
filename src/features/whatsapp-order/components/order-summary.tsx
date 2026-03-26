"use client"

import { useOrderStore } from "../store/order-store"

export function OrderSummary() {
  const items = useOrderStore((s) => s.items)
  const removeItem = useOrderStore((s) => s.removeItem)
  const clearOrder = useOrderStore((s) => s.clearOrder)

  if (items.length === 0) return null

  return (
    <div className="bg-white/70 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-[#3D2B1F] text-sm">Tu pedido 🐥</h3>
        <button
          onClick={clearOrder}
          className="text-xs text-red-400 hover:text-red-600 font-medium"
        >
          Limpiar
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <span className="font-medium text-[#3D2B1F]">{item.productName}</span>
              {item.sabor && (
                <span className="text-[#3D2B1F]/50"> ({item.sabor})</span>
              )}
              {item.size && item.size !== "unico" && (
                <span className="text-[#3D2B1F]/50"> {item.size}</span>
              )}
              {item.extras.length > 0 && (
                <span className="text-[#3D2B1F]/40 text-xs block">
                  + {item.extras.join(", ")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="font-bold text-[#F4A261]">${item.price}</span>
              <button
                onClick={() => removeItem(i)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-xs hover:bg-red-200"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
