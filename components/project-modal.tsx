// project-modal.tsx - Version modifiée pour limiter la hauteur et activer le scroll
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
// import Link from "next/link" // Link n'est pas utilisé, remplacé par <a> pour les liens externes
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
  // Les refs de colonnes ne sont plus nécessaires pour la synchronisation JS
  // const imageColumnRef = useRef<HTMLDivElement>(null);
  // const descriptionColumnRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile() // Utilise le hook existant

  // États pour la gestion du glissement du panneau d'information
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null)

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setIsInfoVisible(false)
  }, [project])

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
      if (e.key === "Escape" && isOpen) {
        onClose()
      } else if (e.key === "ArrowRight" && isOpen && allVisuals.length > 1) {
        handleNext()
      } else if (e.key === "ArrowLeft" && isOpen && allVisuals.length > 1) {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  // Ajout de allVisuals.length et des fonctions handleNext/Previous aux dépendances si ESLint le demande
  }, [isOpen, onClose, allVisuals.length]) // handleNext/Previous pourraient être mises dans useCallback si nécessaire

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

  // Gestion du swipe pour les images
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrevious()
    }
    // Reset touch points
    setTouchStart(null);
    setTouchEnd(null);
  }

  // Gestion du glissement du panneau d'information
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    setDragStartY(e.touches[0].clientY)
  }

  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (dragStartY === null) return
    setDragCurrentY(e.touches[0].clientY)

    const deltaY = e.touches[0].clientY - dragStartY
    if (deltaY > 0 && panelRef.current) {
      // Seulement permettre de glisser vers le bas
      panelRef.current.style.transform = `translateY(${deltaY}px)`
    }
  }

  const handlePanelTouchEnd = () => {
    if (dragStartY === null || dragCurrentY === null) return

    const deltaY = dragCurrentY - dragStartY
    if (deltaY > 70) {
      // Si glissé suffisamment bas, fermer le panneau
      setIsInfoVisible(false)
      // Réinitialiser la position seulement si on ferme
      if (panelRef.current) {
        panelRef.current.style.transform = ''
      }
    } else {
      // Sinon, remettre en place avec animation
       if (panelRef.current) {
        panelRef.current.style.transition = 'transform 0.3s ease-out';
        panelRef.current.style.transform = '';
        // Optionnel: Supprimer la transition après l'animation pour les prochains drags
        setTimeout(() => {
          if(panelRef.current) panelRef.current.style.transition = '';
        }, 300);
      }
    }

    // Réinitialiser les états
    setDragStartY(null)
    setDragCurrentY(null)
  }

  if (!isOpen) return null

  // Utilisation de l'approche mobile ou desktop en fonction de la taille de l'écran
  if (isMobile) {
    // --- VERSION MOBILE (INCHANGÉE) ---
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}>

        {/* Barre de navigation supérieure */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          <button
            onClick={onClose}
            className="text-white rounded-full p-2"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>

          <h3 id={`modal-title-${project.id}`} className="text-white text-lg font-medium truncate mx-4 flex-1 text-center">{project.title}</h3>

          <button
            className={`text-white rounded-full py-2 px-3 flex items-center gap-1 text-sm ${ // px réduit
              isInfoVisible ? 'bg-white/30' : 'bg-black/40 backdrop-blur-sm'
            }`}
            onClick={toggleInfo}
            aria-label={isInfoVisible ? "Masquer la description" : "Afficher la description"}
            aria-expanded={isInfoVisible} // Ajout aria-expanded
          >
            <Info size={18} />
            <span>Infos</span> {/* Texte plus court */}
          </button>
        </div>

        {/* Contenu principal (image) */}
        <div
          className="h-full w-full transition-all duration-300"
          style={{
            filter: isInfoVisible ? 'blur(2px)' : 'none',
            transform: isInfoVisible ? 'scale(0.98)' : 'scale(1)'
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={allVisuals[currentImageIndex]}
            alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority={currentImageIndex === 0} // Priority seulement pour la 1ère image
            // Ajout d'un key pour forcer le re-render sur changement d'image si nécessaire
            // key={allVisuals[currentImageIndex]}
          />
        </div>

        {/* Boutons de navigation */}
        {allVisuals.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-black/50"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-black/50"
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicateurs de pagination */}
        {allVisuals.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2" aria-label="Indicateurs d'images">
            {allVisuals.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                aria-label={`Aller à l'image ${idx + 1}`}
                aria-current={currentImageIndex === idx ? "step" : undefined}
              />
            ))}
          </div>
        )}

        {/* Panneau d'information */}
        <div
          ref={panelRef}
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-lg transition-transform duration-300 ease-out transform ${ // Ajout shadow et ease-out
            isInfoVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '60vh' }} // Légèrement plus haut peut-être ?
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
          aria-hidden={!isInfoVisible} // Ajout aria-hidden
          // Rôle optionnel si le contenu est significatif
          // role="complementary" ou "region" aria-labelledby="panel-title"
        >
          {/* Grip */}
          <div className="w-full flex justify-center pt-3 pb-2 cursor-grab" aria-hidden="true">
            <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
          </div>

          <div className="p-4 pt-0 border-b"> {/* Moins de padding top */}
            <h2 id="panel-title" className="font-great-vibes text-2xl text-center">{project.title}</h2>
          </div>

          {/* Contenu scrollable du panneau */}
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 70px)' }}> {/* Ajuster selon padding/hauteur titre/grip */}
            <div className="space-y-4">
              {Array.isArray(project.description) ? (
                project.description.map((paragraph, idx) => (
                  <p key={idx} className="font-poppins text-gray-700 text-sm leading-relaxed">{paragraph}</p> // Taille texte/interligne ajustés
                ))
              ) : (
                <p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>
              )}
            </div>

            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium" // Ajusté style/taille
              >
                Visiter le site du projet
              </a>
            )}
          </div>
        </div>
      </div>
    )
  } else {
    // --- VERSION DESKTOP (MODIFIÉE) ---

    // Définir la valeur max-height (peut être ajustée)
    const maxHeightValue = "85vh";

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 transition-opacity duration-300"
        style={{ opacity: isAnimating ? 1 : 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}
      >
        {/* Conteneur principal du modal */}
        <div
          ref={modalRef}
          // Ajout des classes conditionnelles pour max-height et overflow dans la plage 768px - 1367px
          className={`
            bg-white w-full max-w-5xl flex flex-col md:flex-row relative
            transition-transform duration-300 shadow-xl rounded-lg  /* Ajout rounded-lg */
            md:max-[1367px]:max-h-[${maxHeightValue}]
            md:max-[1367px]:overflow-hidden /* Empêche le conteneur modal de scroller */
          `}
          style={{
            transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
            opacity: isAnimating ? 1 : 0
          }}
        >
          {/* Left Column: Image Slider */}
          <div className="w-full md:w-1/2 relative flex-shrink-0"> {/* Ajout flex-shrink-0 */}
            {/* Conteneur maintenant le ratio 4/5 */}
            <div className="relative" style={{ aspectRatio: '4/5' }}>
              <Image
                src={allVisuals[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                fill
                // object-contain est préférable si l'image source est garantie 4:5
                // Si elle peut varier légèrement, 'cover' la rognera pour remplir.
                className="object-contain md:rounded-l-lg" // Ajout rounded sur desktop
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={currentImageIndex === 0} // Priority seulement pour la 1ère image
                key={allVisuals[currentImageIndex]} // Peut aider au re-render sur changement src
              />

              {/* Navigation Buttons */}
              {allVisuals.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" // Taille réduite, ombre ajoutée
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" // Taille réduite, ombre ajoutée
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Indicateurs de pagination */}
              {allVisuals.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center" aria-label="Indicateurs d'images"> {/* Ajusté position */}
                  <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full"> {/* Fond pour visibilité */}
                    {allVisuals.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentImageIndex === index
                            ? 'bg-white scale-125' // Effet scale plus visible
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
          </div>

          {/* Right Column: Content */}
          <div
             // Ajout des classes conditionnelles pour overflow-y et hauteur dans la plage 768px - 1367px
            className={`
              w-full md:w-1/2 p-6 md:p-8 flex flex-col /* Ajout flex flex-col */
              md:max-[1367px]:overflow-y-auto
              /* md:max-[1367px]:h-full <-- Pas forcément nécessaire avec flex-col */
            `}
             // ref={descriptionColumnRef} <-- ref n'est plus utilisée ici
          >
            {/* Contenu scrollable interne pour gérer le padding */}
            <div className="flex-grow overflow-hidden"> {/* Ce div interne va scroller si nécessaire */}
               <h2
                id={`modal-title-${project.id}`}
                className="font-great-vibes text-2xl md:text-3xl font-medium mb-4 md:mb-6" // Marge ajustée
              >
                {project.title}
              </h2>
              <div className="font-poppins text-sm md:text-base text-gray-700 leading-relaxed space-y-4"> {/* Ajout space-y */}
                {Array.isArray(project.description) ? (
                  project.description.map((paragraph, index) => (
                    <p key={index} className="mb-0">{paragraph}</p> /* mb géré par space-y */
                  ))
                ) : (
                  <p>{project.description}</p>
                )}
              </div>
            </div>

            {/* Lien fixe en bas de la colonne */}
            {project.link && (
              <div className="pt-4 mt-auto"> {/* mt-auto pousse vers le bas */}
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-poppins block text-primary-blue hover:underline text-sm font-medium"
                >
                  Visiter le site du projet
                </a>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            // Positionnement ajusté pour être sur le coin du modal arrondi
            className="absolute top-3 right-3 z-20 bg-gray-700/50 hover:bg-gray-800/70 text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={18} /> {/* Taille icone ajustée */}
          </button>
        </div>
      </div>
    )
  }
}