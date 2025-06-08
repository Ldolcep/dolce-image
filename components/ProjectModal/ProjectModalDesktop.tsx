// --- START OF FILE ProjectModalDesktop.tsx (OPTIMIZED VERSION) ---

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

  // États d'animation simplifiés
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const descriptionColumnRef = useRef<HTMLDivElement>(null);
  const preloadedImages = useRef<Map<string, HTMLImageElement>>(new Map());

  // Préchargement des images
  useEffect(() => {
    if (!isOpen) return;

    const preloadImage = (src: string, index: number) => {
      if (preloadedImages.current.has(src)) {
        setImagesLoaded(prev => new Set(prev).add(index));
        return;
      }

      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        preloadedImages.current.set(src, img);
        setImagesLoaded(prev => new Set(prev).add(index));
      };
      
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        setImagesLoaded(prev => new Set(prev).add(index));
      };
    };

    // Précharger toutes les images
    allVisuals.forEach((visual, index) => {
      preloadImage(visual, index);
    });

    return () => {
      // Nettoyage si nécessaire
    };
  }, [allVisuals, isOpen]);

  // Gestion de l'ouverture/fermeture avec délai pour éviter le flash
  useEffect(() => {
    if (isOpen && imagesLoaded.has(0)) {
      // Rendre d'abord visible, puis animer
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (!isOpen) {
      // Animer la fermeture, puis cacher
      setIsAnimating(false);
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setImagesLoaded(new Set());
      }, 300); // Durée de l'animation
      return () => clearTimeout(timeout);
    }
  }, [isOpen, imagesLoaded]);

  // Reset quand le projet change
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setImagesLoaded(new Set());
    }
  }, [project.id, isOpen]);

  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1) return;
    const nextIndex = (currentImageIndex + 1) % allVisuals.length;
    
    // Attendre que l'image suivante soit chargée
    if (imagesLoaded.has(nextIndex)) {
      setCurrentImageIndex(nextIndex);
    }
  }, [allVisuals.length, currentImageIndex, imagesLoaded]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1) return;
    const prevIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
    
    // Attendre que l'image précédente soit chargée
    if (imagesLoaded.has(prevIndex)) {
      setCurrentImageIndex(prevIndex);
    }
  }, [allVisuals.length, currentImageIndex, imagesLoaded]);

  // Synchronisation des hauteurs
  const syncHeights = useCallback(() => {
    if (!imageRef.current || !descriptionColumnRef.current || !modalRef.current) return;
    
    const imageHeight = imageRef.current.offsetHeight;
    modalRef.current.style.height = `${imageHeight}px`;
    descriptionColumnRef.current.style.height = `${imageHeight}px`;
  }, []);

  // Observer les changements de taille
  useEffect(() => {
    if (!isVisible || !imagesLoaded.has(currentImageIndex)) return;

    const timeoutId = setTimeout(syncHeights, 50);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(syncHeights);
    });

    if (imageRef.current) {
      resizeObserver.observe(imageRef.current);
    }

    window.addEventListener('resize', syncHeights);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHeights);
    };
  }, [isVisible, currentImageIndex, syncHeights, imagesLoaded]);

  // Gestion de la scrollbar
  useEffect(() => {
    if (!isVisible || !descriptionColumnRef.current) return;

    let scrollTimeout: NodeJS.Timeout;
    const descriptionElement = descriptionColumnRef.current;

    const handleScroll = () => {
      descriptionElement.style.scrollbarColor = '#f7a520 #fff3e0';
      descriptionElement.classList.add('scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        descriptionElement.classList.remove('scrolling');
        if (!descriptionElement.matches(':hover')) {
          descriptionElement.style.scrollbarColor = 'transparent transparent';
        }
      }, 1000);
    };

    descriptionElement.style.scrollbarColor = 'transparent transparent';
    descriptionElement.addEventListener('scroll', handleScroll);

    return () => {
      descriptionElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isVisible]);

  // Gestion du clavier
  useEffect(() => {
    if (!isVisible) return;

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
  }, [isVisible, onClose, allVisuals.length, handleNext, handlePrevious]);

  // Fonction pour changer d'image avec vérification du chargement
  const handleImageChange = useCallback((index: number) => {
    if (imagesLoaded.has(index)) {
      setCurrentImageIndex(index);
    }
  }, [imagesLoaded]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 md:p-6 z-50"
      style={{ 
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 300ms ease-in-out',
        pointerEvents: isAnimating ? 'auto' : 'none'
      }}
      onClick={onClose}
    >
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
      
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-5xl relative shadow-xl"
        style={{ 
          transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
          opacity: isAnimating ? 1 : 0,
          transition: 'all 300ms ease-in-out',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'visible'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full md:w-1/2 relative flex-shrink-0 flex items-center justify-center bg-gray-50">
          <div className="relative w-full h-full">
            {allVisuals.map((visual, index) => {
              const isCurrentImage = index === currentImageIndex;
              const isImageLoaded = imagesLoaded.has(index);
              
              return (
                <div
                  key={`${project.id}-${visual}`}
                  className={`absolute inset-0 transition-opacity duration-300 ${
                    isCurrentImage && isImageLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {(isCurrentImage || Math.abs(index - currentImageIndex) <= 1) && (
                    <img
                      ref={isCurrentImage ? imageRef : undefined}
                      src={visual}
                      alt={`Image ${index + 1} du projet ${project.title}`}
                      className="w-full h-auto object-contain"
                      style={{ maxHeight: '90vh' }}
                      loading="eager"
                      decoding="async"
                    />
                  )}
                </div>
              );
            })}
            
            {/* Indicateur de chargement */}
            {!imagesLoaded.has(currentImageIndex) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
              </div>
            )}
          </div>
          
          {allVisuals.length > 1 && (
            <>
              <button 
                onClick={handlePrevious} 
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow z-10 disabled:opacity-50 disabled:cursor-not-allowed" 
                aria-label="Image précédente"
                disabled={!imagesLoaded.has((currentImageIndex - 1 + allVisuals.length) % allVisuals.length)}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNext} 
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow z-10 disabled:opacity-50 disabled:cursor-not-allowed" 
                aria-label="Image suivante"
                disabled={!imagesLoaded.has((currentImageIndex + 1) % allVisuals.length)}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          
          {allVisuals.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center z-10">
              <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                {allVisuals.map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleImageChange(index)} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentImageIndex === index 
                        ? 'bg-white scale-125' 
                        : imagesLoaded.has(index) 
                          ? 'bg-white/60 hover:bg-white/80' 
                          : 'bg-white/30 cursor-not-allowed'
                    }`} 
                    aria-label={`Aller à l'image ${index + 1}`}
                    disabled={!imagesLoaded.has(index)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div 
          ref={descriptionColumnRef}
          className="w-full md:w-1/2 p-8 custom-scrollbar"
          style={{ 
            overflowY: 'auto', 
            overflowX: 'hidden', 
            scrollbarColor: 'transparent transparent', 
            transition: 'scrollbar-color 0.3s ease' 
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.scrollbarColor = '#f7a520 #fff3e0'; 
          }}
          onMouseLeave={(e) => { 
            if (!e.currentTarget.classList.contains('scrolling')) { 
              e.currentTarget.style.scrollbarColor = 'transparent transparent'; 
            } 
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
          className="absolute -top-5 -right-5 z-20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2" 
          style={{ 
            backgroundColor: 'rgb(98, 137, 181)', 
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)' 
          }}
          onClick={onClose} 
          aria-label="Fermer"
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = 'rgb(78, 117, 161)'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'rgb(98, 137, 181)'; 
          }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

// --- END OF FILE ProjectModalDesktop.tsx (OPTIMIZED VERSION) ---