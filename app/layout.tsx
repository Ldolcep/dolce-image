import type React from "react"
import type { Metadata } from "next"
import { Inter, Great_Vibes, Poppins } from "next/font/google"
import "./globals.css"

// Import Google Fonts
const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-great-vibes",
})

const poppins = Poppins({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      <body className={`${inter.variable} ${greatVibes.variable} ${poppins.variable} antialiased`}>{children}</body>
    </html>
  )
}


import './globals.css'