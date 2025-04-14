"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { X } from "lucide-react"

interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string
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
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
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

  if (!isOpen) return null

  const currentImage = allVisuals[currentImageIndex]

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
        className="bg-white w-full max-w-4xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl"
        style={{ 
          transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
          opacity: isAnimating ? 1 : 0
        }}
      >
        {/* Left Column: Image Slider (ratio 4:5) */}
        <div className="w-full md:w-1/2 relative">
          <div className="relative" style={{ aspectRatio: '4/5' }}>
            <Image
              src={currentImage || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            
            {/* Navigation Buttons - Left/Right */}
            {allVisuals.length > 1 && (
              <>
                {/* Left Navigation Button */}
                <button 
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
                  aria-label="Previous image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                
                {/* Right Navigation Button */}
                <button 
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 hover:bg-white transition-colors"
                  aria-label="Next image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
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
                      aria-label={`Go to image ${index + 1}`}
                      aria-current={currentImageIndex === index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Content */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <h2 
            id={`modal-title-${project.id}`} 
            className="font-serif text-2xl md:text-3xl font-medium mb-4"
          >
            {project.title}
          </h2>
          <div className="font-poppins text-base text-gray-700 leading-relaxed">
            {project.description}
          </div>
        </div>
        
        {/* Close button - positioned to have its center at the edge of the container */}
        <button
          className="absolute -top-5 -right-5 z-20 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}