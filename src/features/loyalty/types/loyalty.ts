export interface EmployeePin {
  id: string
  name: string
  pin: string
  is_active: boolean
}

export interface LoyaltyCard {
  id: string
  whatsapp_number: string
  customer_name: string | null
  stamps_count: number
  total_redeemed: number
  created_at: string
}

export interface LoyaltyEvent {
  id: string
  card_id: string
  event_type: "stamp" | "redeem"
  employee_id: string
  notes: string | null
  created_at: string
}

export interface StaffSession {
  employeeId: string
  employeeName: string
}
