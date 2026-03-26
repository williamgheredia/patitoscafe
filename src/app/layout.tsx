import type { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Patitos Café | Menú",
  description: "Explora nuestro menú de cafés, frappes, smoothies y más 🐥",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFF8F0",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={nunito.variable}>
      <body className="font-[family-name:var(--font-nunito)] min-h-screen bg-[#FFF8F0]">
        {children}
      </body>
    </html>
  )
}
