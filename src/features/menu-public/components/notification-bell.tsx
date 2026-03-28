"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export function NotificationBell({ totalCount }: { totalCount: number }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const lastSeen = parseInt(localStorage.getItem("patitos_notif_seen") ?? "0", 10)
    const newCount = Math.max(0, totalCount - lastSeen)
    setUnread(newCount)
  }, [totalCount])

  const handleClick = () => {
    localStorage.setItem("patitos_notif_seen", String(totalCount))
    setUnread(0)
  }

  return (
    <Link
      href="/notificaciones"
      onClick={handleClick}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white/60 border border-[#C8956C]/15 hover:border-[#F4A261]/40 transition-colors"
      aria-label="Notificaciones"
    >
      <span className="text-lg">🔔</span>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-[#F4A261] text-white text-[10px] font-bold rounded-full px-1 animate-bounce">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  )
}
