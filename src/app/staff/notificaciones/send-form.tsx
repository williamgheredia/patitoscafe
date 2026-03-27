"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sendPushNotification } from "@/features/menu-admin/services/push-actions"

export function SendNotificationForm({ subscriberCount }: { subscriberCount: number }) {
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; error?: string } | null>(null)
  const router = useRouter()

  async function handleSend() {
    if (!title.trim() || !body.trim()) return
    setSending(true)
    setResult(null)

    try {
      const res = await sendPushNotification(title.trim(), body.trim())

      if (res.success) {
        setResult({ sent: res.sent, failed: res.failed })
        setTitle("")
        setBody("")
        router.refresh()
      } else {
        setResult({ sent: 0, failed: 0, error: res.error || "Error desconocido" })
      }
    } catch (e) {
      setResult({ sent: 0, failed: 0, error: `Error: ${e instanceof Error ? e.message : e}` })
    }

    setSending(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#C8956C]/10 space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-1.5">
          Título
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Ej: "Nuevo frappe de temporada"'
          className="w-full p-3 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-medium text-[#3D2B1F] placeholder:text-[#3D2B1F]/25 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-1.5">
          Mensaje
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='Ej: "Ven a probar nuestro nuevo Frappe de Galleta Oreo. ¡Disponible desde hoy!"'
          rows={3}
          className="w-full p-3 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-medium text-[#3D2B1F] placeholder:text-[#3D2B1F]/25 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40 resize-none"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={sending || !title.trim() || !body.trim() || subscriberCount === 0}
        className="w-full py-3.5 rounded-xl bg-[#F4A261] text-white font-extrabold text-sm hover:bg-[#e8914f] disabled:opacity-40 active:scale-[0.98] transition-all shadow-sm shadow-[#F4A261]/25 flex items-center justify-center gap-2"
      >
        {sending ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            Enviando...
          </>
        ) : (
          <>
            🔔 Enviar a {subscriberCount} suscriptor{subscriberCount !== 1 ? "es" : ""}
          </>
        )}
      </button>

      {result && (
        <div className={`text-center text-sm font-bold rounded-xl py-2 px-3 ${
          result.sent > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-400"
        }`}>
          {result.sent > 0
            ? `Enviado a ${result.sent} persona${result.sent !== 1 ? "s" : ""}`
            : result.error || "No se pudo enviar"}
          {result.failed > 0 && ` (${result.failed} fallido${result.failed !== 1 ? "s" : ""})`}
        </div>
      )}

      {subscriberCount === 0 && (
        <p className="text-center text-xs text-[#3D2B1F]/40">
          Aún no hay suscriptores. Los clientes verán un aviso para activar notificaciones al visitar el menú.
        </p>
      )}
    </div>
  )
}
