export function MenuHeader() {
  return (
    <header className="sticky top-0 z-10 bg-[#FFF8F0] border-b border-[#C8956C]/20 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐥</span>
          <div>
            <h1 className="text-xl font-bold text-[#3D2B1F] leading-tight">Patitos</h1>
            <p className="text-xs text-[#3D2B1F]/60">Café & Drinks</p>
          </div>
        </div>
        <a
          href="/mi-tarjeta"
          className="text-sm font-medium text-[#F4A261] hover:text-[#e8914f] transition-colors"
        >
          Mi Tarjeta 🐥
        </a>
      </div>
    </header>
  )
}
