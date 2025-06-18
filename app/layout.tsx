// app/layout.tsx

import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "@/styles/global.css"

// Polices locales optimisées avec next/font
const cocogoose = localFont({
  src: "../public/fonts/cocogoosepro-regular.woff2",
  weight: '400',
  style: 'normal',
  fallback: ['sans-serif'],
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
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}

import "@/styles/global.css"