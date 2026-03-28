import Link from "next/link"
import Image from "next/image"
import type { Category } from "../types/menu"
import { SubscribeButton } from "./subscribe-button"

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="px-5 pt-6 pb-4">
      <div className="max-w-lg mx-auto">
        {/* Hero */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#F4A261]/10 text-[#F4A261] text-sm font-bold px-4 py-1.5 rounded-full mb-2 uppercase tracking-wider">
            <span>📍</span> Frente a Urgencias IMSS 510
          </div>
          <br />
          <a
            href="https://share.google/lYCxpbkee1pkYN0QL"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#C8956C] hover:text-[#F4A261] transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Ver Ubicación
          </a>
          <br />
          <div className="mt-2 mb-3">
            <SubscribeButton />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-black text-[#3D2B1F] tracking-tight italic leading-tight">
            ¿Qué se te antoja?
          </h2>
          <p className="text-base text-[#3D2B1F]/60 mt-2 font-medium">
            Explora, elige y pide sin complicaciones
          </p>
        </div>

        {/* Grid — 2 cols mobile, 3 cols tablet+ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 stagger-children">
          {categories.map((cat, i) => {
            const isLast = i === categories.length - 1
            const isOddTotal = categories.length % 2 !== 0
            const makeFullWidth = isLast && isOddTotal

            return (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className={`group relative flex flex-col items-center justify-center rounded-[20px] overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 active:scale-95 border border-white/60 ${makeFullWidth ? "col-span-2 sm:col-span-1" : ""}`}
              style={{
                backgroundColor: cat.color ?? "#f5f5f5",
                boxShadow: `0 4px 20px -4px ${cat.color}60, 0 1px 3px rgba(61,43,31,0.04)`,
              }}
            >
              {cat.image_url ? (
                <>
                  <div className="w-full aspect-square overflow-hidden">
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="w-full py-3 px-2 text-center" style={{ backgroundColor: `${cat.color}dd` }}>
                    <span className="text-sm font-extrabold text-[#3D2B1F]/90 leading-tight tracking-tight">
                      {cat.emoji} {cat.name}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-5 pt-6 flex flex-col items-center justify-center">
                  <span className="text-5xl mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    {cat.emoji}
                  </span>
                  <span className="text-sm font-extrabold text-[#3D2B1F]/90 text-center leading-tight tracking-tight">
                    {cat.name}
                  </span>
                </div>
              )}
            </Link>
            )
          })}
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
