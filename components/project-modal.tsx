"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"

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
  const [currentImage, setCurrentImage] = useState(project.mainVisual)
  const [isAnimating, setIsAnimating] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImage(project.mainVisual)
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

  // Handle keyboard navigation for thumbnails
  const handleKeyDown = (e: React.KeyboardEvent, image: string) => {
    if (e.key === "Enter" || e.key === " ") {
      setCurrentImage(image)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className={`modal-overlay ${isAnimating ? "open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`modal-title-${project.id}`}
    >
      <div ref={modalRef} className={`modal-content ${isAnimating ? "open" : ""}`}>
        {/* Close button */}
        <button
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-orange"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main image with smooth transition */}
        <div className="relative w-full h-[300px] md:h-[400px] mb-6 overflow-hidden">
          <Image
            src={currentImage || "/placeholder.svg"}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>

        {/* Thumbnails with improved interaction */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            className={`relative w-20 h-20 flex-shrink-0 transition-all duration-300 ${
              currentImage === project.mainVisual
                ? "ring-2 ring-primary-orange scale-105"
                : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => setCurrentImage(project.mainVisual)}
            onKeyDown={(e) => handleKeyDown(e, project.mainVisual)}
            aria-label="View main image"
            aria-pressed={currentImage === project.mainVisual}
            tabIndex={0}
          >
            <Image
              src={project.mainVisual || "/placeholder.svg"}
              alt="Thumbnail"
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
          {project.additionalVisuals.map((image, index) => (
            <button
              key={index}
              className={`relative w-20 h-20 flex-shrink-0 transition-all duration-300 ${
                currentImage === image ? "ring-2 ring-primary-orange scale-105" : "opacity-70 hover:opacity-100"
              }`}
              onClick={() => setCurrentImage(image)}
              onKeyDown={(e) => handleKeyDown(e, image)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={currentImage === image}
              tabIndex={0}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>

        {/* Project details with improved typography */}
        <h2 id={`modal-title-${project.id}`} className="font-koolegant text-2xl md:text-3xl mb-4">
          {project.title}
        </h2>
        <p className="font-cocogoose text-base mb-8 leading-relaxed">{project.description}</p>

        <Link
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-primary-orange text-white px-6 py-3 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2"
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
      </div>
    </div>
  )
}
