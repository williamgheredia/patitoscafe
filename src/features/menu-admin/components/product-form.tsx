"use client"

import { useState } from "react"
import type { Category } from "@/features/menu-public/types/menu"
import type { Product } from "@/features/menu-public/types/menu"
import { createProduct, updateProduct } from "../services/menu-actions"

export function ProductForm({
  categories,
  product,
  onDone,
}: {
  categories: Category[]
  product?: Product
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    if (product) {
      await updateProduct(product.id, formData)
    } else {
      await createProduct(formData)
    }

    setLoading(false)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white rounded-2xl p-4">
      <h3 className="font-bold text-[#3D2B1F]">
        {product ? "Editar Producto" : "Nuevo Producto"}
      </h3>

      <select
        name="category_id"
        defaultValue={product?.category_id ?? ""}
        required
        className="w-full p-2 rounded-xl border border-[#C8956C]/30 text-sm"
      >
        <option value="">Selecciona categoría</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.emoji} {c.name}
          </option>
        ))}
      </select>

      <input
        name="name"
        defaultValue={product?.name ?? ""}
        required
        placeholder="Nombre del producto"
        className="w-full p-2 rounded-xl border border-[#C8956C]/30 text-sm"
      />

      <div className="grid grid-cols-3 gap-2">
        <input
          name="precio_m"
          type="number"
          defaultValue={product?.precio_m ?? ""}
          placeholder="Precio M"
          className="p-2 rounded-xl border border-[#C8956C]/30 text-sm"
        />
        <input
          name="precio_g"
          type="number"
          defaultValue={product?.precio_g ?? ""}
          placeholder="Precio G"
          className="p-2 rounded-xl border border-[#C8956C]/30 text-sm"
        />
        <input
          name="precio_unico"
          type="number"
          defaultValue={product?.precio_unico ?? ""}
          placeholder="P. Único"
          className="p-2 rounded-xl border border-[#C8956C]/30 text-sm"
        />
      </div>

      <input
        name="sabores"
        defaultValue={product?.sabores?.join(", ") ?? ""}
        placeholder="Sabores (separados por coma)"
        className="w-full p-2 rounded-xl border border-[#C8956C]/30 text-sm"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 rounded-xl bg-[#F4A261] text-white font-bold text-sm hover:bg-[#e8914f] disabled:opacity-40"
        >
          {loading ? "Guardando..." : product ? "Actualizar" : "Crear"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 rounded-xl bg-gray-200 text-[#3D2B1F] text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
