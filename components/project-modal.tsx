"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

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

  const currentImage = allVisuals[currentImageIndex] || project.mainVisual

  if (!isOpen) return null

  return (
    <div
      className={`modal-overlay ${isAnimating ? "open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${project.id}`}
    >
      <div 
        ref={modalRef} 
        className={`modal-content ${isAnimating ? "open" : ""} flex flex-col md:flex-row relative`}
      >
        {/* Image Section - full height on desktop/tablet, adjusts on mobile */}
        <div className="w-full md:w-1/2 relative h-auto">
          {/* Image Container - takes full height of parent */}
          <div className="w-full h-full relative">
            <Image
              src={currentImage || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            
            {/* Image Navigation Controls - overlay on the image */}
            {allVisuals.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-3 z-10">
                <button 
                  onClick={handlePrevious}
                  className="text-white bg-black/30 p-1 rounded-full hover:bg-black/50 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {/* Dots/Indicators */}
                {allVisuals.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentImageIndex === index ? "bg-white" : "bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                    aria-current={currentImageIndex === index}
                  />
                ))}
                
                <button 
                  onClick={handleNext}
                  className="text-white bg-black/30 p-1 rounded-full hover:bg-black/50 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-8">
          <h2 id={`modal-title-${project.id}`} className="font-serif text-3xl mb-6">
            {project.title}
          </h2>
          <p className="font-poppins text-base mb-8 leading-relaxed">{project.description}</p>
          
          {/* Optional: View Project button (if needed) */}
          {project.link && (
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-primary-orange text-white px-6 py-3 font-poppins transition-all hover:bg-primary-blue"
            >
              View Project
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}
        </div>

        {/* Close button - positioned to have its center at the edge of the container */}
        <button
          className="absolute -top-5 -right-5 z-20 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )
}