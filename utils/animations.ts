import type { RefObject } from "react"

interface Position {
  x: number
  y: number
}

export function calculateRepulsion(
  element: HTMLElement,
  mousePosition: Position,
  intensity = 0.15,
  maxDistance = 300,
): { x: number; y: number; scale: number } {
  const rect = element.getBoundingClientRect()

  // Centre de l'élément
  const elementCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }

  // Distance entre la souris et le centre de l'élément
  const dx = mousePosition.x - elementCenter.x
  const dy = mousePosition.y - elementCenter.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Si la distance est supérieure à maxDistance, pas d'effet
  if (distance > maxDistance) {
    return { x: 0, y: 0, scale: 1 }
  }

  // Calculer l'intensité de la répulsion en fonction de la distance
  const factor = (1 - distance / maxDistance) * intensity

  // Direction opposée à la souris
  const repulsionX = -dx * factor
  const repulsionY = -dy * factor

  // Échelle légèrement plus grande pour l'élément survolé
  const isHovered =
    rect.left <= mousePosition.x &&
    mousePosition.x <= rect.right &&
    rect.top <= mousePosition.y &&
    mousePosition.y <= rect.bottom
  const scale = isHovered ? 1.05 : 1

  return { x: repulsionX, y: repulsionY, scale }
}

export function applyRepulsionEffect(
  containerRef: RefObject<HTMLElement>,
  mousePosition: Position | null,
  selector = ".project-card",
): void {
  if (!containerRef.current || !mousePosition) return

  const cards = containerRef.current.querySelectorAll(selector)

  cards.forEach((card) => {
    const element = card as HTMLElement
    const { x, y, scale } = calculateRepulsion(element, mousePosition)

    element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    element.style.zIndex = scale > 1 ? "10" : "1"
  })
}

export function resetRepulsionEffect(containerRef: RefObject<HTMLElement>, selector = ".project-card"): void {
  if (!containerRef.current) return

  const cards = containerRef.current.querySelectorAll(selector)

  cards.forEach((card) => {
    const element = card as HTMLElement
    element.style.transform = "translate(0, 0) scale(1)"
    element.style.zIndex = "1"
  })
}

