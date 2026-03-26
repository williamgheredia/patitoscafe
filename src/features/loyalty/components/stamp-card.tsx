export function StampCard({
  stamps,
  totalRedeemed,
}: {
  stamps: number
  totalRedeemed: number
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[#3D2B1F] text-sm">Tarjeta de Lealtad</h3>
        {totalRedeemed > 0 && (
          <span className="text-xs text-[#F4A261] font-medium">
            🎁 {totalRedeemed} canjeada{totalRedeemed > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* 5x2 grid of stamps */}
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full flex items-center justify-center text-2xl transition-all ${
              i < stamps
                ? "bg-[#F4A261]/20 scale-100"
                : "bg-gray-100 scale-90"
            }`}
          >
            {i < stamps ? "🐥" : (
              <span className="text-gray-300 text-sm font-bold">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#3D2B1F]/50 mt-3">
        {stamps >= 10
          ? "🎉 ¡Bebida gratis lista para canjear!"
          : `${stamps}/10 sellos — faltan ${10 - stamps}`}
      </p>
    </div>
  )
}
