"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback, useMemo } from "react" // Ajout de useMemo

// --- Début de la fonction Throttle (peut être dans un fichier utils) ---
/**
 * Crée une version "throttled" d'une fonction.
 * La fonction throttled, lorsqu'elle est invoquée, ne s'exécutera qu'une fois
 * au maximum par intervalle de `limit` millisecondes.
 * Les appels supplémentaires pendant cette période sont ignorés.
 * Cette version implémente un throttle "leading": le premier appel est exécuté immédiatement.
 * @param func La fonction à throttler.
 * @param limit Le délai en millisecondes.
 * @returns La fonction throttled, avec une méthode `cancel` pour nettoyer les timers.
 */
function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T & { cancel: () => void } {
  let inThrottle: boolean = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const throttled = function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      timeoutId = setTimeout(() => {
        inThrottle = false
        timeoutId = null // Réinitialiser pour indiquer qu'il n'y a plus de timeout actif
      }, limit)
    }
  } as T & { cancel: () => void } // Cast pour inclure la méthode cancel

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    inThrottle = false // Permet un nouvel appel immédiatement si `cancel` est appelée
  }

  return throttled
}
// --- Fin de la fonction Throttle ---


export default function Header() {
  const [headerBgOpacity, setHeaderBgOpacity] = useState(0)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  // La fonction de base qui calcule et met à jour l'opacité
  // useCallback la mémorise pour éviter de la recréer inutilement.
  const calculateAndSetOpacity = useCallback(() => {
    const heroSection = document.getElementById("hero-section")
    if (!heroSection) {
      setHeaderBgOpacity(0.9) // Valeur par défaut si hero non trouvé
      return
    }

    const heroHeight = heroSection.offsetHeight
    const scrollY = window.scrollY
    const maxOpacity = 0.9 // Correspond à bg-white/90

    let currentOpacity = (scrollY / heroHeight) * maxOpacity
    
    currentOpacity = Math.min(currentOpacity, maxOpacity)
    currentOpacity = Math.max(currentOpacity, 0)

    setHeaderBgOpacity(currentOpacity)
  }, []) // Les dépendances sont vides car setHeaderBgOpacity est stable

  // Crée une version throttled de calculateAndSetOpacity.
  // useMemo garantit que throttledHandleScroll est stable entre les rendus,
  // tant que calculateAndSetOpacity ne change pas.
  // Un délai de 100ms est un bon point de départ, ajustable selon les besoins.
  const throttledHandleScroll = useMemo(
    () => throttle(calculateAndSetOpacity, 100),
    [calculateAndSetOpacity] // Dépendance à la fonction originale
  )

  useEffect(() => {
    // Appel initial pour définir l'opacité au chargement (pas besoin de throttle ici)
    calculateAndSetOpacity() 

    // Ajoute l'écouteur d'événement avec la version throttled
    window.addEventListener("scroll", throttledHandleScroll)
    
    // Fonction de nettoyage exécutée lorsque le composant est démonté
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll)
      // Important: Annuler tout timeout en attente du throttle pour éviter les fuites de mémoire
      // ou les exécutions après le démontage.
      throttledHandleScroll.cancel()
    }
  }, [calculateAndSetOpacity, throttledHandleScroll]) // Dépendances du useEffect

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm transition-colors duration-300"
      style={{ backgroundColor: `rgba(255, 255, 255, ${headerBgOpacity})` }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="relative h-12 w-36 md:h-14 md:w-40 mx-2">
          <Image src="/images/DOLCE_LOGO_PRIMAIRE.png" alt="Dolce" fill className="object-contain" priority />
        </Link>
        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => scrollToSection("projects")}
            className="font-poppins text-sm hover:text-primary-orange transition-colors focus:outline-none focus:text-primary-orange"
          >
            PROJECTS
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="font-poppins text-sm hover:text-primary-orange transition-colors focus:outline-none focus:text-primary-orange"
          >
            CONTACT
          </button>
        </nav>
        <button className="md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}
