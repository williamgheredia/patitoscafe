"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product, Category } from "@/features/menu-public/types/menu"
import { ProductForm } from "./product-form"
import { deleteProduct } from "../services/menu-actions"
import { generateCategoryImage } from "../services/image-generation"

function ProductRow({
  product,
  categories,
  onEdit,
  onDelete,
}: {
  product: Product
  categories: Category[]
  onEdit: () => void
  onDelete: () => void
}) {
  const price = product.precio_unico
    ? `$${product.precio_unico}`
    : [product.precio_m && `M $${product.precio_m}`, product.precio_g && `G $${product.precio_g}`]
        .filter(Boolean)
        .join(" · ")

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#FFF8F0]/50 transition-colors border-b border-[#C8956C]/8 last:border-b-0">
      {/* Thumbnail */}
      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#FFF8F0]">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-5 h-5 text-[#C8956C]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm text-[#3D2B1F] truncate">{product.name}</span>
          {!product.is_available && (
            <span className="flex-shrink-0 text-[10px] font-bold bg-red-50 text-red-400 px-1.5 py-0.5 rounded-md">
              OFF
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold text-[#F4A261]">{price}</span>
          {product.sabores.length > 0 && (
            <span className="text-[10px] text-[#3D2B1F]/35 truncate">
              {product.sabores.length} sabor{product.sabores.length > 1 ? "es" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={onEdit}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F4A261]/8 hover:bg-[#F4A261]/20 text-[#F4A261] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function CategorySection({
  category,
  products,
  categories,
  onStartEdit,
  editingId,
  onDoneEdit,
}: {
  category: Category
  products: Product[]
  categories: Category[]
  onStartEdit: (id: string) => void
  editingId: string | null
  onDoneEdit: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [genCatImg, setGenCatImg] = useState(false)
  const [catImgPreview, setCatImgPreview] = useState(category.image_url)
  const router = useRouter()

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return
    await deleteProduct(id)
    router.refresh()
  }

  async function handleGenCategoryImage() {
    setGenCatImg(true)
    const productNames = products.map((p) => p.name)
    const result = await generateCategoryImage(category.id, category.name, productNames)
    if (result.success && result.imageUrl) {
      setCatImgPreview(result.imageUrl)
    }
    setGenCatImg(false)
    router.refresh()
  }

  return (
    <div className="rounded-2xl border border-[#C8956C]/12 overflow-hidden bg-white shadow-sm shadow-[#C8956C]/5">
      {/* Category image */}
      {catImgPreview && (
        <div className="h-24 overflow-hidden">
          <img src={catImgPreview} alt={category.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Category header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors"
        style={{ backgroundColor: `${category.color}25` }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{category.emoji}</span>
          <div className="text-left">
            <span className="font-extrabold text-sm text-[#3D2B1F]">{category.name}</span>
            <span className="text-[10px] text-[#3D2B1F]/40 ml-2">{products.length} producto{products.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            onClick={(e) => {
              e.stopPropagation()
              handleGenCategoryImage()
            }}
            className={`w-7 h-7 flex items-center justify-center rounded-lg bg-white/70 hover:bg-white text-purple-400 transition-colors cursor-pointer ${genCatImg ? "animate-pulse" : ""}`}
            title="Generar foto de categoría"
          >
            {genCatImg ? (
              <span className="animate-spin inline-block w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full" />
            ) : (
              <span className="text-xs">✨</span>
            )}
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation()
              setShowNew(true)
              setCollapsed(false)
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/70 hover:bg-white text-[#F4A261] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </span>
          <svg
            className={`w-4 h-4 text-[#3D2B1F]/30 transition-transform ${collapsed ? "-rotate-90" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {!collapsed && (
        <div>
          {/* New product form */}
          {showNew && (
            <div className="p-4 border-b border-[#C8956C]/10 bg-[#FFF8F0]/50">
              <ProductForm
                categories={categories}
                defaultCategoryId={category.id}
                onDone={() => {
                  setShowNew(false)
                  router.refresh()
                }}
              />
            </div>
          )}

          {/* Product rows */}
          {products.map((product) => {
            if (editingId === product.id) {
              return (
                <div key={product.id} className="p-4 border-b border-[#C8956C]/10 bg-[#FFF8F0]/50">
                  <ProductForm
                    categories={categories}
                    product={product}
                    onDone={onDoneEdit}
                  />
                </div>
              )
            }

            return (
              <ProductRow
                key={product.id}
                product={product}
                categories={categories}
                onEdit={() => onStartEdit(product.id)}
                onDelete={() => handleDelete(product.id, product.name)}
              />
            )
          })}

          {products.length === 0 && !showNew && (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-[#3D2B1F]/30">Sin productos aún</p>
              <button
                onClick={() => setShowNew(true)}
                className="mt-2 text-xs font-bold text-[#F4A261] hover:underline"
              >
                + Agregar el primero
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AdminProductList({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const router = useRouter()

  // Group products by category
  const grouped = categories.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.category_id === cat.id),
  }))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[#3D2B1F]">Menú</h2>
          <p className="text-xs text-[#3D2B1F]/40">{products.length} productos en {categories.length} categorías</p>
        </div>
      </div>

      {/* Category sections */}
      {grouped.map(({ category, products: catProducts }) => (
        <CategorySection
          key={category.id}
          category={category}
          products={catProducts}
          categories={categories}
          onStartEdit={(id) => setEditingId(id)}
          editingId={editingId}
          onDoneEdit={() => {
            setEditingId(null)
            router.refresh()
          }}
        />
      ))}
    </div>
  )
}
