"use client"

import { useState } from "react"
import { deleteNotification, clearAllNotifications } from "@/features/menu-admin/services/push-actions"

type LogEntry = {
  id: string
  title: string
  body: string
  sent_count: number
  created_at: string
}

export function NotificationLog({ entries }: { entries: LogEntry[] }) {
  const [items, setItems] = useState(entries)
  const [clearing, setClearing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm("¿Borrar esta notificación?")) return
    setDeletingId(id)
    const result = await deleteNotification(id)
    if (result.success) {
      setItems((prev) => prev.filter((e) => e.id !== id))
    }
    setDeletingId(null)
  }

  async function handleClearAll() {
    if (!confirm("¿Borrar TODAS las notificaciones del historial? Los clientes ya no las verán.")) return
    setClearing(true)
    const result = await clearAllNotifications()
    if (result.success) {
      setItems([])
    }
    setClearing(false)
  }

  if (items.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-[#3D2B1F]/60 uppercase tracking-wider">
          Historial
        </h3>
        <button
          onClick={handleClearAll}
          disabled={clearing}
          className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {clearing ? "Borrando..." : "🗑 Borrar todo"}
        </button>
      </div>
      <div className="space-y-2">
        {items.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl p-3 border border-[#C8956C]/10 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-[#3D2B1F] truncate">{entry.title}</p>
                <p className="text-xs text-[#3D2B1F]/50 mt-0.5 line-clamp-2">{entry.body}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-[#3D2B1F]/30 whitespace-nowrap">
                  {entry.sent_count} enviado{entry.sent_count !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deletingId === entry.id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-300 hover:text-red-500 disabled:opacity-50"
                  title="Borrar"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-[#3D2B1F]/25 mt-1.5">
              {new Date(entry.created_at).toLocaleString("es-MX", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
