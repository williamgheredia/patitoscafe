import { create } from "zustand"
import type { OrderItem } from "../types/order"

interface OrderStore {
  items: OrderItem[]
  addItem: (item: OrderItem) => void
  removeItem: (index: number) => void
  clearOrder: () => void
  getTotal: () => number
  getWhatsAppUrl: () => string
}

const WHATSAPP_NUMBER = "529981398309"

export const useOrderStore = create<OrderStore>((set, get) => ({
  items: [],

  addItem: (item) => set((state) => ({ items: [...state.items, item] })),

  removeItem: (index) =>
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    })),

  clearOrder: () => set({ items: [] }),

  getTotal: () => get().items.reduce((sum, item) => sum + item.price, 0),

  getWhatsAppUrl: () => {
    const items = get().items
    if (items.length === 0) {
      return `https://wa.me/${WHATSAPP_NUMBER}`
    }

    const lines = items.map((item) => {
      const parts = [item.productName]
      if (item.sabor) parts.push(`(${item.sabor})`)
      if (item.size && item.size !== "unico") parts.push(`(${item.size})`)
      if (item.extras.length > 0) parts.push(`+ ${item.extras.join(", ")}`)
      return `- ${parts.join(" ")} — $${item.price}`
    })

    const total = get().getTotal()
    const message = [
      "Hola Patitos! 🐥 Quiero ordenar:",
      ...lines,
      `Total estimado: $${total}`,
    ].join("\n")

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  },
}))
