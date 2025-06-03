// components/ProjectModalDesktop.tsx
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import DOMPurify from 'dompurify'
import { type Project } from '@/lib/validations/project'

interface ProjectModalDesktopProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export default function ProjectModalDesktop({ project, isOpen, onClose }: ProjectModalDesktopProps) {
  // ... (hooks et logique existants inchangés)
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const imageColumnRef = useRef<HTMLDivElement>(null);
  const descriptionColumnRef = useRef<HTMLDivElement>(null);

  // Fonction de sanitisation sécurisée
  const sanitizeDescription = useCallback((description: string | string[]) => {
    const ALLOWED_TAGS = ['strong', 'em', 'br', 'p', 'span']
    const ALLOWED_ATTR = ['class']

    if (Array.isArray(description)) {
      return description.map(paragraph => 
        DOMPurify.sanitize(paragraph, {
          ALLOWED_TAGS,
          ALLOWED_ATTR,
          FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
          FORBID_ATTR: ['onclick', 'onload', 'onerror', 'javascript']
        })
      )
    }
    
    return DOMPurify.sanitize(description, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'javascript']
    })
  }, [])

  // ... (reste de la logique existante)
  useEffect(() => { setIsMounted(true); }, []);

  const prevIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex - 1 + allVisuals.length) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);
  const nextIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex + 1) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);

  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1) return;
    const newIndex = (currentImageIndex + 1) % allVisuals.length;
    setCurrentImageIndex(newIndex);
  }, [currentImageIndex, allVisuals.length]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1) return;
    const newIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
    setCurrentImageIndex(newIndex);
  }, [currentImageIndex, allVisuals.length]);

  // Fallbacks de sécurité
  if (!isMounted) {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
  }
  if (!isOpen) return null;

  // Sanitiser la description avant le rendu
  const sanitizedDescription = sanitizeDescription(project.description)

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
        style={{ transform: isAnimating ? 'scale(1)' : 'scale(0.95)', opacity: isAnimating ? 1 : 0 }}
      >
        {/* Colonne Image (inchangée) */}
        <div className="w-full md:w-1/2 relative" ref={imageColumnRef}>
          <div className="relative" style={{ aspectRatio: '4/5' }}>
            {allVisuals[currentImageIndex] && (
              <Image 
                src={allVisuals[currentImageIndex]} 
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} 
                fill 
                className="object-contain" 
                sizes="(max-width: 768px) 100vw, 50vw" 
                priority={currentImageIndex === 0} 
                key={allVisuals[currentImageIndex]} 
              />
            )}
            {/* Navigation et indicateurs... (code existant) */}
          </div>
        </div>

        {/* Colonne Description SÉCURISÉE */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto" ref={descriptionColumnRef}>
          <h2 
            id={`modal-title-${project.id}`} 
            className="font-great-vibes text-2xl md:text-3xl font-medium mb-4"
          >
            {project.title}
          </h2>
          
          {/* Section de description sécurisée */}
          <div className="font-poppins text-base text-gray-700 leading-relaxed">
            {Array.isArray(sanitizedDescription) ? (
              sanitizedDescription.map((paragraph, i) => (
                <p 
                  key={i} 
                  className="mb-4 last:mb-0" 
                  dangerouslySetInnerHTML={{ __html: paragraph }} 
                />
              ))
            ) : (
              <p 
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }} 
              />
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

        <button 
          className="absolute -top-5 -right-5 z-20 bg-primary-orange text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange" 
          onClick={onClose} 
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
