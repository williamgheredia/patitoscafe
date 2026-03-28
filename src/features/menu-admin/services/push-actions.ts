"use server"

import webpush from "web-push"
import { createAdminClient } from "@/lib/supabase/admin"
import { getStaffSession } from "@/features/loyalty/services/pin-actions"
import { revalidatePath } from "next/cache"

async function requireStaff() {
  const session = await getStaffSession()
  if (!session) throw new Error("No autorizado")
  return session
}

function initWebPush() {
  const publicKey = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "").trim().replace(/=+$/, "")
  const privateKey = (process.env.VAPID_PRIVATE_KEY ?? "").trim().replace(/=+$/, "")
  webpush.setVapidDetails(
    "mailto:patitoscafe@example.com",
    publicKey,
    privateKey
  )
}

export async function sendPushNotification(
  title: string,
  body: string,
  url?: string
): Promise<{ success: boolean; sent: number; failed: number; error?: string }> {
  let session
  try {
    session = await requireStaff()
  } catch {
    return { success: false, sent: 0, failed: 0, error: "No autorizado. Cierra sesión y vuelve a entrar." }
  }

  try {
    initWebPush()
  } catch (e) {
    return { success: false, sent: 0, failed: 0, error: `Error VAPID: ${e}` }
  }

  const supabase = createAdminClient()

  // Get all subscriptions
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("*")

  if (error) return { success: false, sent: 0, failed: 0, error: error.message }
  if (!subs || subs.length === 0) return { success: false, sent: 0, failed: 0, error: "No hay suscriptores" }

  const payload = JSON.stringify({ title, body, url: url || "/" })

  let sent = 0
  let failed = 0
  const expiredEndpoints: string[] = []

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        payload
      )
      sent++
    } catch (err: unknown) {
      failed++
      // Remove expired/invalid subscriptions
      const statusCode = (err as { statusCode?: number })?.statusCode
      if (statusCode === 410 || statusCode === 404) {
        expiredEndpoints.push(sub.endpoint)
      }
    }
  }

  // Clean up expired subscriptions
  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints)
  }

  // Log the notification
  await supabase.from("push_notifications_log").insert({
    title,
    body,
    sent_count: sent,
    sent_by: session.employeeId,
  })

  revalidatePath("/staff/notificaciones")
  return { success: true, sent, failed }
}

export async function getSubscriberCount(): Promise<number> {
  const supabase = createAdminClient()
  const { count } = await supabase
    .from("push_subscriptions")
    .select("*", { count: "exact", head: true })
  return count ?? 0
}

export async function getNotificationLog(): Promise<
  { id: string; title: string; body: string; sent_count: number; created_at: string }[]
> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("push_notifications_log")
    .select("id, title, body, sent_count, created_at")
    .order("created_at", { ascending: false })
    .limit(20)
  return data ?? []
}

export async function deleteNotification(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff()
  } catch {
    return { success: false, error: "No autorizado" }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("push_notifications_log")
    .delete()
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/staff/notificaciones")
  revalidatePath("/notificaciones")
  return { success: true }
}

export async function clearAllNotifications(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireStaff()
  } catch {
    return { success: false, error: "No autorizado" }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from("push_notifications_log")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000") // delete all rows

  if (error) return { success: false, error: error.message }

  revalidatePath("/staff/notificaciones")
  revalidatePath("/notificaciones")
  return { success: true }
}
