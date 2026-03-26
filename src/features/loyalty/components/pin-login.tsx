"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyPin } from "../services/pin-actions"

export function PinLogin() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await verifyPin(pin)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error ?? "PIN incorrecto")
      setPin("")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <span className="text-6xl">🐥</span>
          <h1 className="text-2xl font-bold text-[#3D2B1F] mt-3">Patitos Staff</h1>
          <p className="text-sm text-[#3D2B1F]/60 mt-1">Ingresa tu PIN para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="PIN"
            className="w-full text-center text-3xl tracking-[0.5em] py-4 rounded-2xl bg-white border-2 border-[#C8956C]/30 focus:border-[#F4A261] focus:outline-none text-[#3D2B1F] font-bold placeholder:text-[#3D2B1F]/20 placeholder:tracking-normal placeholder:text-lg"
            autoFocus
          />

          {error && (
            <p className="text-center text-sm text-red-500 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={pin.length < 4 || loading}
            className="w-full py-3 rounded-2xl bg-[#F4A261] text-white font-bold text-lg hover:bg-[#e8914f] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
