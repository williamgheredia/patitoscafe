"use client"

import { useState, useEffect, useRef } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Convert base64url VAPID key to Uint8Array (required by pushManager.subscribe)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function subscribeToPush(): Promise<{ ok: boolean; error?: string }> {
  // Check browser support
  if (!("serviceWorker" in navigator)) {
    return { ok: false, error: "Tu navegador no soporta notificaciones" }
  }
  if (!("PushManager" in window)) {
    return { ok: false, error: "Tu navegador no soporta notificaciones push" }
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    return { ok: false, error: "Configuración de notificaciones incompleta" }
  }

  // Request notification permission
  let permission: NotificationPermission
  try {
    permission = await Notification.requestPermission()
  } catch {
    return { ok: false, error: "No se pudo pedir permiso de notificaciones" }
  }

  if (permission !== "granted") {
    return { ok: false, error: "Permiso de notificaciones denegado" }
  }

  // Wait for service worker with timeout
  let reg: ServiceWorkerRegistration
  try {
    reg = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5000)
      ),
    ])
  } catch {
    // Service worker not ready — try registering it now
    try {
      reg = await navigator.serviceWorker.register("/sw.js")
      // Wait for it to activate
      await new Promise<void>((resolve) => {
        if (reg.active) { resolve(); return }
        const sw = reg.installing || reg.waiting
        if (sw) {
          sw.addEventListener("statechange", () => {
            if (sw.state === "activated") resolve()
          })
        } else {
          resolve()
        }
      })
    } catch (e) {
      return { ok: false, error: `Error registrando service worker: ${e}` }
    }
  }

  // Subscribe to push
  let sub: PushSubscription
  try {
    const keyArray = urlBase64ToUint8Array(vapidKey)
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyArray.buffer as ArrayBuffer,
    })
  } catch (e) {
    return { ok: false, error: `Error suscribiendo: ${e}` }
  }

  // Send subscription to server
  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return { ok: false, error: "Suscripción incompleta" }
  }

  try {
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.error || `Server error: ${res.status}` }
    }

    return { ok: true }
  } catch (e) {
    return { ok: false, error: `Error de red: ${e}` }
  }
}

type PromptMode = "install" | "push-only" | "ios" | "hidden"

export function AppPrompt() {
  const [mode, setMode] = useState<PromptMode>("hidden")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (localStorage.getItem("patitos_app_dismissed")) return
    if (window.matchMedia("(display-mode: standalone)").matches) return

    // Check if already subscribed
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) {
            localStorage.setItem("patitos_app_dismissed", "1")
            return
          }
        })
        .catch(() => {})
    }

    // iOS detection
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
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

    // Fallback: if no install prompt after 5s, show push-only
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt.current) {
        setMode("push-only")
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
    setError("")

    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    deferredPrompt.current = null

    if (outcome === "accepted") {
      const result = await subscribeToPush()
      // Installed — dismiss regardless of push result
      setMode("hidden")
      localStorage.setItem("patitos_app_dismissed", "1")
      if (!result.ok) {
        // Installed but push failed — that's ok
        console.log("PWA installed, push subscribe failed:", result.error)
      }
    } else {
      setBusy(false)
      setTimeout(() => setMode("push-only"), 2000)
    }
  }

  async function handlePushOnly() {
    setBusy(true)
    setError("")

    const result = await subscribeToPush()

    if (result.ok) {
      setMode("hidden")
      localStorage.setItem("patitos_app_dismissed", "1")
    } else {
      // Show error — DON'T dismiss, let user retry
      setError(result.error || "Error desconocido")
      setBusy(false)
    }
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
                {error && (
                  <p className="text-xs text-red-400 mt-2 bg-red-400/10 rounded-lg px-2 py-1">
                    {error}
                  </p>
                )}
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
