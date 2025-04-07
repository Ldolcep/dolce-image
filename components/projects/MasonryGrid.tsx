"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { applyRepulsionEffect, resetRepulsionEffect } from "@/utils/animations"

interface MasonryGridProps {
  children: React.ReactNode
  columns?: { mobile: number; tablet: number; desktop: number }
  gap?: string
}

export default function MasonryGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = "gap-6",
}: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Vérifier la préférence de réduction de mouvement
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Gérer le mouvement de la souris
  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseLeave = () => {
      setMousePosition(null)
      resetRepulsionEffect(gridRef)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [prefersReducedMotion])

  // Appliquer l'effet de répulsion
  useEffect(() => {
    if (prefersReducedMotion) return

    if (mousePosition) {
      applyRepulsionEffect(gridRef, mousePosition)
    } else {
      resetRepulsionEffect(gridRef)
    }
  }, [mousePosition, prefersReducedMotion])

  return (
    <motion.div
      ref={gridRef}
      className={`columns-${columns.mobile} sm:columns-${columns.tablet} lg:columns-${columns.desktop} ${gap}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

