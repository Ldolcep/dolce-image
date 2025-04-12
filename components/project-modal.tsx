// project-modal.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, X } from "lucide-react" // Import icons

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
  // Combine visuals into a single array for easier carousel management
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals], [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset current image index when project changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0)
       // Small delay for animation class
       setTimeout(() => {
        setIsAnimating(true)
      }, 10)
    } else {
        setIsAnimating(false)
    }
  }, [project, isOpen])


  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close only if clicking directly on the overlay, not the content
      if (event.target === event.currentTarget) {
        onClose()
      }
    }
    // Get the overlay element for direct click detection
    const overlay = document.getElementById(`modal-overlay-${project.id}`);
    if (isOpen && overlay) {
      overlay.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      if (overlay) {
         overlay.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen, onClose, project.id])


  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allVisuals.length);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allVisuals.length) % allVisuals.length);
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  if (!isOpen) return null

  const currentImage = allVisuals[currentImageIndex];

  return (
    // Overlay - Added ID for click outside detection
    <div
      id={`modal-overlay-${project.id}`}
      className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${project.id}`}
    >
      {/* Modal Content Box */}
      <div
        ref={modalRef}
        className={`bg-white w-full max-w-4xl h-auto max-h-[90vh] rounded-sm shadow-xl flex flex-col md:flex-row transition-all duration-400 ease-out ${isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        {/* Close Button - Positioned relative to the content box */}
        <button
            className="absolute -top-3 -right-3 z-20 p-1.5 bg-gray-700 text-white rounded-full hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onClose}
            aria-label="Close modal"
        >
            <X size={20} />
        </button>

        {/* === Left Column: Image Carousel === */}
        <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col justify-center relative">
          {/* Main Image Container */}
          <div className="relative w-full aspect-square mb-4 overflow-hidden bg-gray-100">
             {/* Image with transition (optional: add key for smooth crossfade) */}
            <Image
              key={currentImage} // Add key to trigger re-render/transition on src change
              src={currentImage || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-contain transition-opacity duration-300" // Use object-contain
              sizes="(max-width: 768px) 90vw, 40vw"
              priority={currentImageIndex === 0} // Prioritize the first image
            />
            {/* Navigation Arrows */}
            {allVisuals.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label="Next image"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}
          </div>

          {/* Pagination Dots */}
           {allVisuals.length > 1 && (
               <div className="flex justify-center gap-2 mt-auto"> {/* Pushes dots to bottom */}
                   {allVisuals.map((_, index) => (
                       <button
                           key={index}
                           onClick={() => goToSlide(index)}
                           className={`w-2.5 h-2.5 rounded-full transition-colors ${
                               currentImageIndex === index ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-400'
                           }`}
                           aria-label={`Go to image ${index + 1}`}
                           aria-pressed={currentImageIndex === index}
                       />
                   ))}
               </div>
           )}
        </div>

        {/* === Right Column: Text Content === */}
        <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col overflow-y-auto max-h-[80vh] md:max-h-full"> {/* Allow scrolling for text */}
          <h2 id={`modal-title-${project.id}`} className="font-poppins text-2xl md:text-3xl font-semibold mb-4 text-gray-800"> {/* Adjusted font */}
            {project.title}
          </h2>
          <p className="font-poppins text-sm md:text-base text-gray-600 mb-6 leading-relaxed flex-grow"> {/* Adjusted font and size */}
            {project.description}
          </p>
          {/* Optional: Keep the link button if needed */}
          {project.link && (
            <Link
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex self-start items-center bg-primary-orange text-white px-5 py-2.5 text-sm font-medium rounded-sm transition-all duration-300 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 mt-auto" // mt-auto pushes button down
            >
              View Project
              <ChevronRight size={18} className="ml-1" />{/* Smaller icon */}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
