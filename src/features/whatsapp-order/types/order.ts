export interface OrderItem {
  productId: string
  productName: string
  size: "M" | "G" | "unico" | null
  sabor: string | null
  extras: string[]
  price: number
}
