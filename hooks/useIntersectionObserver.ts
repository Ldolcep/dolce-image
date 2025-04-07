"use client"

import { useState, useEffect, useRef, type RefObject } from "react"

interface UseIntersectionObserverProps {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver({
  root = null,
  rootMargin = "0px",
  threshold = 0,
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}): [boolean, RefObject<HTMLElement>] {
  const [isIntersecting, setIntersecting] = useState<boolean>(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting

        // Mettre à jour l'état seulement si l'élément est visible
        // ou si nous ne "gelons" pas la visibilité
        if (isElementIntersecting || !freezeOnceVisible) {
          setIntersecting(isElementIntersecting)
        }
      },
      { root, rootMargin, threshold },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [root, rootMargin, threshold, freezeOnceVisible])

  return [isIntersecting, elementRef]
}

