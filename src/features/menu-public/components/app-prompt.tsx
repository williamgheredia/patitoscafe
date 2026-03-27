"use client"

import { useState, useEffect, useRef } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

async function subscribeToPush(): Promise<boolean> {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false

    const permission = await Notification.requestPermission()
    if (permission !== "granted") return false

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })

    const json = sub.toJSON()
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    })

    return res.ok
  } catch (err) {
    console.error("Push subscribe error:", err)
    return false
  }
}

type PromptMode = "install" | "push-only" | "ios" | "hidden"

export function AppPrompt() {
  const [mode, setMode] = useState<PromptMode>("hidden")
  const [busy, setBusy] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Already dismissed
    if (localStorage.getItem("patitos_app_dismissed")) return
    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Check if already subscribed to push
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) return // Already subscribed, don't show anything
        })
      })
    }

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.userAgent.includes("Mac") && "ontouchend" in document)

    if (isIOS) {
      const timer = setTimeout(() => setMode("ios"), 3000)
      return () => clearTimeout(timer)
    }

    // Android/Desktop — listen for install prompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setMode("install")
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    // If no install prompt after 5s (already installed or not supported), show push-only
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt.current) {
        // Check if push is available and not subscribed
        if ("PushManager" in window) {
          navigator.serviceWorker?.ready.then((reg) => {
            reg.pushManager.getSubscription().then((sub) => {
              if (!sub) setMode("push-only")
            })
          })
        }
      }
    }, 5000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      clearTimeout(fallbackTimer)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt.current) return
    setBusy(true)

    // Step 1: Trigger install
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    deferredPrompt.current = null

    if (outcome === "accepted") {
      // Step 2: Immediately subscribe to push
      await subscribeToPush()
      setMode("hidden")
      localStorage.setItem("patitos_app_dismissed", "1")
    } else {
      // Didn't install — show push-only after a moment
      setBusy(false)
      setTimeout(() => setMode("push-only"), 2000)
    }
  }

  async function handlePushOnly() {
    setBusy(true)
    const ok = await subscribeToPush()
    if (ok) {
      setMode("hidden")
    }
    setBusy(false)
    localStorage.setItem("patitos_app_dismissed", "1")
  }

  function handleDismiss() {
    setMode("hidden")
    localStorage.setItem("patitos_app_dismissed", "1")
  }

  if (mode === "hidden") return null

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-lg mx-auto animate-fade-up">
      <div className="bg-[#3D2B1F] rounded-2xl shadow-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🐥</span>
          <div className="flex-1 min-w-0">
            {mode === "install" && (
              <>
                <p className="text-sm font-bold text-white">
                  Instala Patitos Café
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Accede al menú y recibe promos directo en tu celular
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    disabled={busy}
                    className="flex-1 py-2.5 rounded-xl bg-[#F4A261] text-white text-sm font-extrabold hover:bg-[#e8914f] active:scale-[0.97] transition-all disabled:opacity-60"
                  >
                    {busy ? "Instalando..." : "Instalar"}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2.5 rounded-xl bg-white/10 text-white/50 text-sm font-bold hover:bg-white/20 transition-colors"
                  >
                    Ahora no
                  </button>
                </div>
              </>
            )}

            {mode === "push-only" && (
              <>
                <p className="text-sm font-bold text-white">
                  Activa las notificaciones
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Te avisamos de promos, nuevos productos y ofertas especiales
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handlePushOnly}
                    disabled={busy}
                    className="flex-1 py-2.5 rounded-xl bg-[#F4A261] text-white text-sm font-extrabold hover:bg-[#e8914f] active:scale-[0.97] transition-all disabled:opacity-60"
                  >
                    {busy ? "Activando..." : "Sí, avísame"}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2.5 rounded-xl bg-white/10 text-white/50 text-sm font-bold hover:bg-white/20 transition-colors"
                  >
                    No
                  </button>
                </div>
              </>
            )}

            {mode === "ios" && (
              <>
                <p className="text-sm font-bold text-white">
                  Instala Patitos Café
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Toca{" "}
                  <svg className="w-4 h-4 text-[#007AFF] inline-block mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>{" "}
                  y luego <strong className="text-white">&quot;Agregar a inicio&quot;</strong> para instalar
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm font-bold hover:bg-white/20 transition-colors"
                  >
                    Entendido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
