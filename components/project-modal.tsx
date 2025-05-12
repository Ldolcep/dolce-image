// project-modal.tsx - Version améliorée avec animation Tinder et grip redesigné
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
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
  
  // États pour le swipe Tinder
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [currentTouchX, setCurrentTouchX] = useState<number | null>(null)
  const [currentTouchY, setCurrentTouchY] = useState<number | null>(null)
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [swipeRotation, setSwipeRotation] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  
  const modalRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)
  
  // Références restaurées pour le useEffect de synchronisation
  const imageColumnRef = useRef<HTMLDivElement>(null)
  const descriptionColumnRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile() // Utilise le hook existant

  // États pour la gestion du glissement du panneau d'information (mobile)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null)
  const [panelHeight, setPanelHeight] = useState(0)

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setIsInfoVisible(false)
  }, [project])

  // --- useEffect pour synchroniser la hauteur RESTAURÉ ---
  useEffect(() => {
    const adjustHeight = () => {
      // Assure que les refs existent et qu'on n'est pas en mobile
      if (imageColumnRef.current && descriptionColumnRef.current && !isMobile) {
        const imageHeight = imageColumnRef.current.offsetHeight;
        // Applique maxHeight à la colonne description
        descriptionColumnRef.current.style.maxHeight = `${imageHeight}px`;
      } else if (descriptionColumnRef.current && !isMobile) {
         // Si l'image n'a pas de ref ou n'est pas prête, on retire le maxHeight
         descriptionColumnRef.current.style.maxHeight = '';
      }
    };

    if (isOpen && !isMobile) { // Appliquer seulement si ouvert et pas en mobile
      // Délai pour chargement image + listener resize
      const timerId = setTimeout(adjustHeight, 150); // Petit délai augmenté
      window.addEventListener('resize', adjustHeight);

      // Cleanup function
      return () => {
        clearTimeout(timerId);
        window.removeEventListener('resize', adjustHeight);
        // Important: Retirer le maxHeight quand le modal se ferme ou passe en mobile
        if (descriptionColumnRef.current) {
            descriptionColumnRef.current.style.maxHeight = '';
        }
      }
    }
     // Si on passe en mobile pendant que c'est ouvert, retirer maxHeight
     else if (descriptionColumnRef.current) {
         descriptionColumnRef.current.style.maxHeight = '';
     }

  }, [isOpen, isMobile, currentImageIndex]); // Dépendances: ouverture, état mobile, image actuelle

  // Handle animation classes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsAnimating(true)
      }, 10)
    } else {
      setIsAnimating(false)
    }
  }, [isOpen])

  // Calculate panel height for mobile grip
  useEffect(() => {
    if (isOpen && isMobile && panelRef.current) {
      const updateHeight = () => {
        if (panelRef.current) {
          setPanelHeight(panelRef.current.getBoundingClientRect().height);
        }
      };
      
      updateHeight();
      window.addEventListener('resize', updateHeight);
      
      return () => {
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, [isOpen, isMobile, isInfoVisible]);

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
      if (!isOpen) return; // Ne rien faire si fermé

      if (e.key === "Escape") {
        onClose()
      } else if (allVisuals.length > 1) { // Seulement si plusieurs images
          if (e.key === "ArrowRight") {
            handleNext()
          } else if (e.key === "ArrowLeft") {
            handlePrevious()
          }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  // Utilisation de useCallback pour handleNext/Previous serait idéal ici
  }, [isOpen, onClose, allVisuals.length]) 

  const handleNext = () => {
    resetSwipeState();
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allVisuals.length)
  }

  const handlePrevious = () => {
    resetSwipeState();
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allVisuals.length) % allVisuals.length)
  }

  // Toggle pour afficher/masquer les infos (sur mobile)
  const toggleInfo = () => {
    setIsInfoVisible(!isInfoVisible)
  }

  // Reset swipe state
  const resetSwipeState = () => {
    setTouchStart(null);
    setTouchEnd(null);
    setCurrentTouchX(null);
    setCurrentTouchY(null);
    setSwipeDistance(0);
    setSwipeRotation(0);
    setIsSwiping(false);
    setSwipeDirection(null);
    
    // Reset any applied transforms on the image
    if (imageRef.current) {
      imageRef.current.style.transform = '';
      imageRef.current.style.transition = '';
      imageRef.current.style.opacity = '1';
    }
  }

  // Calcul des paramètres de l'animation Tinder
  const calculateSwipeAnimation = (currentX: number, startX: number) => {
    if (!imageRef.current) return;
    
    const distance = currentX - startX;
    const maxRotation = 15; // Angle maximum de rotation
    const screenWidth = window.innerWidth;
    const swipeThreshold = screenWidth * 0.35; // Distance minimale pour changer d'image
    
    // Calcul de la rotation proportionnelle
    const rotation = (distance / screenWidth) * maxRotation;
    // Normaliser la distance pour l'affichage
    const normalizedDistance = distance;
    
    setSwipeDistance(normalizedDistance);
    setSwipeRotation(rotation);
    
    // Déterminer la direction du swipe
    if (distance > 0) {
      setSwipeDirection('right');
    } else if (distance < 0) {
      setSwipeDirection('left');
    } else {
      setSwipeDirection(null);
    }
    
    // Appliquer la transformation en temps réel
    const transform = `translateX(${normalizedDistance}px) rotate(${rotation}deg)`;
    const opacity = 1 - Math.min(0.3, Math.abs(distance) / (screenWidth * 1.5));
    
    imageRef.current.style.transform = transform;
    imageRef.current.style.opacity = opacity.toString();
    imageRef.current.style.transition = 'none';
  }

  // Gestion du swipe Tinder pour les images (mobile)
  const minSwipeDistance = 60;
  const onTouchStart = (e: React.TouchEvent) => {
    // Ignorer si on touche le panneau info
    if (panelRef.current?.contains(e.target as Node)) return;
    
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setCurrentTouchX(e.targetTouches[0].clientX);
    setCurrentTouchY(e.targetTouches[0].clientY);
    setIsSwiping(true);
    
    // Reset any previous transforms
    if (imageRef.current) {
      imageRef.current.style.transition = 'none';
    }
  }
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || !isSwiping) return;
    
    // Update currentTouch positions
    setCurrentTouchX(e.targetTouches[0].clientX);
    setCurrentTouchY(e.targetTouches[0].clientY);
    setTouchEnd(e.targetTouches[0].clientX);
    
    // Calculate and apply the Tinder animation
    calculateSwipeAnimation(e.targetTouches[0].clientX, touchStart);
  }
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isSwiping) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (imageRef.current) {
      // Add transition for smooth animation completion
      imageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      
      if (isLeftSwipe) {
        // Complete the swipe animation before changing image
        imageRef.current.style.transform = `translateX(-100%) rotate(-${Math.abs(swipeRotation)}deg)`;
        imageRef.current.style.opacity = '0';
        
        // Delay the image change to allow animation to complete
        setTimeout(() => handleNext(), 250);
      } else if (isRightSwipe) {
        // Complete the swipe animation before changing image
        imageRef.current.style.transform = `translateX(100%) rotate(${Math.abs(swipeRotation)}deg)`;
        imageRef.current.style.opacity = '0';
        
        // Delay the image change to allow animation to complete
        setTimeout(() => handlePrevious(), 250);
      } else {
        // Return to center with elastic animation if not enough distance
        imageRef.current.style.transform = 'translateX(0) rotate(0deg)';
        imageRef.current.style.opacity = '1';
      }
    }
    
    // Reset states
    resetSwipeState();
  }

  // Gestion du glissement du panneau d'information (mobile)
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Empêcher la propagation pour éviter le swipe d'image
    setDragStartY(e.touches[0].clientY);
    
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  }
  
  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (dragStartY === null || !panelRef.current) return;
    
    const currentY = e.touches[0].clientY;
    setDragCurrentY(currentY);
    
    const deltaY = currentY - dragStartY;
    
    // Limiter le déplacement différemment selon l'état
    if (isInfoVisible) {
      // Panel ouvert - permettre uniquement de glisser vers le bas
      if (deltaY > 0) {
        panelRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    } else {
      // Panel fermé - permettre uniquement de glisser vers le haut
      if (deltaY < 0) {
        const maxUpwardMovement = -40; // Limiter le mouvement vers le haut à 40px
        const limitedDeltaY = Math.max(deltaY, maxUpwardMovement);
        panelRef.current.style.transform = `translateY(${limitedDeltaY}px)`;
      }
    }
  }
  
  const handlePanelTouchEnd = () => {
    if (dragStartY === null || dragCurrentY === null || !panelRef.current) return;
    
    const deltaY = dragCurrentY - dragStartY;
    const threshold = 60; // Seuil pour décider si on ouvre/ferme
    
    panelRef.current.style.transition = 'transform 0.3s ease-out';
    
    if (isInfoVisible) {
      // Si panel ouvert et glissé assez vers le bas
      if (deltaY > threshold) {
        setIsInfoVisible(false);
      } else {
        // Pas assez glissé, retour à la position ouverte
        panelRef.current.style.transform = '';
      }
    } else {
      // Si panel fermé et glissé assez vers le haut
      if (deltaY < -threshold) {
        setIsInfoVisible(true);
      } else {
        // Pas assez glissé, retour à la position fermée
        panelRef.current.style.transform = '';
      }
    }
    
    // Réinitialiser les états
    setDragStartY(null);
    setDragCurrentY(null);
  }

  if (!isOpen) return null

  // --- VERSION MOBILE (MODIFIÉE) ---
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black z-50 overflow-hidden"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}>
        {/* Barre de navigation supérieure */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          <button onClick={onClose} className="text-white rounded-full p-2" aria-label="Fermer">
            <X size={24} />
          </button>
          <h3 id={`modal-title-${project.id}`} className="text-white text-lg font-medium truncate mx-4 flex-1 text-center">
            {project.title}
          </h3>
          <div className="w-8 h-8"></div> {/* Spacer pour équilibrer */}
        </div>
        
        {/* Contenu principal (image avec animation Tinder) */}
        <div 
          className="h-full w-full transition-all duration-300" 
          style={{ 
            filter: isInfoVisible ? 'blur(2px)' : 'none', 
            transform: isInfoVisible ? 'scale(0.98)' : 'scale(1)'
          }}
          onTouchStart={onTouchStart} 
          onTouchMove={onTouchMove} 
          onTouchEnd={onTouchEnd}
        >
          <div 
            ref={imageRef}
            className="relative h-full w-full transition-transform"
            style={{ transformOrigin: 'center' }}
          >
            <Image 
              src={allVisuals[currentImageIndex]} 
              alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} 
              fill 
              className="object-contain" 
              sizes="100vw" 
              priority={currentImageIndex === 0} 
              key={allVisuals[currentImageIndex]}
            />
          </div>
        </div>
        
        {/* Boutons de navigation */}
        {allVisuals.length > 1 && !isSwiping && (
          <>
            <button 
              onClick={handlePrevious} 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-black/50" 
              aria-label="Image précédente"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext} 
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:bg-black/50" 
              aria-label="Image suivante"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Indicateurs de pagination - Repositionnés au-dessus du grip */}
        {allVisuals.length > 1 && (
          <div 
            className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 ${isInfoVisible ? 'opacity-0' : 'opacity-100'}`} 
            style={{ bottom: isInfoVisible ? '20px' : '80px' }} // Positionnement dynamique
            aria-label="Indicateurs d'images"
            aria-hidden={isInfoVisible}
          >
            {allVisuals.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentImageIndex(idx)} 
                className={`w-2 h-2 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} 
                aria-label={`Aller à l'image ${idx + 1}`} 
                aria-current={currentImageIndex === idx ? "step" : undefined}
              />
            ))}
          </div>
        )}
        
        {/* Nouveau panneau d'information avec grip toujours visible */}
        <div 
          ref={panelRef} 
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-lg transition-transform duration-300 ease-out transform ${isInfoVisible ? 'translate-y-0' : 'translate-y-calc'}`} 
          style={{ 
            maxHeight: '70vh',
            transform: isInfoVisible ? 'translateY(0)' : `translateY(calc(100% - 40px))` // Grip toujours visible (40px)
          }}
          aria-hidden={!isInfoVisible}
        >
          {/* Grip avec titre visible */}
          <div 
            ref={gripRef}
            className="w-full flex flex-col items-center pt-2 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handlePanelTouchStart}
            onTouchMove={handlePanelTouchMove}
            onTouchEnd={handlePanelTouchEnd}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-1"></div>
            <h2 className="font-great-vibes text-xl text-center truncate max-w-[90%]">{project.title}</h2>
          </div>
          
          {/* Contenu du panneau */}
          <div className={`p-4 overflow-y-auto transition-opacity duration-300 ${isInfoVisible ? 'opacity-100' : 'opacity-0'}`} 
               style={{ maxHeight: 'calc(70vh - 40px)' }}>
            <div className="space-y-4">
              {Array.isArray(project.description) ? (
                project.description.map((paragraph, idx) => (
                  <p key={idx} className="font-poppins text-gray-700 text-sm leading-relaxed">{paragraph}</p>
                ))
              ) : (
                <p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>
              )}
            </div>
            {project.link && (
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium"
              >
                Visiter le site du projet
              </a>
            )}
          </div>
        </div>
      </div>
    )
  } else {
    // --- VERSION DESKTOP (INCHANGÉE) ---
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
          // Classes de base restaurées (pas de max-h conditionnel)
          className="bg-white w-full max-w-5xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl"
          style={{
            transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
            opacity: isAnimating ? 1 : 0
          }}
        >
          {/* Left Column: Image Slider */}
          {/* Ref ajoutée ici */}
          <div className="w-full md:w-1/2 relative" ref={imageColumnRef}>
            {/* Ratio 4/5 conservé */}
            <div className="relative" style={{ aspectRatio: '4/5' }}>
              <Image
                src={allVisuals[currentImageIndex]}
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                fill
                 // Utiliser object-contain ou object-cover selon préférence
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={currentImageIndex === 0}
                key={allVisuals[currentImageIndex]}
              />

              {/* --- Navigation Buttons - Style mis à jour --- */}
              {allVisuals.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    // Style des flèches repris de la version précédente
                    className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleNext}
                     // Style des flèches repris de la version précédente
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow"
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* --- Indicateurs de pagination - Style mis à jour --- */}
              {allVisuals.length > 1 && (
                 // Positionnement et style du conteneur des points repris
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center" aria-label="Indicateurs d'images">
                  {/* Style du fond des points repris */}
                  <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                    {allVisuals.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                         // Style des points individuels repris
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          currentImageIndex === index
                            ? 'bg-white scale-125'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={`Aller à l'image ${index + 1}`}
                        aria-current={currentImageIndex === index ? "step" : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div> {/* Fin Colonne Gauche */}

          {/* Right Column: Content */}
          <div
            // Classe overflow-y-auto restaurée par défaut, ref ajoutée
            className="w-full md:w-1/2 p-8 overflow-y-auto"
            ref={descriptionColumnRef}
          >
            <h2
              id={`modal-title-${project.id}`}
              className="font-great-vibes text-2xl md:text-3xl font-medium mb-4"
            >
              {project.title}
            </h2>
            {/* Structure du contenu texte restaurée */}
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
          </div> {/* Fin Colonne Droite */}

          {/* Close button - Style restauré */}
          <button
            className="absolute -top-5 -right-5 z-20 bg-primary-orange text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div> {/* Fin Conteneur Modal */}
      </div>
    )
  }
}