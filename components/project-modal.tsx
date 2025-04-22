// project-modal.tsx - Version améliorée responsive
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
  const isMobile = useIsMobile() // Utilise le hook existant

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setIsInfoVisible(false)
  }, [project])

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

  // Gestion du swipe
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
            className={`text-white rounded-full p-2 ${isInfoVisible ? 'bg-white/20' : ''}`}
            onClick={toggleInfo}
            aria-label={isInfoVisible ? "Masquer la description" : "Afficher la description"}
          >
            <Info size={24} />
          </button>
        </div>
        
        {/* Contenu principal (image) avec gestion du swipe */}
        <div 
          className="h-full w-full"
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
        
        {/* Panneau d'information (apparaît depuis le bas) */}
        <div 
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-sm transition-transform duration-300 transform ${
            isInfoVisible ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '70vh' }}
        >
          <div className="p-4 border-b flex items-center">
            <button 
              onClick={toggleInfo}
              className="mr-2"
              aria-label="Fermer le panneau d'information"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-great-vibes text-2xl">{project.title}</h2>
          </div>
          
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 57px)' }}>
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
    // Version desktop (modal traditionnel mais optimisé)
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
          className="bg-white w-full max-w-5xl max-h-[95vh] flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl"
          style={{ 
            transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
            opacity: isAnimating ? 1 : 0
          }}
        >
          {/* Left Column: Image Slider (ratio 4:5) */}
          <div className="w-full md:w-1/2 relative">
            <div className="relative" style={{ aspectRatio: '4/5' }}>
              <Image
                src={allVisuals[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
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
                            ? 'bg-white scale-110' 
                            : 'bg-white/50 hover:bg-white/70'
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
          
          {/* Right Column: Content */}
          <div 
            className="w-full md:w-1/2 p-8 overflow-y-auto"
            style={{maxHeight: 'calc(95vh - 40px)'}}
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