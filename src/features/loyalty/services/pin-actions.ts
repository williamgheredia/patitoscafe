"use server"

import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import type { StaffSession } from "../types/loyalty"

const COOKIE_NAME = "patitos_staff_session"
const COOKIE_MAX_AGE = 60 * 60 * 12 // 12 horas

export async function verifyPin(pin: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("employee_pins")
    .select("id, name")
    .eq("pin", pin)
    .eq("is_active", true)
    .single()

  if (error || !data) {
    return { success: false, error: "PIN incorrecto" }
  }

  const session: StaffSession = {
    employeeId: data.id,
    employeeName: data.name,
  }

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/staff",
  })

  return { success: true }
}

export async function getStaffSession(): Promise<StaffSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return null

  try {
    return JSON.parse(raw) as StaffSession
  } catch {
    return null
  }
}

export async function logoutStaff(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    path: "/staff",
    maxAge: 0,
  })
}
