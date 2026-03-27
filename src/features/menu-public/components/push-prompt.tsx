"use client"

import { useState, useEffect } from "react"

export function PushPrompt() {
  const [show, setShow] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    // Only show if: browser supports push, not already subscribed, not dismissed
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    if (localStorage.getItem("patitos_push_dismissed")) return

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setSubscribed(true)
        } else {
          // Show prompt after 5 seconds of browsing
          const timer = setTimeout(() => setShow(true), 5000)
          return () => clearTimeout(timer)
        }
      })
    })
  }, [])

  async function handleSubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, keys }),
      })

      setSubscribed(true)
      setShow(false)
    } catch (err) {
      console.error("Push subscribe error:", err)
      handleDismiss()
    }
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem("patitos_push_dismissed", "1")
  }

  if (!show || subscribed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 max-w-lg mx-auto animate-fade-up">
      <div className="bg-white rounded-2xl shadow-xl border border-[#C8956C]/15 p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🐥</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#3D2B1F]">
            ¿Quieres enterarte de promos y novedades?
          </p>
          <p className="text-xs text-[#3D2B1F]/50 mt-0.5">
            Te avisamos cuando haya algo nuevo en Patitos
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubscribe}
              className="flex-1 py-2 rounded-xl bg-[#F4A261] text-white text-xs font-extrabold hover:bg-[#e8914f] active:scale-[0.97] transition-all"
            >
              Sí, avísame
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-xl bg-[#3D2B1F]/5 text-[#3D2B1F]/40 text-xs font-bold hover:bg-[#3D2B1F]/10 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
