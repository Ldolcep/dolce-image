// project-modal.tsx - Version améliorée responsive avec hauteur fixe pour desktop
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ChevronLeft, ChevronRight, Info, ArrowLeft } from 'lucide-react'
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
  const imageColumnRef = useRef<HTMLDivElement>(null)
  const descriptionColumnRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile() // Utilise le hook existant
  
  // État pour stocker la hauteur de l'image
  const [imageHeight, setImageHeight] = useState<number>(0)
  
  // États pour la gestion du glissement du panneau d'information
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null)

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setIsInfoVisible(false)
  }, [project])

  // Effet pour synchroniser la hauteur de la colonne de description avec celle de l'image
  useEffect(() => {
    const adjustHeight = () => {
      if (!imageColumnRef.current || !descriptionColumnRef.current || isMobile) return;
      
      // Obtenir la hauteur réelle de la colonne d'image
      const imgHeight = imageColumnRef.current.offsetHeight;
      setImageHeight(imgHeight);
      
      // Appliquer cette hauteur à la colonne de description
      descriptionColumnRef.current.style.height = `${imgHeight}px`;
    };
    
    // Première synchronisation après chargement de l'image
    if (isOpen) {
      // Utiliser un délai pour s'assurer que l'image est chargée et rendue
      const timer = setTimeout(adjustHeight, 100);
      
      // Ajouter un écouteur pour le redimensionnement de la fenêtre
      window.addEventListener('resize', adjustHeight);
      
      // Ajouter un écouteur pour les changements d'image qui peuvent affecter la hauteur
      const imgElement = imageColumnRef.current?.querySelector('img');
      if (imgElement) {
        imgElement.addEventListener('load', adjustHeight);
      }
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', adjustHeight);
        if (imgElement) {
          imgElement.removeEventListener('load', adjustHeight);
        }
      };
    }
  }, [isOpen, isMobile, currentImageIndex]);

  // Handle animation classes
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
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
      } else if (e.key === "ArrowRight" && isOpen) {
        handleNext()
      } else if (e.key === "ArrowLeft" && isOpen) {
        handlePrevious()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

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
    }
    
    // Réinitialiser la position du panneau
    if (panelRef.current) {
      panelRef.current.style.transform = ''
    }
    
    // Réinitialiser les états
    setDragStartY(null)
    setDragCurrentY(null)
  }

  if (!isOpen) return null

  // Utilisation de l'approche mobile ou desktop en fonction de la taille de l'écran
  if (isMobile) {
    // Version mobile (plein écran)
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
          
          <h3 id={`modal-title-${project.id}`} className="text-white text-lg font-medium truncate mx-4">{project.title}</h3>
          
          <button 
            className={`text-white rounded-full py-2 px-4 flex items-center gap-1 ${
              isInfoVisible ? 'bg-white/30' : 'bg-black/40 backdrop-blur-sm'
            }`}
            onClick={toggleInfo}
            aria-label={isInfoVisible ? "Masquer la description" : "Afficher la description"}
          >
            <Info size={18} />
            <span className="text-sm">Description</span>
          </button>
        </div>
        
        {/* Contenu principal (image) avec gestion du swipe et effet de flou quand info est visible */}
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
            priority
          />
        </div>
        
        {/* Boutons de navigation (semi-transparents) */}
        {allVisuals.length > 1 && (
          <>
            <button 
              onClick={handlePrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button 
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Indicateurs de pagination */}
        {allVisuals.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
            {allVisuals.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2 h-2 rounded-full ${currentImageIndex === idx ? 'bg-white' : 'bg-white/30'}`}
                aria-label={`Aller à l'image ${idx + 1}`}
                aria-current={currentImageIndex === idx}
              />
            ))}
          </div>
        )}
        
        {/* Panneau d'information (apparaît depuis le bas) avec grip et gestion du glissement */}
        <div 
          ref={panelRef}
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg transition-transform duration-300 transform ${
            isInfoVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '50vh' }}
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
        >
          {/* Grip élégant pour indiquer qu'on peut glisser */}
          <div className="w-full flex justify-center py-2 cursor-grab">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>
          
          <div className="p-4 border-b">
            <h2 className="font-great-vibes text-2xl">{project.title}</h2>
          </div>
          
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(50vh - 80px)' }}>
            <div className="space-y-4">
              {Array.isArray(project.description) ? (
                project.description.map((paragraph, idx) => (
                  <p key={idx} className="font-poppins text-gray-700 mb-4">{paragraph}</p>
                ))
              ) : (
                <p className="font-poppins text-gray-700">{project.description}</p>
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
          </div>
        </div>
      </div>
    )
  } else {
    // Version desktop (modal traditionnel mais optimisé) avec hauteur fixe basée sur l'image
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
          className="bg-white w-full max-w-5xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl"
          style={{ 
            transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
            opacity: isAnimating ? 1 : 0,
            maxHeight: '90vh' // Hauteur maximale pour assurer que ça rentre dans l'écran
          }}
        >
          {/* Left Column: Image Slider - Cette colonne définit la hauteur */}
          <div 
            className="w-full md:w-1/2 relative flex-shrink-0" 
            ref={imageColumnRef}
          >
            <div className="relative">
              <Image
                src={allVisuals[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                width={800}
                height={1000}
                className="object-contain w-full h-auto"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                style={{ display: 'block' }} // Assure que l'image se comporte correctement
              />
              
              {/* Navigation Buttons - Left/Right */}
              {allVisuals.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              
              {/* Progress Bar at bottom */}
              {allVisuals.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center p-4">
                  <div className="flex space-x-2">
                    {allVisuals.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index 
                            ? 'bg-black scale-110' 
                            : 'bg-black/50 hover:bg-black/70'
                        }`}
                        aria-label={`Aller à l'image ${index + 1}`}
                        aria-current={currentImageIndex === index}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Content avec défilement si nécessaire */}
          <div 
            ref={descriptionColumnRef}
            className="w-full md:w-1/2 p-8 overflow-y-auto"
            style={{ 
              height: imageHeight > 0 ? `${imageHeight}px` : 'auto' // Utilise la hauteur de l'image
            }}
          >
            <h2 
              id={`modal-title-${project.id}`} 
              className="font-great-vibes text-2xl md:text-3xl font-medium mb-4"
            >
              {project.title}
            </h2>
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
          </div>
          
          {/* Close button - better positioning for visibility */}
          <button
            className="absolute -top-5 -right-5 z-20 bg-primary-orange text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    )
  }
}