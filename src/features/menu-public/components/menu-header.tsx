export function MenuHeader() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-[#C8956C]/10">
      <div className="max-w-lg mx-auto px-5 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <span className="text-2xl group-hover:animate-float transition-transform">🐥</span>
          <div className="leading-none">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-black text-[#3D2B1F] tracking-tight italic">
              Patitos
            </h1>
            <p className="text-[10px] font-bold text-[#C8956C] uppercase tracking-[0.15em] mt-0.5">
              Café & Drinks
            </p>
          </div>
        </a>
        <a
          href="/mi-tarjeta"
          className="flex items-center gap-1.5 text-xs font-bold text-[#3D2B1F]/50 hover:text-[#F4A261] transition-colors bg-white/50 px-3 py-1.5 rounded-full border border-[#C8956C]/10"
        >
          <span className="text-sm">🐥</span>
          Mi Tarjeta
        </a>
      </div>
    </header>
  )
}
