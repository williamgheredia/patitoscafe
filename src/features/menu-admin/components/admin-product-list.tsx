"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Product, Category } from "@/features/menu-public/types/menu"
import { ProductForm } from "./product-form"
import { deleteProduct, createCategory, toggleProductAvailability } from "../services/menu-actions"
import { generateProductImage, generateCategoryImage } from "../services/image-generation"

// --- Confirm Modal ---

function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-[#3D2B1F]/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-extrabold text-[#3D2B1F] text-base mb-2">{title}</h3>
        <p className="text-sm text-[#3D2B1F]/60 mb-5">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white font-extrabold text-sm hover:bg-red-600 active:scale-[0.98] transition-all"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-[#3D2B1F]/5 text-[#3D2B1F]/60 font-bold text-sm hover:bg-[#3D2B1F]/10 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function useConfirm() {
  const [state, setState] = useState<{
    title: string
    message: string
    confirmLabel: string
    resolve: (v: boolean) => void
  } | null>(null)

  const confirm = useCallback((title: string, message: string, confirmLabel = "Eliminar") => {
    return new Promise<boolean>((resolve) => {
      setState({ title, message, confirmLabel, resolve })
    })
  }, [])

  const modal = state ? (
    <ConfirmModal
      title={state.title}
      message={state.message}
      confirmLabel={state.confirmLabel}
      onConfirm={() => { state.resolve(true); setState(null) }}
      onCancel={() => { state.resolve(false); setState(null) }}
    />
  ) : null

  return { confirm, modal }
}

// --- Product Card ---

