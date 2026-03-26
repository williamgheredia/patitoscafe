import Link from "next/link"
import type { Category } from "../types/menu"

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="px-5 pt-6 pb-4">
      <div className="max-w-lg mx-auto">
        {/* Hero */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#F4A261]/10 text-[#F4A261] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            <span>☀️</span> Cancún, MX
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-black text-[#3D2B1F] tracking-tight italic leading-tight">
            ¿Qué se te antoja?
          </h2>
          <p className="text-sm text-[#3D2B1F]/45 mt-2 font-medium">
            Explora, elige y pide sin complicaciones
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-3 stagger-children">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="group relative flex flex-col items-center justify-center rounded-[20px] p-4 pt-5 transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 active:scale-95 border border-white/60"
              style={{
                backgroundColor: cat.color ?? "#f5f5f5",
                boxShadow: `0 4px 20px -4px ${cat.color}60, 0 1px 3px rgba(61,43,31,0.04)`,
              }}
            >
              {/* Decorative dot */}
              <div
                className="absolute top-2 right-2 w-2 h-2 rounded-full opacity-40"
                style={{ backgroundColor: "#3D2B1F" }}
              />

              <span className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                {cat.emoji}
              </span>
              <span className="text-[11px] font-extrabold text-[#3D2B1F]/80 text-center leading-tight tracking-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Decorative wave */}
        <div className="flex justify-center mt-6 opacity-20">
          <svg width="120" height="8" viewBox="0 0 120 8" fill="none">
            <path d="M0 4C10 0 20 8 30 4C40 0 50 8 60 4C70 0 80 8 90 4C100 0 110 8 120 4" stroke="#C8956C" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </section>
  )
}
