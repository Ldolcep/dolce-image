// --- START OF FILE ProjectModalDesktop.tsx (STABLE VERSION) ---

"use client"

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

// Interface pour le projet
export interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string | string[]
  link: string
}

interface ProjectModalDesktopProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

// Définir les variants AVANT leur utilisation
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.3, ease: "easeOut" } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.2, ease: "easeIn" } 
  }
}

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { 
      duration: 0.2, 
      ease: "easeIn" 
    } 
  }
}

const imageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
}

// Composant principal
const ProjectModalDesktop: React.FC<ProjectModalDesktopProps> = ({ project, isOpen, onClose }) => {
  // État local
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [imagesReady, setImagesReady] = useState<Set<number>>(new Set())
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  
  // Memoized values
  const allVisuals = useMemo(() => {
    return [project.mainVisual, ...project.additionalVisuals].filter(Boolean)
  }, [project.mainVisual, project.additionalVisuals])

  // Reset au changement de projet
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0)
      setDirection(0)
      setImagesReady(new Set())
    }
  }, [project.id, isOpen])

  // Préchargement des images
  useEffect(() => {
    if (!isOpen) return

    allVisuals.forEach((src, index) => {
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

  // Navigation
  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentImageIndex(prev => {
      const newIndex = prev + newDirection
      if (newIndex < 0) return allVisuals.length - 1
      if (newIndex >= allVisuals.length) return 0
      return newIndex
    })
  }, [allVisuals.length])

  const goToNext = useCallback(() => paginate(1), [paginate])
  const goToPrevious = useCallback(() => paginate(-1), [paginate])

  // Gestion du clavier
  useEffect(() => {
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
  const syncHeights = useCallback(() => {
    if (!modalRef.current || !descriptionRef.current) return
    
    const imageElement = modalRef.current.querySelector('.image-column img')
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

  useEffect(() => {
    if (!isOpen || !isCurrentImageReady) return

    // Synchroniser après le chargement de l'image
    const timeoutId = setTimeout(syncHeights, 50)
    
    // Observer les changements de taille
    const resizeObserver = new ResizeObserver(syncHeights)
    const imageElement = modalRef.current?.querySelector('.image-column img')
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
  useEffect(() => {
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

  const isCurrentImageReady = imagesReady.has(currentImageIndex)

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="modal-backdrop"
        className="fixed inset-0 flex items-center justify-center p-4 md:p-6 z-50"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
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
            className="bg-white w-full max-w-5xl relative shadow-xl"
            style={{ 
              display: 'flex',
              flexDirection: 'row',
              overflow: 'visible'
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colonne image */}
            <div className="image-column w-full md:w-1/2 relative flex-shrink-0 flex items-center justify-center bg-gray-50">
              <div className="relative w-full h-full">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentImageIndex}
                    custom={direction}
                    variants={imageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                  >
                    {isCurrentImageReady ? (
                      <img
                        src={allVisuals[currentImageIndex]}
                        alt={`${project.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '90vh' }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange" />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            {/* Navigation */}
            {allVisuals.length > 1 && (
              <>
                <button 
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 btn-nav"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 btn-nav"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Indicateurs */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    {allVisuals.map((_, index) => (
                      <button
                        key={index}
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
            <div 
              ref={descriptionRef}
              className="w-full md:w-1/2 p-8 custom-scrollbar"
              style={{ 
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: 'transparent transparent',
                transition: 'scrollbar-color 0.3s ease'
              }}
              onMouseEnter={(e) => {
                const hasScroll = e.currentTarget.scrollHeight > e.currentTarget.clientHeight
                if (hasScroll) {
                  e.currentTarget.style.scrollbarColor = '#f7a520 #fff3e0'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('scrolling')) {
                  e.currentTarget.style.scrollbarColor = 'transparent transparent'
                }
              }}
            >
            <h2 className="font-koolegant text-2xl md:text-3xl font-medium mb-4">
              {project.title}
            </h2>
            <div className="text-base text-gray-700 leading-relaxed prose prose-sm lg:prose-base max-w-none">
              {Array.isArray(project.description) ? (
                project.description.map((paragraph, i) => (
                  <ReactMarkdown key={i} className="mb-4 last:mb-0">
                    {paragraph}
                  </ReactMarkdown>
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
                className="inline-block mt-6 text-primary-blue hover:text-primary-orange transition-colors duration-200 underline"
              >
                Visiter le site du projet
              </a>
            )}
          </div>

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
      </motion.div>
    </AnimatePresence>
  )
}

export default ProjectModalDesktop

// --- END OF FILE ProjectModalDesktop.tsx (STABLE VERSION) ---