function ProductCard({
  product,
  categories,
  isEditing,
  onStartEdit,
  onDoneEdit,
}: {
  product: Product
  categories: Category[]
  isEditing: boolean
  onStartEdit: () => void
  onDoneEdit: () => void
}) {
  const [genImg, setGenImg] = useState(false)
  const [imgPreview, setImgPreview] = useState(product.image_url)
  const [available, setAvailable] = useState(product.is_available)
  const { confirm, modal } = useConfirm()
  const router = useRouter()

  const price = product.precio_unico
    ? `$${product.precio_unico}`
    : [product.precio_m && `M $${product.precio_m}`, product.precio_g && `G $${product.precio_g}`]
        .filter(Boolean)
        .join(" · ")

  const catName = categories.find(c => c.id === product.category_id)?.name ?? "Café"

  async function handleGenImage() {
    setGenImg(true)
    const result = await generateProductImage(product.id, product.name, catName)
    if (result.success && result.imageUrl) {
      setImgPreview(result.imageUrl)
    }
    setGenImg(false)
    router.refresh()
  }

  async function handleToggleAvail() {
    const next = !available
    setAvailable(next)
    await toggleProductAvailability(product.id, next)
    router.refresh()
  }

  async function handleDelete() {
    const ok = await confirm(
      "Eliminar producto",
      `¿Estás seguro de eliminar "${product.name}"? Esta acción no se puede deshacer.`
    )
    if (!ok) return
    await deleteProduct(product.id)
    router.refresh()
  }

  return (
    <>
    {modal}
    <div className={`rounded-2xl overflow-hidden bg-white border transition-all ${
      isEditing
        ? "border-[#F4A261]/40 shadow-lg shadow-[#F4A261]/10"
        : "border-[#C8956C]/10 shadow-sm shadow-[#C8956C]/5 hover:shadow-md hover:-translate-y-0.5"
    }`}>
      {/* Image */}
      <div className={`relative overflow-hidden bg-[#FFF8F0] ${isEditing ? "hidden" : "aspect-[4/3]"}`}>
        {imgPreview ? (
          <Image
            src={imgPreview}
            alt={product.name}
            width={400}
            height={300}
            className={`w-full h-full object-cover ${genImg ? "opacity-40" : ""} ${!available ? "grayscale opacity-50" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">
              {categories.find(c => c.id === product.category_id)?.emoji ?? "🐥"}
            </span>
          </div>
        )}

        {/* AI generating spinner overlay */}
        {genImg && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-[3px] border-white/30 border-t-white animate-spin" />
          </div>
        )}

        {/* Unavailable overlay */}
        {!available && !genImg && (
          <div className="absolute top-2 left-2 bg-[#3D2B1F] text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase">
            Agotado
          </div>
        )}
      </div>

      {/* Info + Actions */}
      {!isEditing && (
        <div className="p-3 space-y-2.5">
          {/* Name + Price */}
          <div>
            <h4 className="font-bold text-sm text-[#3D2B1F] leading-tight truncate">{product.name}</h4>
            <p className="text-xs font-bold text-[#F4A261] mt-0.5">{price}</p>
            {product.sabores.length > 0 && (
              <p className="text-[10px] text-[#3D2B1F]/35 mt-0.5 truncate">
                {product.sabores.join(" · ")}
              </p>
            )}
          </div>

          {/* Availability toggle */}
          <button
            onClick={handleToggleAvail}
            className={`w-full flex items-center justify-between py-2 px-3 rounded-xl text-xs font-bold transition-colors ${
              available
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-400"
            }`}
          >
            <span>{available ? "Disponible" : "Agotado"}</span>
            <div className={`w-8 h-5 rounded-full relative transition-colors ${available ? "bg-green-400" : "bg-red-300"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${available ? "left-3.5" : "left-0.5"}`} />
            </div>
          </button>

          {/* Action buttons */}
          {genImg ? (
            <div className="py-3 rounded-xl bg-purple-50 text-purple-500 text-xs font-bold text-center flex items-center justify-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full" />
              Generando foto con IA...
            </div>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={onStartEdit}
                className="flex-1 py-2.5 rounded-xl bg-[#F4A261]/8 hover:bg-[#F4A261]/15 text-[#F4A261] text-xs font-bold transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
                Editar
              </button>
              <button
                onClick={handleGenImage}
                className="py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-400 text-xs font-bold transition-colors"
                title="Generar foto con IA"
              >
                📸
              </button>
              <button
                onClick={handleDelete}
                className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-400 text-xs font-bold transition-colors"
                title="Eliminar"
              >
                🗑
              </button>
            </div>
          )}
        </div>
      )}

      {/* Expanded Edit Form */}
      {isEditing && (
        <div className="p-4 bg-[#FFF8F0]/50">
          <ProductForm
            categories={categories}
            product={product}
            onDone={onDoneEdit}
          />
        </div>
      )}
    </div>
    </>
  )
}

// --- New Product Card (dashed placeholder) ---

function NewProductCard({ categories, categoryId, onDone }: {
  categories: Category[]
  categoryId: string
  onDone: () => void
}) {
  const [showForm, setShowForm] = useState(false)

  if (showForm) {
    return (
      <div className="rounded-2xl overflow-hidden bg-white border border-[#F4A261]/40 shadow-lg shadow-[#F4A261]/10 col-span-full">
        <div className="p-4">
          <ProductForm
            categories={categories}
            defaultCategoryId={categoryId}
            onDone={() => {
              setShowForm(false)
              onDone()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="rounded-2xl border-2 border-dashed border-[#F4A261]/30 hover:border-[#F4A261]/60 bg-[#FFF8F0]/50 hover:bg-[#F4A261]/5 transition-all flex flex-col items-center justify-center gap-2 aspect-[4/3] min-h-[180px]"
    >
      <div className="w-12 h-12 rounded-full bg-[#F4A261]/10 flex items-center justify-center">
        <svg className="w-6 h-6 text-[#F4A261]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <span className="text-sm font-bold text-[#F4A261]">Nuevo Producto</span>
    </button>
  )
}

// --- New Category Form ---

function NewCategoryForm({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      await createCategory(new FormData(e.currentTarget))
      router.refresh()
      onDone()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#C8956C]/15 p-4 space-y-3">
      <h4 className="font-extrabold text-sm text-[#3D2B1F]">Nueva Categoría</h4>
      <div className="flex gap-2">
        <input
          name="emoji"
          placeholder="🍹"
          className="w-14 p-2.5 rounded-xl border border-[#C8956C]/20 text-center text-lg bg-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40"
        />
        <input
          name="name"
          required
          placeholder="Nombre de la categoría"
          className="flex-1 p-2.5 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-medium text-[#3D2B1F] placeholder:text-[#3D2B1F]/25 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40"
        />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-[#3D2B1F]/40 uppercase mb-1">Color</label>
        <input name="color" type="color" defaultValue="#f5f5f5" className="w-10 h-10 rounded-xl border border-[#C8956C]/20 cursor-pointer" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-[#F4A261] text-white font-extrabold text-sm disabled:opacity-40">
          {loading ? "Creando..." : "Crear"}
        </button>
        <button type="button" onClick={onDone} className="px-4 py-2.5 rounded-xl bg-[#3D2B1F]/5 text-[#3D2B1F]/60 font-bold text-sm">
          Cancelar
        </button>
      </div>
    </form>
  )
}

// --- Stats View ---

interface TopProduct { id: string; name: string; views: number }

function StatsView({ products }: { products: TopProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center">
        <span className="text-3xl">🐥</span>
        <p className="text-sm text-[#3D2B1F]/50 mt-2">Aún no hay vistas registradas esta semana</p>
      </div>
    )
  }

  const maxViews = products[0]?.views ?? 1

  return (
    <div className="bg-white rounded-2xl p-5">
      <h3 className="font-bold text-[#3D2B1F] text-base mb-4">Top 10 Productos (últimos 7 días)</h3>
      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={product.id} className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#3D2B1F]/40 w-6">{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#3D2B1F]">{product.name}</span>
                <span className="text-xs text-[#3D2B1F]/50">{product.views} vista{product.views !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-[#F4A261] rounded-full" style={{ width: `${(product.views / maxViews) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Main Component ---

export function AdminProductList({
  products,
  categories,
  topProducts,
}: {
  products: Product[]
  categories: Category[]
  topProducts: TopProduct[]
}) {
  const [activeCatId, setActiveCatId] = useState<string | null>(categories[0]?.id ?? null)
  const [showStats, setShowStats] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()

  const filteredProducts = products.filter((p) => p.category_id === activeCatId)
  const activeCategory = categories.find((c) => c.id === activeCatId)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#3D2B1F]">Menú</h2>
          <p className="text-sm text-[#3D2B1F]/40">
            {products.length} productos · {categories.length} categorías
          </p>
        </div>
      </div>

      {/* Category pills */}
      <div className="sticky top-[88px] z-10 bg-[#FFF8F0] py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[#C8956C]/10 mb-5">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isActive = activeCatId === cat.id && !showStats
            const count = products.filter((p) => p.category_id === cat.id).length

            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCatId(cat.id); setShowStats(false); setShowNewCat(false); setEditingId(null) }}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "text-[#3D2B1F]/90 font-extrabold shadow-sm border border-transparent"
                    : "bg-white text-[#3D2B1F]/50 border border-[#C8956C]/15 hover:border-[#C8956C]/30"
                }`}
                style={isActive ? { backgroundColor: `${cat.color}cc` } : {}}
              >
                {cat.emoji} {cat.name}
                <span className={`ml-1 text-[10px] ${isActive ? "text-[#3D2B1F]/50" : "text-[#3D2B1F]/20"}`}>{count}</span>
              </button>
            )
          })}

          <button
            onClick={() => { setShowStats(true); setShowNewCat(false); setEditingId(null) }}
            className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
              showStats ? "bg-[#3D2B1F] text-white" : "bg-white text-[#3D2B1F]/50 border border-[#C8956C]/15"
            }`}
          >
            📊 Stats
          </button>

          <button
            onClick={() => { setShowNewCat(true); setShowStats(false) }}
            className="px-3.5 py-2 rounded-full text-xs font-bold text-[#F4A261] border border-dashed border-[#F4A261]/40 hover:bg-[#F4A261]/5 transition-all"
          >
            ＋
          </button>
        </div>
      </div>

      {/* New category form */}
      {showNewCat && (
        <div className="mb-5">
          <NewCategoryForm onDone={() => { setShowNewCat(false); router.refresh() }} />
        </div>
      )}

      {/* Content */}
      {showStats ? (
        <StatsView products={topProducts} />
      ) : (
        <>
          {/* Category header bar */}
          {activeCategory && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeCategory.emoji}</span>
                <span className="font-extrabold text-[#3D2B1F]">{activeCategory.name}</span>
                <span className="text-sm text-[#3D2B1F]/40">{filteredProducts.length} productos</span>
              </div>
              <CategoryImageButton category={activeCategory} products={filteredProducts} />
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                isEditing={editingId === product.id}
                onStartEdit={() => setEditingId(product.id)}
                onDoneEdit={() => { setEditingId(null); router.refresh() }}
              />
            ))}

            {/* New product card */}
            {activeCatId && (
              <NewProductCard
                categories={categories}
                categoryId={activeCatId}
                onDone={() => router.refresh()}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

// --- Category Image Button ---

function CategoryImageButton({ category, products }: { category: Category; products: Product[] }) {
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  async function handleGen() {
    setGenerating(true)
    await generateCategoryImage(category.id, category.name, products.map(p => p.name))
    setGenerating(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleGen}
      disabled={generating}
      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-purple-200 text-purple-400 hover:bg-purple-50 disabled:opacity-40 transition-colors flex items-center gap-1.5"
    >
      {generating ? (
        <span className="animate-spin inline-block w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full" />
      ) : (
        "✨"
      )}
      Foto categoría
    </button>
  )
}
