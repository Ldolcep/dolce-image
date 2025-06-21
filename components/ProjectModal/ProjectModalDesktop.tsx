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

// Animation variants for staggered modal content (DESKTOP ONLY)
const contentStagger = {
  animate: {
    transition: {
      staggerChildren: 0.15, // 150ms between each child
      delayChildren: 0,
    },
  },
};

const fadeUpStagger = {
  initial: { opacity: 0, y: 20 },
  animate: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      type: "spring",
      ease: [0.4, 0, 0.2, 1],
      delay: custom * 0.15,
    },
  }),
  exit: (custom: number) => ({
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      delay: custom * 0.1,
    },
  }),
};

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
    if (!modalRef.current || !descriptionRef.current) return;
    const imageElement = modalRef.current.querySelector('.carousel-image') as HTMLElement | null;
    const desc = descriptionRef.current;
    if (!imageElement) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // ONLY reset description height, NOT modal height
          desc.style.height = 'auto';
          void desc.offsetHeight;

          const imageHeight = imageElement.offsetHeight;
          modalRef.current!.style.height = `${imageHeight}px`; // Keep this
          desc.style.height = `${imageHeight}px`
          desc.scrollTop = 0;

          setTimeout(() => {
            desc.scrollTop = 0;
          }, 5);
        });
      });
    });
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
        style={{ willChange: "opacity" }}
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
          className="w-full max-w-none overflow-visible relative"
          style={{ width: 'clamp(300px, 90vw, 1400px)', height: 'clamp(400px, 85vh, 900px)', willChange: 'transform, opacity' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, type: "spring", ease: [0.4, 0, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton de fermeture flottant, centre aligné au coin supérieur droit du modal */}
          <button
            onClick={onClose}
            className="absolute z-30 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
            style={{
              top: '-20px',
              right: '-20px',
              backgroundColor: 'rgb(98, 137, 181)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgb(78, 117, 161)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgb(98, 137, 181)' }}
            aria-label="Fermer le modal"
          >
            <X size={20} strokeWidth={2} />
          </button>
          <motion.div
            className="grid h-full rounded-lg bg-white overflow-visible modal-grid"
            style={{ gridTemplateColumns: 'clamp(300px, 45%, 600px) 1fr', willChange: 'transform, opacity' }}
            variants={contentStagger}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Colonne image */}
            <motion.div
              className="bg-gray-100 h-full flex items-center justify-center relative overflow-hidden"
              variants={fadeUpStagger}
              custom={0}
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="w-full h-full relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    layoutId={`project-image-${project.id}-${currentImageIndex}`}
                    style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, willChange: 'opacity, transform' }}
                    aria-live="polite"
                  >
                    <Image
                      src={allVisuals[currentImageIndex]}
                      alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                      className="w-full h-full object-cover carousel-image"
                      style={{ aspectRatio: '4/5' }}
                      width={600}
                      height={750}
                      priority
                      sizes="600px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Navigation */}
              {allVisuals.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 z-10 carousel-button-prev btn-nav"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 z-10 carousel-button-next btn-nav"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              {/* Indicateurs */}
              {allVisuals.length > 1 && (
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
              )}
            </motion.div>
            {/* Colonne description */}
            <motion.div
              className="flex flex-col h-full min-h-0 relative"
              variants={fadeUpStagger}
              custom={1}
              style={{ willChange: 'transform, opacity' }}
            >
              {/* En-tête avec titre */}
              <div className="flex-shrink-0 p-6 pb-4">
                <div className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'Cocogoose, sans-serif' }}>
                  {project.title}
                </div>
              </div>
              {/* Séparateur fin noir */}
              <div className="flex-shrink-0 border-b border-gray-900" style={{ borderWidth: '0px' }}></div>
              {/* Contenu scrollable */}
              <div
                className="flex-1 overflow-y-auto p-6 pt-4 min-h-0 custom-scrollbar"
                ref={descriptionRef}
                style={{ 
                  scrollBehavior: 'smooth',
                  overscrollBehavior: 'contain'
                }}
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
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ProjectModalDesktop

// --- END OF FILE ProjectModalDesktop.tsx (VERSION COMPLÈTE CORRIGÉE) ---