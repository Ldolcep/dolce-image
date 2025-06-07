// --- START OF FILE layout.tsx ---

import type React from "react"
import type { Metadata } from "next"
// Importez les nouvelles polices
import { DM_Serif_Display, Montserrat } from "next/font/google"
import "./globals.css"
import "./safari-fixes.css"

// Configuration pour DM Serif Display
const dmSerifDisplay = DM_Serif_Display({
  weight: "400", // DM Serif Display a généralement un seul poids normal
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif-display", // Variable CSS pour les titres
})

// Configuration pour Montserrat
const montserrat = Montserrat({
  weight: ["300", "400", "500", "600", "700"], // Choisissez les poids nécessaires
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat", // Variable CSS pour le corps du texte
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
      {/* Appliquez les variables des nouvelles polices au body */}
      <body className={`${dmSerifDisplay.variable} ${montserrat.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}

import './globals.css'