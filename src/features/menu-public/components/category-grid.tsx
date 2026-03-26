import Link from "next/link"
import type { Category } from "../types/menu"

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-[#3D2B1F] mb-4">¿Qué se te antoja? 🐥</h2>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="flex flex-col items-center justify-center rounded-2xl p-4 transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: cat.color ?? "#f5f5f5" }}
            >
              <span className="text-4xl mb-2">{cat.emoji}</span>
              <span className="text-sm font-semibold text-[#3D2B1F] text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
