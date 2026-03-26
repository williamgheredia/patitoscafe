"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { logoutStaff } from "@/features/loyalty/services/pin-actions"

export function StaffHeader({ employeeName }: { employeeName: string }) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-10 bg-[#3D2B1F] text-white px-4 py-3">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐥</span>
            <span className="font-bold text-sm">Staff: {employeeName}</span>
          </div>
          <button
            onClick={async () => {
              await logoutStaff()
              router.refresh()
            }}
            className="text-xs text-white/60 hover:text-white"
          >
            Salir
          </button>
        </div>
        <nav className="flex gap-4 mt-2 text-xs">
          <Link href="/staff/admin" className="text-[#F4A261] font-bold">
            Menú
          </Link>
          <Link href="/staff/disponibilidad" className="text-white/60 hover:text-white">
            Disponibilidad
          </Link>
          <Link href="/staff/sellos" className="text-white/60 hover:text-white">
            Sellos
          </Link>
        </nav>
      </div>
    </header>
  )
}
