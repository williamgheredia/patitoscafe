"use client"

import { useState, useEffect, useRef } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Don't show if already dismissed or already installed
    if (localStorage.getItem("patitos_install_dismissed")) return
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)
    setIsIOS(ios)

    if (ios) {
      // iOS doesn't support beforeinstallprompt — show manual instructions
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }

    // Android/Desktop — capture beforeinstallprompt
    function handlePrompt(e: Event) {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setShow(true)
    }

    window.addEventListener("beforeinstallprompt", handlePrompt)
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt)
  }, [])

  async function handleInstall() {
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      if (outcome === "accepted") {
        setShow(false)
      }
      deferredPrompt.current = null
    }
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem("patitos_install_dismissed", "1")
  }

  if (!show) return null

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-lg mx-auto animate-fade-up">
      <div className="bg-white rounded-2xl shadow-xl border border-[#C8956C]/15 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🐥</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#3D2B1F]">
              Instala Patitos Café
            </p>
            {isIOS ? (
              <p className="text-xs text-[#3D2B1F]/50 mt-1">
                Toca <span className="inline-flex items-center mx-0.5"><svg className="w-4 h-4 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg></span> y luego <strong>&quot;Agregar a inicio&quot;</strong> para instalar la app.
              </p>
            ) : (
              <p className="text-xs text-[#3D2B1F]/50 mt-1">
                Accede al menú directo desde tu pantalla de inicio, sin abrir el navegador.
              </p>
            )}
            <div className="flex gap-2 mt-3">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2 rounded-xl bg-[#F4A261] text-white text-xs font-extrabold hover:bg-[#e8914f] active:scale-[0.97] transition-all"
                >
                  Instalar
                </button>
              )}
              <button
                onClick={handleDismiss}
                className={`${isIOS ? "flex-1" : ""} px-4 py-2 rounded-xl bg-[#3D2B1F]/5 text-[#3D2B1F]/40 text-xs font-bold hover:bg-[#3D2B1F]/10 transition-colors`}
              >
                {isIOS ? "Entendido" : "Ahora no"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
