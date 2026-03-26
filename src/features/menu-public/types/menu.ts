export interface Category {
  id: string
  name: string
  slug: string
  emoji: string | null
  color: string | null
  display_order: number
  is_active: boolean
}

export interface Product {
  id: string
  category_id: string
  name: string
  description: string | null
  image_url: string | null
  precio_m: number | null
  precio_g: number | null
  precio_unico: number | null
  sabores: string[]
  is_available: boolean
  display_order: number
}

export interface Extra {
  id: string
  name: string
  price: number
  is_active: boolean
  display_order: number
}
