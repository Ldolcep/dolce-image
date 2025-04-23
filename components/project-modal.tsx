// project-modal.tsx - Version restaurée avec styles des contrôles slider mis à jour
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
// import Link from "next/link" // Non utilisé
import { X, ChevronLeft, ChevronRight, Info /*, ArrowLeft */ } from 'lucide-react' // ArrowLeft non utilisé
import { useIsMobile } from "@/hooks/use-mobile"

interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string | string[]
  link: string
}

interface ProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals], [project])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isInfoVisible, setIsInfoVisible] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  // Références restaurées pour le useEffect de synchronisation
  const imageColumnRef = useRef<HTMLDivElement>(null)
  const descriptionColumnRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile() // Utilise le hook existant

  // États pour la gestion du glissement du panneau d'information (mobile)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null)

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setIsInfoVisible(false)
  }, [project])

  // --- useEffect pour synchroniser la hauteur RESTAURÉ ---
  useEffect(() => {
    const adjustHeight = () => {
      // Assure que les refs existent et qu'on n'est pas en mobile
      if (imageColumnRef.current && descriptionColumnRef.current && !isMobile) {
        const imageHeight = imageColumnRef.current.offsetHeight;
        // Applique maxHeight à la colonne description
        descriptionColumnRef.current.style.maxHeight = `${imageHeight}px`;
      } else if (descriptionColumnRef.current && !isMobile) {
         // Si l'image n'a pas de ref ou n'est pas prête, on retire le maxHeight
         descriptionColumnRef.current.style.maxHeight = '';
      }
    };

    if (isOpen && !isMobile) { // Appliquer seulement si ouvert et pas en mobile
      // Délai pour chargement image + listener resize
      const timerId = setTimeout(adjustHeight, 150); // Petit délai augmenté
      window.addEventListener('resize', adjustHeight);

      // Cleanup function
      return () => {
        clearTimeout(timerId);
        window.removeEventListener('resize', adjustHeight);
        // Important: Retirer le maxHeight quand le modal se ferme ou passe en mobile
        if (descriptionColumnRef.current) {
            descriptionColumnRef.current.style.maxHeight = '';
        }
      }
    }
     // Si on passe en mobile pendant que c'est ouvert, retirer maxHeight
     else if (descriptionColumnRef.current) {
         descriptionColumnRef.current.style.maxHeight = '';
     }

  }, [isOpen, isMobile, currentImageIndex]); // Dépendances: ouverture, état mobile, image actuelle

  // Handle animation classes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsAnimating(true)
      }, 10)
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return; // Ne rien faire si fermé

      if (e.key === "Escape") {
        onClose()
      } else if (allVisuals.length > 1) { // Seulement si plusieurs images
          if (e.key === "ArrowRight") {
            handleNext()
          } else if (e.key === "ArrowLeft") {
            handlePrevious()
          }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  // Utilisation de useCallback pour handleNext/Previous serait idéal ici
  // Mais pour l'instant, on les ajoute aux dépendances pour éviter les warnings potentiels
  }, [isOpen, onClose, allVisuals.length]) // handleNext, handlePrevious

  // Utiliser useCallback pour éviter de recréer les fonctions à chaque render si elles sont dans les dépendances de useEffect
  // const handleNext = useCallback(() => { ... }, [allVisuals.length]);
  // const handlePrevious = useCallback(() => { ... }, [allVisuals.length]);
  // Si utilisées, ajouter 'handleNext', 'handlePrevious' dans le tableau de dépendances de useEffect[handleKeyDown]

   const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allVisuals.length)
  }

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allVisuals.length) % allVisuals.length)
  }


  // Toggle pour afficher/masquer les infos (sur mobile)
  const toggleInfo = () => {
    setIsInfoVisible(!isInfoVisible)
  }

  // Gestion du swipe pour les images (mobile)
  const minSwipeDistance = 50
  const onTouchStart = (e: React.TouchEvent) => {
    // Ignorer si on touche le panneau info
    if (panelRef.current?.contains(e.target as Node)) return;
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return; // Ne pas tracker si le start n'est pas sur l'image
    setTouchEnd(e.targetTouches[0].clientX)
  }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrevious()
    }
    // Reset touch points
    setTouchStart(null);
    setTouchEnd(null);
  }

  // Gestion du glissement du panneau d'information (mobile)
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY)
  }
  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (dragStartY === null) return
    setDragCurrentY(e.touches[0].clientY)
    const deltaY = e.touches[0].clientY - dragStartY
    if (deltaY > 0 && panelRef.current) { // Drag vers le bas
      panelRef.current.style.transform = `translateY(${deltaY}px)`
      panelRef.current.style.transition = 'none'; // Pas de transition pendant le drag
    }
  }
  const handlePanelTouchEnd = () => {
    if (dragStartY === null || dragCurrentY === null) return
    const deltaY = dragCurrentY - dragStartY
    if (deltaY > 70) { // Fermer si glissé assez bas
      setIsInfoVisible(false)
    }
    // Remettre en place avec animation (ou laisser fermé si isInfoVisible est false)
    if (panelRef.current) {
      panelRef.current.style.transition = 'transform 0.3s ease-out';
      panelRef.current.style.transform = '';
    }
    // Réinitialiser les états
    setDragStartY(null)
    setDragCurrentY(null)
  }


  if (!isOpen) return null

  // --- VERSION MOBILE (GARDÉE INCHANGÉE PAR RAPPORT À LA VERSION PRÉCÉDENTE) ---
  if (isMobile) {
     // Le code de la version mobile reste identique à celui de votre dernier fichier fonctionnel
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}>
        {/* Barre de navigation supérieure */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          <button onClick={onClose} className="text-white rounded-full p-2" aria-label="Fermer"><X size={24} /></button>
          <h3 id={`modal-title-${project.id}`} className="text-white text-lg font-medium truncate mx-4 flex-1 text-center">{project.title}</h3>
          <button className={`text-white rounded-full py-2 px-3 flex items-center gap-1 text-sm ${ isInfoVisible ? 'bg-white/30' : 'bg-black/40 backdrop-blur-sm'}`} onClick={toggleInfo} aria-label={isInfoVisible ? "Masquer la description" : "Afficher la description"} aria-expanded={isInfoVisible}><Info size={18} /><span>Infos</span></button>
        </div>
        {/* Contenu principal (image) */}
        <div className="h-full w-full transition-all duration-300" style={{ filter: isInfoVisible ? 'blur(2px)' : 'none', transform: isInfoVisible ? 'scale(0.98)' : 'scale(1)'}} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <Image src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} fill className="object-contain" sizes="100vw" priority={currentImageIndex === 0} key={allVisuals[currentImageIndex]}/>
        </div>
        {/* Boutons de navigation */}
        {allVisuals.length > 1 && (<>
            <button onClick={handlePrevious} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-black/50" aria-label="Image précédente"><ChevronLeft size={24} /></button>
            <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-black/50" aria-label="Image suivante"><ChevronRight size={24} /></button>
        </>)}
        {/* Indicateurs de pagination */}
        {allVisuals.length > 1 && (<div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2" aria-label="Indicateurs d'images">
            {allVisuals.map((_, idx) => (<button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-2 h-2 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Aller à l'image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined}/>))}
        </div>)}
        {/* Panneau d'information */}
        <div ref={panelRef} className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-lg transition-transform duration-300 ease-out transform ${ isInfoVisible ? 'translate-y-0' : 'translate-y-full'}`} style={{ maxHeight: '60vh' }} onTouchStart={handlePanelTouchStart} onTouchMove={handlePanelTouchMove} onTouchEnd={handlePanelTouchEnd} aria-hidden={!isInfoVisible}>
          <div className="w-full flex justify-center pt-3 pb-2 cursor-grab" aria-hidden="true"><div className="w-10 h-1.5 bg-gray-300 rounded-full"></div></div>
          <div className="p-4 pt-0 border-b"><h2 id="panel-title" className="font-great-vibes text-2xl text-center">{project.title}</h2></div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 70px)' }}>
            <div className="space-y-4">
              {Array.isArray(project.description) ? (project.description.map((paragraph, idx) => (<p key={idx} className="font-poppins text-gray-700 text-sm leading-relaxed">{paragraph}</p>))) : (<p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>)}
            </div>
            {project.link && (<a href={project.link} target="_blank" rel="noopener noreferrer" className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium">Visiter le site du projet</a>)}
          </div>
        </div>
      </div>
    )
  } else {
    // --- VERSION DESKTOP (RESTAURÉE AVEC STYLES CONTRÔLES MIS À JOUR) ---
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 transition-opacity duration-300"
        style={{ opacity: isAnimating ? 1 : 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}
      >
        <div
          ref={modalRef}
          // Classes de base restaurées (pas de max-h conditionnel)
          className="bg-white w-full max-w-5xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl"
          style={{
            transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
            opacity: isAnimating ? 1 : 0
          }}
        >
          {/* Left Column: Image Slider */}
          {/* Ref ajoutée ici */}
          <div className="w-full md:w-1/2 relative" ref={imageColumnRef}>
            {/* Ratio 4/5 conservé */}
            <div className="relative" style={{ aspectRatio: '4/5' }}>
              <Image
                src={allVisuals[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                fill
                 // Utiliser object-contain ou object-cover selon préférence
                 // object-contain est sûr si les images sont exactement 4:5
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={currentImageIndex === 0}
                key={allVisuals[currentImageIndex]}
              />

              {/* --- Navigation Buttons - Style mis à jour --- */}
              {allVisuals.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    // Style des flèches repris de la version précédente
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleNext}
                     // Style des flèches repris de la version précédente
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* --- Indicateurs de pagination - Style mis à jour --- */}
              {allVisuals.length > 1 && (
                 // Positionnement et style du conteneur des points repris
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center" aria-label="Indicateurs d'images">
                  {/* Style du fond des points repris */}
                  <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    {allVisuals.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                         // Style des points individuels repris
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentImageIndex === index
                            ? 'bg-white scale-125'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={`Aller à l'image ${index + 1}`}
                        aria-current={currentImageIndex === index ? "step" : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div> {/* Fin Colonne Gauche */}

          {/* Right Column: Content */}
          <div
            // Classe overflow-y-auto restaurée par défaut, ref ajoutée
            className="w-full md:w-1/2 p-8 overflow-y-auto"
            ref={descriptionColumnRef}
          >
            <h2
              id={`modal-title-${project.id}`}
              className="font-great-vibes text-2xl md:text-3xl font-medium mb-4"
            >
              {project.title}
            </h2>
            {/* Structure du contenu texte restaurée */}
            <div className="font-poppins text-base text-gray-700 leading-relaxed">
              {Array.isArray(project.description) ? (
                project.description.map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))
              ) : (
                <p>{project.description}</p>
              )}
            </div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-poppins block mt-6 text-primary-blue hover:underline"
              >
                Visiter le site du projet
              </a>
            )}
          </div> {/* Fin Colonne Droite */}

          {/* Close button - Style restauré */}
          <button
            className="absolute -top-5 -right-5 z-20 bg-primary-orange text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div> {/* Fin Conteneur Modal */}
      </div>
    )
  }
}