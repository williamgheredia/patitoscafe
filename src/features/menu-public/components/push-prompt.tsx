"use client"

import { useState, useEffect } from "react"

export function PushPrompt() {
  const [show, setShow] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    if (localStorage.getItem("patitos_push_dismissed")) return

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setSubscribed(true)
        } else {
          // Show after install prompt has had time to show (8s)
          const timer = setTimeout(() => setShow(true), 8000)
          return () => clearTimeout(timer)
        }
      })
    })
  }, [])

  async function handleSubscribe() {
    setSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        handleDismiss()
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      })

      const json = sub.toJSON()

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      })

      if (res.ok) {
        setSubscribed(true)
        setShow(false)
      } else {
        console.error("Subscribe API error:", await res.text())
      }
    } catch (err) {
      console.error("Push subscribe error:", err)
    }
    setSubscribing(false)
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem("patitos_push_dismissed", "1")
  }

  if (!show || subscribed) return null

  return (
    <div className="fixed top-16 left-4 right-4 z-45 max-w-lg mx-auto animate-fade-up">
      <div className="bg-[#3D2B1F] rounded-2xl shadow-xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🔔</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">
            Activa las notificaciones
          </p>
          <p className="text-xs text-white/60 mt-0.5">
            Te avisamos de promos, nuevos productos y ofertas especiales
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="flex-1 py-2.5 rounded-xl bg-[#F4A261] text-white text-sm font-extrabold hover:bg-[#e8914f] active:scale-[0.97] transition-all disabled:opacity-60"
            >
              {subscribing ? "Activando..." : "Sí, avísame"}
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white/50 text-sm font-bold hover:bg-white/20 transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
