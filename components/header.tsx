"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useCallback, useMemo } from "react"

// --- Début de la fonction Throttle (peut être dans un fichier utils) ---
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
        timeoutId = null
      }, limit)
    }
  } as T & { cancel: () => void }
  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    inThrottle = false
  }
  return throttled
}
// --- Fin de la fonction Throttle ---

// Définissez les chemins de vos logos
const LOGO_STAGE_1 = "/images/DOLCE_LOGO_PRIMAIRE.png"; // Votre logo initial
const LOGO_STAGE_2 = "/images/DOLCE_LOGO_SECONDAIRE.png"; // Votre logo après scroll (à remplacer par le bon chemin)

export default function Header() {
  const [headerBgOpacity, setHeaderBgOpacity] = useState(0)
  const [currentLogo, setCurrentLogo] = useState(LOGO_STAGE_1) // État pour le logo actuel

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  const calculateAndSetStyles = useCallback(() => {
    const heroSection = document.getElementById("hero-section") // Assurez-vous que votre section Hero a cet ID
    const scrollY = window.scrollY
    const maxOpacity = 0.9 // Correspond à bg-white/90

    if (!heroSection) {
      // Comportement si la section hero n'est pas trouvée (par exemple, sur d'autres pages)
      setHeaderBgOpacity(maxOpacity)
      setCurrentLogo(LOGO_STAGE_2) // Afficher le logo stage 2 par défaut si pas de hero
      return
    }

    const heroHeight = heroSection.offsetHeight
    const heroBottom = heroSection.offsetTop + heroHeight // Position du bas de la section Hero
    
    // Calcul de l'opacité
    let currentOpacity = (scrollY / heroHeight) * maxOpacity
    currentOpacity = Math.min(currentOpacity, maxOpacity)
    currentOpacity = Math.max(currentOpacity, 0)
    setHeaderBgOpacity(currentOpacity)

    // Changement du logo
    // Si le haut de la fenêtre a dépassé le bas de la section hero
    if (scrollY > heroBottom) {
      setCurrentLogo(LOGO_STAGE_2)
    } else {
      setCurrentLogo(LOGO_STAGE_1)
    }

    // Reset de l'opacité si tout en haut
    // Cette condition est déjà gérée par le calcul de `currentOpacity`
    // si `scrollY` est 0, `currentOpacity` sera 0.
    // On s'assure juste que le logo est aussi au stage 1
    if (scrollY === 0) {
        setCurrentLogo(LOGO_STAGE_1);
        // setHeaderBgOpacity(0); // Déjà fait par la logique de calcul d'opacité
    }

  }, []) // Les dépendances sont vides, setHeaderBgOpacity et setCurrentLogo sont stables

  const throttledHandleScroll = useMemo(
    () => throttle(calculateAndSetStyles, 50), // Réduit un peu le délai du throttle pour plus de réactivité
    [calculateAndSetStyles]
  )

  useEffect(() => {
    calculateAndSetStyles() // Appel initial

    window.addEventListener("scroll", throttledHandleScroll)
    
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll)
      throttledHandleScroll.cancel()
    }
  }, [calculateAndSetStyles, throttledHandleScroll])

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm transition-colors duration-300"
      style={{ backgroundColor: `rgba(255, 255, 255, ${headerBgOpacity})` }}
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="relative h-12 w-36 md:h-14 md:w-40 mx-2">
          {/* Utiliser l'état currentLogo pour la source de l'image */}
          <Image 
            key={currentLogo}
            src={currentLogo}
            alt="Logo Dolce, retour à l’accueil"
            fill
            className="object-contain"
            priority={currentLogo === LOGO_STAGE_1}
            sizes="(max-width: 768px) 150px, 200px"
          />
        </Link>
        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => scrollToSection("projects")}
            className="text-sm hover:text-primary-orange transition-colors focus:outline-none focus:text-primary-orange"
          >
            PROJECTS
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-sm hover:text-primary-orange transition-colors focus:outline-none focus:text-primary-orange"
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
