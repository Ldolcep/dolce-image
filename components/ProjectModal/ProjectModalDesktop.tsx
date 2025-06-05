"use client"

import ReactMarkdown from 'react-markdown';
import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

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

export default function ProjectModalDesktop({ project, isOpen, onClose }: ProjectModalDesktopProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const imageColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % allVisuals.length);
  }, [allVisuals.length]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + allVisuals.length) % allVisuals.length);
  }, [allVisuals.length]);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
    }
  }, [project, isOpen]);

  useEffect(() => {
    const timer = isOpen && isMounted ? setTimeout(() => setIsAnimating(true), 50) : undefined;
    return () => {
      if (timer) clearTimeout(timer);
      setIsAnimating(false);
    };
  }, [isOpen, isMounted]);

  useEffect(() => {
    if (!isMounted || !isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (allVisuals.length > 1) {
        if (e.key === "ArrowRight") handleNext();
        else if (e.key === "ArrowLeft") handlePrevious();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMounted, onClose, allVisuals.length, handleNext, handlePrevious]);

  if (!isMounted || !isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 transition-opacity duration-300" 
      style={{ opacity: isAnimating ? 1 : 0 }}
    >
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-5xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl"
        style={{ 
          transform: isAnimating ? 'scale(1)' : 'scale(0.95)', 
          opacity: isAnimating ? 1 : 0,
          maxHeight: '90vh'
        }}
      >
        <div 
          className="w-full md:w-1/2 relative flex-shrink-0" 
          ref={imageColumnRef}
          style={{ 
            maxHeight: '90vh',
            overflow: 'hidden'
          }}
        >
          <div className="relative w-full h-full">
            {allVisuals[currentImageIndex] && (
              <Image 
                src={allVisuals[currentImageIndex]} 
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} 
                fill
                className="object-contain"
                style={{
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
                sizes="(max-width: 768px) 100vw, 50vw" 
                priority={currentImageIndex === 0} 
              />
            )}
            {allVisuals.length > 1 && (
              <>
                <button 
                  onClick={handlePrevious} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" 
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" 
                  aria-label="Image suivante"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            {allVisuals.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center">
                <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  {allVisuals.map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => setCurrentImageIndex(index)} 
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'
                      }`} 
                      aria-label={`Aller à l'image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div 
          className="w-full md:w-1/2 p-8 custom-scrollbar flex flex-col"
          style={{
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <h2 className="font-koolegant text-2xl md:text-3xl font-medium mb-4">
            {project.title}
          </h2>
          <div className="text-base text-gray-700 leading-relaxed prose lg:prose-base">
            {Array.isArray(project.description) ? (
              project.description.map((markdownContent, i) => (
                <ReactMarkdown key={i}>{markdownContent}</ReactMarkdown>
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
              className="block mt-6 text-primary-blue hover:underline"
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
