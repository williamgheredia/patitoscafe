"use client"

import { useState } from "react"
import { addStamp, redeemDrink, lookupCard } from "../services/loyalty-actions"
import { StampCard } from "./stamp-card"

export function AdminStampForm() {
  const [whatsapp, setWhatsapp] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [card, setCard] = useState<{
    stamps_count: number
    customer_name: string | null
    total_redeemed: number
    whatsapp_number: string
  } | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLookup() {
    if (!whatsapp) return
    setLoading(true)
    setMessage("")
    const result = await lookupCard(whatsapp)
    if (result) {
      setCard(result)
      setCustomerName(result.customer_name ?? "")
    } else {
      setCard(null)
      setMessage("Cliente nuevo — se creará al agregar sello")
    }
    setLoading(false)
  }

  async function handleStamp() {
    setLoading(true)
    setMessage("")
    const result = await addStamp(whatsapp, customerName || undefined)
    if (result.success && result.card) {
      setCard(result.card)
      setMessage("✓ Sello agregado!")
    } else {
      setMessage(result.error ?? "Error")
    }
    setLoading(false)
  }

  async function handleRedeem() {
    setLoading(true)
    setMessage("")
    const result = await redeemDrink(whatsapp)
    if (result.success && result.card) {
      setCard(result.card)
      setMessage("🎉 Bebida canjeada!")
    } else {
      setMessage(result.error ?? "Error")
    }
    setLoading(false)
  }

  function handleReset() {
    setWhatsapp("")
    setCustomerName("")
    setCard(null)
    setMessage("")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-[#3D2B1F]">Gestión de Sellos</h2>

      {/* Search */}
      <div className="flex gap-2">
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
          placeholder="WhatsApp del cliente"
          className="flex-1 p-3 rounded-xl border border-[#C8956C]/30 text-sm"
        />
        <button
          onClick={handleLookup}
          disabled={!whatsapp || loading}
          className="px-4 rounded-xl bg-[#3D2B1F] text-white text-sm font-bold disabled:opacity-40"
        >
          Buscar
        </button>
      </div>

      {/* Customer name */}
      {(card || message.includes("nuevo")) && (
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nombre del cliente (opcional)"
          className="w-full p-3 rounded-xl border border-[#C8956C]/30 text-sm"
        />
      )}

      {/* Card display */}
      {card && (
        <StampCard stamps={card.stamps_count} totalRedeemed={card.total_redeemed} />
      )}

      {/* Message */}
      {message && (
        <p
          className={`text-sm font-medium text-center ${
            message.startsWith("✓") || message.startsWith("🎉")
              ? "text-green-600"
              : message.includes("Error") || message.includes("Faltan")
              ? "text-red-500"
              : "text-[#3D2B1F]/60"
          }`}
        >
          {message}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleStamp}
          disabled={!whatsapp || loading || (card?.stamps_count ?? 0) >= 10}
          className="flex-1 py-3 rounded-xl bg-[#F4A261] text-white font-bold text-sm disabled:opacity-40"
        >
          + Agregar Sello
        </button>
        {card && card.stamps_count >= 10 && (
          <button
            onClick={handleRedeem}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold text-sm disabled:opacity-40"
          >
            🎁 Canjear Bebida
          </button>
        )}
      </div>

      {card && (
        <button
          onClick={handleReset}
          className="w-full text-center text-xs text-[#3D2B1F]/40 hover:text-[#3D2B1F]/60"
        >
          Buscar otro cliente
        </button>
      )}
    </div>
  )
}
