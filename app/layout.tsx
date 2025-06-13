// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "@/styles/global.css"

// Polices locales optimisées avec next/font
const cocogoose = localFont({
  src: [
    { path: "../public/fonts/cocogoosepro-regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/cocogoosepro-ultralight.woff2", weight: "200", style: "normal" },
  ],
  variable: "--font-cocogoose",
  display: "swap",
})

const koolegant = localFont({
  src: "../public/fonts/koolegant-webfont.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-koolegant",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dolce | Digital Agency",
  description: "Elevate your brand with Dolce digital agency",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`scroll-smooth ${cocogoose.variable} ${koolegant.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}

import "@/styles/global.css"