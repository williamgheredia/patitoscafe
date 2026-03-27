"use client"

import { useState, useEffect, useRef } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

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

export function SubscribeButton() {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already subscribed
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => { if (sub) setDone(true) })
        .catch(() => {})
    }

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDone(true)
    }

    function handleBeforeInstall(e: Event) {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
  }, [])

  async function handleClick() {
    setBusy(true)

    // Step 1: If can install, trigger install first
    if (canInstall && deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      const { outcome } = await deferredPrompt.current.userChoice
      deferredPrompt.current = null
      setCanInstall(false)
      if (outcome !== "accepted") {
        setBusy(false)
        return
      }
    }

    // Step 2: Subscribe to push
    try {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const permission = await Notification.requestPermission()
        if (permission === "granted") {
          const reg = await navigator.serviceWorker.ready
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          if (vapidKey) {
            const keyArray = urlBase64ToUint8Array(vapidKey)
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: keyArray.buffer as ArrayBuffer,
            })
            const json = sub.toJSON()
            await fetch("/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
            })
            setDone(true)
          }
        }
      }
    } catch (err) {
      console.error("Subscribe error:", err)
    }

    setBusy(false)
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-500">
        🔔 Suscrito a promos
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#F4A261] hover:text-[#e8914f] transition-colors disabled:opacity-50"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {busy ? "Activando..." : "Suscríbete para promos"}
    </button>
  )
}
