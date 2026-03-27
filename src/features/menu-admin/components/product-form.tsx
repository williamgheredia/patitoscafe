"use client"

import { useState, useRef } from "react"
import type { Category, Product } from "@/features/menu-public/types/menu"
import { createProduct, updateProduct, uploadProductImage } from "../services/menu-actions"
import { generateProductImage } from "../services/image-generation"
import { generateProductDescription } from "../services/description-generation"

export function ProductForm({
  categories,
  product,
  defaultCategoryId,
  onDone,
}: {
  categories: Category[]
  product?: Product
  defaultCategoryId?: string
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState("")
  const [genDesc, setGenDesc] = useState(false)
  const [descValue, setDescValue] = useState(product?.description ?? "")
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      let productId = product?.id

      if (product) {
        await updateProduct(product.id, formData)
      } else {
        productId = await createProduct(formData)
      }

      // Upload image if selected
      if (imageFile && productId) {
        const imgData = new FormData()
        imgData.set("image", imageFile)
        await uploadProductImage(productId, imgData)
      }
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#C8956C]/15 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#C8956C]/10">
        <h3 className="font-extrabold text-[#3D2B1F] text-base">
          {product ? "Editar Producto" : "Nuevo Producto"}
        </h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Image upload */}
        <div>
          <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-2">
            Foto del producto
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative group cursor-pointer rounded-xl border-2 border-dashed border-[#C8956C]/30 hover:border-[#F4A261] transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <div className="relative aspect-[16/9]">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Cambiar foto
                  </span>
                </div>
              </div>
            ) : (
              <div className="aspect-[16/9] flex flex-col items-center justify-center gap-2 bg-[#FFF8F0]">
                <div className="w-12 h-12 rounded-full bg-[#F4A261]/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#F4A261]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-medium text-[#3D2B1F]/40">
                  Toca para agregar foto
                </span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* AI Generate button — only for existing products */}
          {product && (
            <button
              type="button"
              disabled={generating}
              onClick={async () => {
                setGenerating(true)
                setGenError("")
                const catName = categories.find(c => c.id === product.category_id)?.name ?? "Café"
                const result = await generateProductImage(product.id, product.name, catName)
                if (result.success && result.imageUrl) {
                  setImagePreview(result.imageUrl)
                  setImageFile(null)
                } else {
                  setGenError(result.error ?? "Error")
                }
                setGenerating(false)
              }}
              className="w-full mt-2 py-2 rounded-xl text-xs font-bold border border-purple-200 text-purple-500 hover:bg-purple-50 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
            >
              {generating ? (
                <>
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full" />
                  Generando imagen...
                </>
              ) : (
                <>✨ Generar foto con IA</>
              )}
            </button>
          )}
          {genError && (
            <p className="text-xs text-red-500 mt-1 text-center">{genError}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-1.5">
            Categoría
          </label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? defaultCategoryId ?? ""}
            required
            className="w-full p-3 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-medium text-[#3D2B1F] focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40 focus:border-[#F4A261]"
          >
            <option value="">Selecciona categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-1.5">
            Nombre
          </label>
          <input
            name="name"
            defaultValue={product?.name ?? ""}
            required
            placeholder="Ej: Frappe de Taro"
            className="w-full p-3 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-medium text-[#3D2B1F] placeholder:text-[#3D2B1F]/25 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40 focus:border-[#F4A261]"
          />
        </div>

        {/* Prices */}
        <div>
          <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-1.5">
            Precios
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3D2B1F]/30">M</span>
              <input
                name="precio_m"
                type="number"
                step="1"
                defaultValue={product?.precio_m ?? ""}
                placeholder="—"
                className="w-full p-3 pl-8 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-bold text-[#3D2B1F] placeholder:text-[#3D2B1F]/20 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#3D2B1F]/30">G</span>
              <input
                name="precio_g"
                type="number"
                step="1"
                defaultValue={product?.precio_g ?? ""}
                placeholder="—"
                className="w-full p-3 pl-8 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-bold text-[#3D2B1F] placeholder:text-[#3D2B1F]/20 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#3D2B1F]/30">$</span>
              <input
                name="precio_unico"
                type="number"
                step="1"
                defaultValue={product?.precio_unico ?? ""}
                placeholder="Único"
                className="w-full p-3 pl-7 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-bold text-[#3D2B1F] placeholder:text-[#3D2B1F]/20 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40"
              />
            </div>
          </div>
          <p className="text-[10px] text-[#3D2B1F]/30 mt-1">Mediano / Grande / o Precio Único</p>
        </div>

        {/* Sabores */}
        <div>
          <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-1.5">
            Sabores
          </label>
          <input
            name="sabores"
            defaultValue={product?.sabores?.join(", ") ?? ""}
            placeholder="Mango, Fresa, Taro (separados por coma)"
            className="w-full p-3 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-medium text-[#3D2B1F] placeholder:text-[#3D2B1F]/25 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40 focus:border-[#F4A261]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-[#3D2B1F]/60 uppercase tracking-wider mb-1.5">
            Descripción
          </label>
          <div className="relative">
            <textarea
              name="description"
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              placeholder="Descripción breve del producto"
              rows={2}
              className="w-full p-3 rounded-xl border border-[#C8956C]/20 text-sm bg-[#FFF8F0] font-medium text-[#3D2B1F] placeholder:text-[#3D2B1F]/25 focus:outline-none focus:ring-2 focus:ring-[#F4A261]/40 focus:border-[#F4A261] resize-none"
            />
          </div>
          {product && (
            <button
              type="button"
              disabled={genDesc}
              onClick={async () => {
                setGenDesc(true)
                const form = document.querySelector("form")
                const nameInput = form?.querySelector<HTMLInputElement>("[name='name']")
                const saboresInput = form?.querySelector<HTMLInputElement>("[name='sabores']")
                const catSelect = form?.querySelector<HTMLSelectElement>("[name='category_id']")
                const catName = catSelect?.selectedOptions?.[0]?.textContent?.trim() ?? "Café"
                const name = nameInput?.value ?? product.name
                const saboresStr = saboresInput?.value ?? ""
                const sabores = saboresStr ? saboresStr.split(",").map(s => s.trim()).filter(Boolean) : []

                const result = await generateProductDescription(product.id, name, catName, sabores)
                if (result.success && result.description) {
                  setDescValue(result.description)
                }
                setGenDesc(false)
              }}
              className="mt-1.5 w-full py-1.5 rounded-xl text-xs font-bold border border-blue-200 text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
            >
              {genDesc ? (
                <>
                  <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full" />
                  Generando...
                </>
              ) : (
                <>✍️ Generar descripción con IA</>
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-[#F4A261] text-white font-extrabold text-sm hover:bg-[#e8914f] disabled:opacity-40 active:scale-[0.98] transition-all shadow-sm shadow-[#F4A261]/25"
          >
            {loading ? "Guardando..." : product ? "Guardar Cambios" : "Crear Producto"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="px-5 py-3 rounded-xl bg-[#3D2B1F]/5 text-[#3D2B1F]/60 font-bold text-sm hover:bg-[#3D2B1F]/10 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}
