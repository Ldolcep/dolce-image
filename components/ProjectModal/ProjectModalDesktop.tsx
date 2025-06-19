// --- START OF FILE ProjectModalDesktop.tsx (VERSION COMPLÈTE CORRIGÉE) ---

"use client"

import React, { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { Project } from "@/types/project"

// Durée d'animation constante
const ANIMATION_DURATION = 200; // ms

// Interface pour le projet
// export interface Project {
//   id: string
//   title: string
//   mainVisual: string
//   additionalVisuals: string[]
//   description: string | string[]
//   link: string
// }

interface ProjectModalDesktopProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

// Composant principal sans variables externes
function ProjectModalDesktop({ project, isOpen, onClose }: ProjectModalDesktopProps) {
  // État local
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0)
  const [direction, setDirection] = React.useState(0)
  const [imagesReady, setImagesReady] = React.useState<Set<number>>(new Set())
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(false);

  // Refs
  const modalRef = React.useRef<HTMLDivElement>(null)
  const descriptionRef = React.useRef<HTMLDivElement>(null)
  const imageRef = React.useRef<HTMLImageElement>(null)
  
  // Calcul des visuals
  const allVisuals = React.useMemo(() => {
    return [project.mainVisual, ...project.additionalVisuals].filter(Boolean)
  }, [project.mainVisual, project.additionalVisuals])

  // Reset au changement de projet
  React.useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0)
      setDirection(0)
      setImagesReady(new Set())
    }
  }, [project.id, isOpen])

  // Préchargement des images optimisé
  React.useEffect(() => {
    if (!isOpen) return

    // L'image principale devrait déjà être préchargée
    // Marquer immédiatement la première image comme prête
    setImagesReady(new Set([0]))

    // Précharger les images additionnelles
    allVisuals.forEach((src, index) => {
      if (index === 0) return // Skip la première, déjà marquée
      
      const img = document.createElement('img')
      img.src = src
      img.onload = () => {
        setImagesReady(prev => {
          const newSet = new Set(prev)
          newSet.add(index)
          return newSet
        })
      }
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`)
        setImagesReady(prev => {
          const newSet = new Set(prev)
          newSet.add(index)
          return newSet
        })
      }
    })
  }, [allVisuals, isOpen])

  // Navigation avec protection contre les clics rapides
  const paginate = React.useCallback((newDirection: number) => {
    // Éviter les changements pendant une animation
    if (document.querySelector('.carousel-slide[data-framer-animate="true"]')) {
      return;
    }
    
    setDirection(newDirection)
    setCurrentImageIndex(prev => {
      const newIndex = prev + newDirection
      if (newIndex < 0) return allVisuals.length - 1
      if (newIndex >= allVisuals.length) return 0
      return newIndex
    })
  }, [allVisuals.length])

  const goToNext = React.useCallback(() => paginate(1), [paginate])
  const goToPrevious = React.useCallback(() => paginate(-1), [paginate])

  // Gestion du clavier
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowRight':
          if (allVisuals.length > 1) goToNext()
          break
        case 'ArrowLeft':
          if (allVisuals.length > 1) goToPrevious()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, goToNext, goToPrevious, allVisuals.length])

  // Synchronisation des hauteurs basée sur l'image
  const syncHeights = React.useCallback(() => {
    if (!modalRef.current || !descriptionRef.current) return
    
    const imageElement = modalRef.current.querySelector('.carousel-image') as HTMLElement | null;
    if (!imageElement) return
    
    // Attendre que l'image soit complètement rendue
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const imageHeight = imageElement.offsetHeight
        modalRef.current!.style.height = `${imageHeight}px`
        descriptionRef.current!.style.height = `${imageHeight}px`
      })
    })
  }, [])

  const isCurrentImageReady = imagesReady.has(currentImageIndex)

  React.useEffect(() => {
    if (!isOpen || !isCurrentImageReady) return

    // Synchroniser après le chargement de l'image
    const timeoutId = setTimeout(syncHeights, 50)
    
    // Observer les changements de taille
    const resizeObserver = new ResizeObserver(syncHeights)
    const imageElement = modalRef.current?.querySelector('.carousel-image')
    if (imageElement) {
      resizeObserver.observe(imageElement)
    }
    
    window.addEventListener('resize', syncHeights)
    
    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncHeights)
    }
  }, [isOpen, isCurrentImageReady, currentImageIndex, syncHeights])

  // Gestion de la scrollbar (compatible Safari)
  React.useEffect(() => {
    if (!isOpen || !descriptionRef.current) return

    const desc = descriptionRef.current
    let scrollTimeout: NodeJS.Timeout

    const updateScrollbarVisibility = () => {
      const hasScroll = desc.scrollHeight > desc.clientHeight
      if (hasScroll) {
        desc.style.scrollbarColor = '#f7a520 #fff3e0'
        desc.classList.add('has-scrollbar')
      } else {
        desc.style.scrollbarColor = 'transparent transparent'
        desc.classList.remove('has-scrollbar')
      }
    }

    const handleScroll = () => {
      desc.style.scrollbarColor = '#f7a520 #fff3e0'
      desc.classList.add('scrolling')
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        desc.classList.remove('scrolling')
        if (!desc.matches(':hover')) {
          desc.style.scrollbarColor = 'transparent transparent'
        }
      }, 1000)
    }

    const handleMouseEnter = () => {
      updateScrollbarVisibility()
    }

    const handleMouseLeave = () => {
      if (!desc.classList.contains('scrolling')) {
        const hasScroll = desc.scrollHeight > desc.clientHeight
        if (!hasScroll || !desc.classList.contains('has-scrollbar')) {
          desc.style.scrollbarColor = 'transparent transparent'
        }
      }
    }

    // Initialiser
    updateScrollbarVisibility()
    
    desc.addEventListener('scroll', handleScroll)
    desc.addEventListener('mouseenter', handleMouseEnter)
    desc.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      desc.removeEventListener('scroll', handleScroll)
      desc.removeEventListener('mouseenter', handleMouseEnter)
      desc.removeEventListener('mouseleave', handleMouseLeave)
      clearTimeout(scrollTimeout)
    }
  }, [isOpen, currentImageIndex])

  if (!isOpen) return null

  // Variants définis inline pour éviter les problèmes de référence
  const slideVariants = {
    initial: (custom: number) => ({
      x: custom > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (custom: number) => ({
      x: custom < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-backdrop"
        className="fixed inset-0 flex items-center justify-center p-4 md:p-6 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        {/* Fond */}
        <div className="absolute inset-0 -z-10">
          <Image 
            src="/images/gallery-background.jpg" 
            alt="" 
            fill 
            quality={80} 
            sizes="100vw" 
            className="object-cover" 
            priority
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
        </div>

        {/* Modal */}
        <motion.div
          ref={modalRef}
          className="w-full max-w-none"
          style={{ width: 'clamp(300px, 90vw, 1400px)', height: 'clamp(400px, 85vh, 900px)' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="grid h-full overflow-hidden rounded-lg"
            style={{ gridTemplateColumns: 'clamp(300px, 45%, 600px) 1fr' }}
          >
            {/* Colonne image */}
            <div className="bg-gray-100 h-full flex items-center justify-center">
              {allVisuals.length > 0 && (
                <Image
                  src={allVisuals[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '4/5', objectFit: 'cover' }}
                  fill
                  priority
                  sizes="(max-width: 1200px) 90vw, 600px"
                />
              )}
              {/* Navigation */}
              {allVisuals.length > 1 && (
                <>
                  <button 
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 carousel-button-prev btn-nav"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 carousel-button-next btn-nav"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Indicateurs */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center carousel-indicators">
                    <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {allVisuals.map((_, index) => (
                        <button
                          key={`indicator-${index}`}
                          onClick={() => {
                            setDirection(index > currentImageIndex ? 1 : -1)
                            setCurrentImageIndex(index)
                          }}
                          className={`transition-all duration-300 rounded-full ${
                            currentImageIndex === index 
                              ? 'bg-white w-6 h-2' 
                              : 'bg-white/60 w-2 h-2 hover:bg-white/80'
                          }`}
                          aria-label={`Image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* Colonne description */}
            <div className="flex flex-col h-full min-h-0">
              {/* En-tête */}
              <div className="flex-shrink-0 p-6 border-b">
                <h2 className="text-sm md:text-base font-medium mb-2">
                  {project.title}
                </h2>
              </div>
              {/* Contenu scrollable */}
              <div
                className={`flex-1 overflow-y-auto p-6 min-h-0 custom-scrollbar ${isDescriptionHovered ? 'scrollbar-visible' : ''}`}
                ref={descriptionRef}
                onMouseEnter={() => setIsDescriptionHovered(true)}
                onMouseLeave={() => setIsDescriptionHovered(false)}
              >
                <div className="text-sm text-gray-700 leading-relaxed prose prose-sm lg:prose-base max-w-none">
                  {Array.isArray(project.description) ? (
                    project.description.map((paragraph, i) => (
                      <div key={i} className="mb-4 last:mb-0">
                        <ReactMarkdown>
                          {paragraph}
                        </ReactMarkdown>
                      </div>
                    ))
                  ) : (
                    <ReactMarkdown>{project.description}</ReactMarkdown>
                  )}
                </div>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-6 text-primary-blue hover:text-primary-orange transition-colors duration-200 underline text-sm"
                  >
                    Visiter le site du projet
                  </a>
                )}
              </div>
              {/* Footer (optionnel) */}
              {/* <div className="flex-shrink-0 p-6 border-t">Footer ici</div> */}
            </div>
          </div>
        </motion.div>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute -top-5 -right-5 z-20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ 
            backgroundColor: 'rgb(98, 137, 181)', 
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' 
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = 'rgb(78, 117, 161)' 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'rgb(98, 137, 181)' 
          }}
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProjectModalDesktop

// --- END OF FILE ProjectModalDesktop.tsx (VERSION COMPLÈTE CORRIGÉE) ---