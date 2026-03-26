"use client"

import { useState } from "react"
import { lookupCard } from "../services/loyalty-actions"
import { StampCard } from "./stamp-card"

export function LoyaltyChecker() {
  const [whatsapp, setWhatsapp] = useState("")
  const [card, setCard] = useState<{
    stamps_count: number
    total_redeemed: number
    customer_name: string | null
  } | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!whatsapp) return
    setLoading(true)
    setNotFound(false)

    const result = await lookupCard(whatsapp)
    if (result) {
      setCard(result)
    } else {
      setCard(null)
      setNotFound(true)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-6xl">🐥</span>
        <h1 className="text-2xl font-bold text-[#3D2B1F] mt-3">Mi Tarjeta Patitos</h1>
        <p className="text-sm text-[#3D2B1F]/60 mt-1">
          Ingresa tu WhatsApp para ver tus sellos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
          placeholder="Tu número de WhatsApp"
          className="flex-1 p-3 rounded-xl border-2 border-[#C8956C]/30 focus:border-[#F4A261] focus:outline-none text-sm"
        />
        <button
          type="submit"
          disabled={!whatsapp || loading}
          className="px-5 rounded-xl bg-[#F4A261] text-white font-bold text-sm disabled:opacity-40"
        >
          {loading ? "..." : "Ver"}
        </button>
      </form>

      {card && (
        <div className="space-y-3">
          {card.customer_name && (
            <p className="text-center text-sm font-medium text-[#3D2B1F]">
              ¡Hola, {card.customer_name}! 👋
            </p>
          )}
          <StampCard stamps={card.stamps_count} totalRedeemed={card.total_redeemed} />
          <p className="text-center text-xs text-[#3D2B1F]/40">
            Pide tu sello cada vez que compres en Patitos
          </p>
        </div>
      )}

      {notFound && (
        <div className="text-center py-8">
          <span className="text-4xl">🐥</span>
          <p className="mt-2 text-sm text-[#3D2B1F]/60">
            No encontramos una tarjeta con ese número.
          </p>
          <p className="text-xs text-[#3D2B1F]/40 mt-1">
            ¡Pide tu primer sello en tu próxima visita!
          </p>
        </div>
      )}
    </div>
  )
}
