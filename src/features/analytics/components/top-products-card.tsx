interface TopProduct {
  id: string
  name: string
  views: number
}

export function TopProductsCard({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 text-center">
        <span className="text-3xl">🐥</span>
        <p className="text-sm text-[#3D2B1F]/50 mt-2">
          Aún no hay vistas registradas esta semana
        </p>
      </div>
    )
  }

  const maxViews = products[0]?.views ?? 1

  return (
    <div className="bg-white rounded-2xl p-4">
      <h3 className="font-bold text-[#3D2B1F] text-sm mb-3">
        Top 10 Productos (últimos 7 días)
      </h3>
      <div className="space-y-2">
        {products.map((product, i) => (
          <div key={product.id} className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#3D2B1F]/40 w-5">
              {i + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#3D2B1F]">
                  {product.name}
                </span>
                <span className="text-xs text-[#3D2B1F]/50">
                  {product.views} vista{product.views !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-[#F4A261] rounded-full transition-all"
                  style={{ width: `${(product.views / maxViews) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
