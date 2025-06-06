// --- START OF FILE ProjectModalDesktop.tsx (MODIFIED) ---

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState<Set<string>>(new Set());

  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const descriptionColumnRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % allVisuals.length);
  }, [allVisuals.length]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + allVisuals.length) % allVisuals.length);
  }, [allVisuals.length]);

  // Reset index quand le projet change
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setImageLoaded(false);
      setImagesPreloaded(new Set());
    }
  }, [project, isOpen]);

  // Animation d'ouverture
  useEffect(() => {
    const timer = isOpen && isMounted ? setTimeout(() => setIsAnimating(true), 50) : undefined;
    return () => {
      if (timer) clearTimeout(timer);
      setIsAnimating(false);
    };
  }, [isOpen, isMounted]);

  // Préchargement intelligent des images
  useEffect(() => {
    if (!isOpen || allVisuals.length === 0) return;
    
    const preloadImages = async () => {
      // Toujours précharger l'image actuelle et les adjacentes
      const indicesToPreload = [
        currentImageIndex,
        (currentImageIndex + 1) % allVisuals.length,
        (currentImageIndex - 1 + allVisuals.length) % allVisuals.length
      ];
      
      const promises = indicesToPreload.map(index => {
        const src = allVisuals[index];
        if (imagesPreloaded.has(src)) return Promise.resolve();
        
        return new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            setImagesPreloaded(prev => new Set(prev).add(src));
            resolve();
          };
          img.onerror = () => resolve();
          img.src = src;
        });
      });
      
      await Promise.all(promises);
      
      // Précharger le reste en arrière-plan
      setTimeout(() => {
        allVisuals.forEach((src, index) => {
          if (!imagesPreloaded.has(src) && !indicesToPreload.includes(index)) {
            const img = new window.Image();
            img.onload = () => setImagesPreloaded(prev => new Set(prev).add(src));
            img.src = src;
          }
        });
      }, 100);
    };
    
    preloadImages();
  }, [currentImageIndex, allVisuals, isOpen, imagesPreloaded]);

  // Synchronisation des hauteurs
  const syncHeights = useCallback(() => {
    if (!imageRef.current || !descriptionColumnRef.current || !modalRef.current) return;

    // Obtenir la hauteur naturelle de l'image
    const imageHeight = imageRef.current.offsetHeight;
    
    // Définir cette hauteur sur le modal entier
    modalRef.current.style.height = `${imageHeight}px`;
    
    // La colonne description prend cette hauteur
    descriptionColumnRef.current.style.height = `${imageHeight}px`;
  }, []);

  // Synchroniser quand l'image est chargée
  const handleImageLoad = () => {
    setImageLoaded(true);
    // Petit délai pour s'assurer que le rendu est terminé
    requestAnimationFrame(() => {
      requestAnimationFrame(syncHeights);
    });
  };

  // Observer les changements de taille
  useEffect(() => {
    if (!isOpen || !isMounted || !imageLoaded) return;

    syncHeights();

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(syncHeights);
    });

    if (imageRef.current) {
      resizeObserver.observe(imageRef.current);
    }

    window.addEventListener('resize', syncHeights);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHeights);
    };
  }, [isOpen, isMounted, imageLoaded, syncHeights]);

  // Gestion de l'affichage temporaire de la scrollbar lors du scroll
  useEffect(() => {
    if (!isOpen || !descriptionColumnRef.current) return;

    let scrollTimeout: NodeJS.Timeout;
    const descriptionElement = descriptionColumnRef.current;

    const handleScroll = () => {
      // Montrer la scrollbar
      descriptionElement.style.scrollbarColor = '#f7a520 #fff3e0';
      descriptionElement.classList.add('scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Cacher la scrollbar après 1 seconde d'inactivité
        descriptionElement.classList.remove('scrolling');
        if (!descriptionElement.matches(':hover')) {
          descriptionElement.style.scrollbarColor = 'transparent transparent';
        }
      }, 1000);
    };

    // Initialement cacher la scrollbar
    descriptionElement.style.scrollbarColor = 'transparent transparent';
    
    descriptionElement.addEventListener('scroll', handleScroll);

    return () => {
      descriptionElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isOpen]);

  // Gestion du clavier
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
    // MODIFIED: Remplacement de l'ancien fond par la nouvelle structure
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 md:p-6 z-50 transition-opacity duration-300" 
      style={{ opacity: isAnimating ? 1 : 0 }}
      onClick={onClose} // Ferme la modale si on clique sur le fond
    >
      {/* NOUVEAU: Conteneur pour l'image de fond et l'overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/gallery-background.jpg"
          alt=""
          fill
          quality={80} // Qualité légèrement réduite pour la performance
          sizes="100vw"
          className="object-cover"
        />
        {/* Overlay plus sombre et blur plus fort, comme recommandé */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
      </div>
      
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-5xl relative transition-transform duration-300 shadow-xl"
        style={{ 
          transform: isAnimating ? 'scale(1)' : 'scale(0.95)', 
          opacity: isAnimating ? 1 : 0,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'visible' // Permet au bouton de dépasser
        }}
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic sur la modale
      >
        {/* Colonne image - détermine la hauteur */}
        <div 
          className="w-full md:w-1/2 relative flex-shrink-0 flex items-center justify-center bg-gray-50"
        >
          <div className="relative w-full h-full">
            {/* Toutes les images sont dans le DOM mais une seule est visible */}
            {allVisuals.map((visual, index) => (
              <img
                key={visual}
                ref={index === currentImageIndex ? imageRef : undefined}
                src={visual}
                alt={`Image ${index + 1} du projet ${project.title}`}
                className={`absolute inset-0 w-full h-auto transition-opacity duration-300 ${
                  index === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  visibility: index === currentImageIndex ? 'visible' : 'hidden'
                }}
                onLoad={index === currentImageIndex ? handleImageLoad : undefined}
                loading={index <= 1 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
          
          {/* Navigation */}
          {allVisuals.length > 1 && (
            <>
              <button 
                onClick={handlePrevious} 
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow z-10" 
                aria-label="Image précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNext} 
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow z-10" 
                aria-label="Image suivante"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          
          {/* Indicateurs */}
          {allVisuals.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center z-10">
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

        {/* Colonne description - hauteur fixée par JS */}
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

// --- END OF FILE ProjectModalDesktop.tsx (MODIFIED) ---