// --- START OF FILE ProjectModalDesktop.tsx (FIXED VERSION) ---

"use client"

import ReactMarkdown from 'react-markdown';
import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react" // FIX: Ajout de useRef
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Interface Project
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

// Variants pour les animations Framer Motion
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    } 
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
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
      ease: [0.16, 1, 0.3, 1] // Courbe de Bézier personnalisée pour un effet smooth
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
    x: direction > 0 ? 100 : -100,
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
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
}

export default function ProjectModalDesktop({ project, isOpen, onClose }: ProjectModalDesktopProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<string>>(new Set());
  
  const modalRef = useRef<HTMLDivElement>(null);
  const descriptionColumnRef = useRef<HTMLDivElement>(null);

  // Préchargement des images
  useEffect(() => {
    if (!isOpen) return;

    const loadImages = async () => {
      const imagePromises = allVisuals.map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            setImagesLoaded(prev => new Set(prev).add(src));
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            resolve(); // Continuer même en cas d'erreur
          };
        });
      });

      await Promise.all(imagePromises);
    };

    loadImages();
  }, [allVisuals, isOpen]);

  // Reset quand le projet change
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setDirection(0);
    }
  }, [project.id, isOpen]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentImageIndex((prevIndex) => {
      let newIndex = prevIndex + newDirection;
      if (newIndex < 0) newIndex = allVisuals.length - 1;
      if (newIndex >= allVisuals.length) newIndex = 0;
      return newIndex;
    });
  }, [allVisuals.length]);

  const handleNext = useCallback(() => paginate(1), [paginate]);
  const handlePrevious = useCallback(() => paginate(-1), [paginate]);

  // Gestion du clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (allVisuals.length > 1) {
        if (e.key === "ArrowRight") handleNext();
        else if (e.key === "ArrowLeft") handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrevious, onClose, allVisuals.length]);

  // Gestion de la scrollbar personnalisée
  useEffect(() => {
    if (!isOpen || !descriptionColumnRef.current) return;

    let scrollTimeout: NodeJS.Timeout;
    const descriptionElement = descriptionColumnRef.current;

    const handleScroll = () => {
      descriptionElement.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        descriptionElement.classList.remove('scrolling');
      }, 1000);
    };

    descriptionElement.addEventListener('scroll', handleScroll);
    return () => {
      descriptionElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isOpen]);

  const currentImageSrc = allVisuals[currentImageIndex];
  const isCurrentImageLoaded = imagesLoaded.has(currentImageSrc);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4 md:p-6 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          {/* Fond avec blur */}
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
            className="bg-white w-full max-w-5xl max-h-[90vh] relative shadow-2xl flex flex-col md:flex-row overflow-hidden rounded-lg"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colonne image */}
            <div className="w-full md:w-1/2 relative flex-shrink-0 bg-gray-100 min-h-[300px] md:min-h-[500px] flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentImageIndex}
                  custom={direction}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center p-4"
                >
                  {isCurrentImageLoaded ? (
                    <img
                      src={currentImageSrc}
                      alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                      className="max-w-full max-h-full object-contain"
                      style={{ maxHeight: '85vh' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {allVisuals.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevious} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 btn-nav"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={handleNext} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 btn-nav"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Indicateurs de pagination */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center z-10">
                    <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {allVisuals.map((_, index) => (
                        <button 
                          key={index} 
                          onClick={() => {
                            setDirection(index > currentImageIndex ? 1 : -1);
                            setCurrentImageIndex(index);
                          }} 
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            currentImageIndex === index 
                              ? 'bg-white w-6' 
                              : 'bg-white/60 hover:bg-white/80'
                          }`} 
                          aria-label={`Aller à l'image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Colonne description */}
            <div 
              ref={descriptionColumnRef} 
              className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto custom-scrollbar"
              style={{
                maxHeight: '90vh',
                scrollbarWidth: 'thin',
                scrollbarColor: 'transparent transparent'
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
            <motion.button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-30 text-gray-500 hover:text-gray-700 bg-white/90 hover:bg-white rounded-full p-2 transition-all duration-200 shadow-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Fermer"
            >
              <X size={24} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- END OF FILE ProjectModalDesktop.tsx (FIXED VERSION) ---