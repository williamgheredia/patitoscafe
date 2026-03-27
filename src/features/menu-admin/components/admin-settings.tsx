"use client"

import { useState, useRef } from "react"
import Image from "next/image"

export function AdminSettings({
  settings,
}: {
  settings: Record<string, string>
}) {
  const [iconPreview, setIconPreview] = useState(settings.icon_url || "")
  const [faviconPreview, setFaviconPreview] = useState(settings.favicon_url || "")
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [uploadingFav, setUploadingFav] = useState(false)
  const [error, setError] = useState("")
  const iconRef = useRef<HTMLInputElement>(null)
  const favRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File, type: "icon" | "favicon") {
    const fd = new FormData()
    fd.set("file", file)
    fd.set("type", type)

    const res = await fetch("/api/settings/upload-icon", {
      method: "POST",
      body: fd,
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || "Upload failed")
    }

    return (await res.json()) as { url: string }
  }

  async function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingIcon(true)
    setError("")
    try {
      const { url } = await handleUpload(file, "icon")
      setIconPreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir ícono")
    }
    setUploadingIcon(false)
    if (iconRef.current) iconRef.current.value = ""
  }

  async function handleFaviconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFav(true)
    setError("")
    try {
      const { url } = await handleUpload(file, "favicon")
      setFaviconPreview(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir favicon")
    }
    setUploadingFav(false)
    if (favRef.current) favRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 text-sm font-bold rounded-xl p-3 text-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 border border-[#C8956C]/10">
        <h3 className="font-extrabold text-[#3D2B1F] text-base mb-4">Ícono de la App (PWA)</h3>
        <p className="text-sm text-[#3D2B1F]/50 mb-4">
          Este ícono aparece cuando un cliente instala la app en su celular. Se recomienda una imagen cuadrada de al menos 512x512px.
        </p>

        <div className="flex items-center gap-5">
          <div
            onClick={() => !uploadingIcon && iconRef.current?.click()}
            className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-[#C8956C]/30 hover:border-[#F4A261] cursor-pointer transition-colors flex-shrink-0 bg-[#FFF8F0]"
          >
            {uploadingIcon ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="animate-spin inline-block w-6 h-6 border-2 border-[#F4A261]/30 border-t-[#F4A261] rounded-full" />
              </div>
            ) : iconPreview ? (
              <Image src={iconPreview} alt="App icon" width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl">🐥</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <button
              type="button"
              disabled={uploadingIcon}
              onClick={() => iconRef.current?.click()}
              className="w-full py-2.5 rounded-xl text-sm font-bold border border-[#F4A261]/30 text-[#F4A261] hover:bg-[#F4A261]/5 disabled:opacity-40 transition-colors"
            >
              {uploadingIcon ? "Subiendo..." : iconPreview ? "Cambiar ícono" : "Subir ícono"}
            </button>
            <input
              ref={iconRef}
              type="file"
              accept="image/*"
              onChange={handleIconUpload}
              className="hidden"
            />
            {iconPreview && (
              <p className="text-xs text-green-500 mt-1.5 font-medium text-center">
                Ícono personalizado activo
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-[#C8956C]/10">
        <h3 className="font-extrabold text-[#3D2B1F] text-base mb-4">Favicon</h3>
        <p className="text-sm text-[#3D2B1F]/50 mb-4">
          El ícono pequeño que aparece en la pestaña del navegador. Se recomienda una imagen cuadrada.
        </p>

        <div className="flex items-center gap-5">
          <div
            onClick={() => !uploadingFav && favRef.current?.click()}
            className="w-16 h-16 rounded-xl overflow-hidden border-2 border-dashed border-[#C8956C]/30 hover:border-[#F4A261] cursor-pointer transition-colors flex-shrink-0 bg-[#FFF8F0]"
          >
            {uploadingFav ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-[#C8956C]/30 border-t-[#C8956C] rounded-full" />
              </div>
            ) : faviconPreview ? (
              <Image src={faviconPreview} alt="Favicon" width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xl">🐥</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <button
              type="button"
              disabled={uploadingFav}
              onClick={() => favRef.current?.click()}
              className="w-full py-2.5 rounded-xl text-sm font-bold border border-[#C8956C]/30 text-[#C8956C] hover:bg-[#C8956C]/5 disabled:opacity-40 transition-colors"
            >
              {uploadingFav ? "Subiendo..." : faviconPreview ? "Cambiar favicon" : "Subir favicon"}
            </button>
            <input
              ref={favRef}
              type="file"
              accept="image/*"
              onChange={handleFaviconUpload}
              className="hidden"
            />
            {faviconPreview && (
              <p className="text-xs text-green-500 mt-1.5 font-medium text-center">
                Favicon personalizado activo
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-[#C8956C]/10">
        <h3 className="font-extrabold text-[#3D2B1F] text-base mb-2">Instalación PWA</h3>
        <p className="text-sm text-[#3D2B1F]/50">
          Los clientes pueden instalar Patitos Café como app en su celular. Solo necesitan abrir el menú en Chrome/Safari y tocar &quot;Agregar a inicio&quot;. El ícono y nombre que subas aquí es lo que verán.
        </p>
      </div>
    </div>
  )
}
