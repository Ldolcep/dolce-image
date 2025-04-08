import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import localFont from "next/font/local"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const koolegant = localFont({
  src: "../public/fonts/Koolegant.woff2",
  variable: "--font-koolegant",
  display: "swap",
})

const cocogoose = localFont({
  src: "../public/fonts/Cocogoose.woff2",
  variable: "--font-cocogoose",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dolce | Digital Agency",
  description: "Elevate your brand with Dolce digital agency",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${koolegant.variable} ${cocogoose.variable} antialiased`}>{children}</body>
    </html>
  )
}


import './globals.css'