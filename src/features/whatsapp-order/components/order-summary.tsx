"use client"

import { useOrderStore } from "../store/order-store"

export function OrderSummary() {
  const items = useOrderStore((s) => s.items)
  const removeItem = useOrderStore((s) => s.removeItem)
  const clearOrder = useOrderStore((s) => s.clearOrder)
  const getTotal = useOrderStore((s) => s.getTotal)

  if (items.length === 0) return null

  return (
    <div className="bg-white rounded-[20px] p-4 mb-5 shadow-[var(--shadow-card)] border border-[#C8956C]/8 animate-scale-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐥</span>
          <h3 className="font-extrabold text-[#3D2B1F] text-sm tracking-tight">Tu pedido</h3>
          <span className="text-[10px] font-bold text-white bg-[#F4A261] px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <button
          onClick={clearOrder}
          className="text-[10px] text-[#3D2B1F]/30 hover:text-red-400 font-bold uppercase tracking-wider transition-colors"
        >
          Limpiar
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#FFF8F0] rounded-xl px-3 py-2.5">
            <div className="flex-1 min-w-0">
              <span className="font-bold text-sm text-[#3D2B1F]">{item.productName}</span>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {item.sabor && (
                  <span className="text-[10px] font-bold text-[#C8956C] bg-[#C8956C]/10 px-1.5 py-0.5 rounded">
                    {item.sabor}
                  </span>
                )}
                {item.size && item.size !== "unico" && (
                  <span className="text-[10px] font-bold text-[#3D2B1F]/40 bg-[#3D2B1F]/5 px-1.5 py-0.5 rounded">
                    {item.size}
                  </span>
                )}
                {item.extras.map((ext) => (
                  <span key={ext} className="text-[10px] font-medium text-[#3D2B1F]/30">
                    +{ext}
                  </span>
                ))}
              </div>
            </div>
            <span className="font-extrabold text-sm text-[#F4A261] flex-shrink-0">${item.price}</span>
            <button
              onClick={() => removeItem(i)}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-[#3D2B1F]/25 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#C8956C]/10">
        <span className="text-xs font-bold text-[#3D2B1F]/40 uppercase tracking-wider">Total</span>
        <span className="font-[family-name:var(--font-display)] text-xl font-black text-[#3D2B1F] italic">
          ${getTotal()}
        </span>
      </div>
    </div>
  )
}
