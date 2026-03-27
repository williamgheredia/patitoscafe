import type { Metadata, Viewport } from "next"
import { Nunito, Playfair_Display } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Patitos Café | Menú",
  description: "Explora nuestro menú de cafés, frappes, smoothies y más 🐥",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Patitos Café",
  },
  formatDetection: {
    telephone: false,
  },
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
    <html lang="es" className={`${nunito.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="font-[family-name:var(--font-nunito)] min-h-screen bg-[#FFF8F0]">
        {children}
        <Script id="sw-register" strategy="afterInteractive">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`}
        </Script>
      </body>
    </html>
  )
}
