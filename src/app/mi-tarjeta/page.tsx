import Link from "next/link"
import { LoyaltyChecker } from "@/features/loyalty/components/loyalty-checker"

export default function MiTarjetaPage() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-8">
      <div className="max-w-sm mx-auto">
        <LoyaltyChecker />

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-[#F4A261] font-medium hover:underline"
          >
            ← Volver al menú
          </Link>
        </div>
      </div>
    </div>
  )
}
