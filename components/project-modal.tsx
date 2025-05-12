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

  // --- useEffect pour précharger les images ---
  useEffect(() => {
    if (isOpen && isMobile && allVisuals.length > 1) {
      // Précharger toutes les images du projet pour une navigation fluide
      allVisuals.forEach((imgSrc) => {
        if (imgSrc !== allVisuals[currentImageIndex]) { // Ne pas recharger l'image actuelle
          const img = new Image();
          img.src = imgSrc;
        }
      });
    }
  }, [isOpen, isMobile, allVisuals, currentImageIndex]);
  
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
  
  // Gestion des événements tactiles avec une meilleure sélectivité
  useEffect(() => {
    // Cette fonction empêche le défilement du document quand le modal est ouvert en mobile
    const preventDocumentScroll = (e: TouchEvent) => {
      // Si le modal est ouvert et qu'on est sur mobile, empêcher le scroll du document
      // sauf si l'événement vient du panneau de contenu quand il est déplié
      if (isOpen && isMobile) {
        // Vérifier si le touch vient du contenu déplié (autoriser le scroll)
        const target = e.target as Node;
        const panelContent = panelRef.current?.querySelector('.panel-content');
        
        if (panelContent && isInfoVisible && panelContent.contains(target)) {
          // Permettre le scroll dans le contenu déplié
          return true;
        } else {
          // Empêcher le scroll partout ailleurs
          e.preventDefault();
        }
      }
    };
    
    // Ajouter l'écouteur d'événement avec passive: false pour permettre preventDefault()
    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventDocumentScroll);
    };
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
      // Réinitialiser après une courte temporisation pour éviter les conflits d'animation
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.style.transform = '';
          imageRef.current.style.transition = '';
          imageRef.current.style.opacity = '1';
          imageRef.current.style.transformOrigin = 'center center'; // Reset transform origin
        }
      }, 50);
    }
  }

  // Calcul des paramètres de l'animation Tinder
  const calculateSwipeAnimation = (currentX: number, startX: number) => {
    if (!imageRef.current) return;
    
    const distance = currentX - startX;
    const maxRotation = 25; // Angle maximum de rotation augmenté (était 15)
    const screenWidth = window.innerWidth;
    const swipeThreshold = screenWidth * 0.3; // Distance minimale pour changer d'image (légèrement réduite)
    
    // Calcul de la rotation proportionnelle avec coefficient amplifié
    const rotation = (distance / screenWidth) * maxRotation * 1.3; // Amplification de 30%
    
    // Amplifier légèrement le déplacement pour un effet plus dynamique
    const normalizedDistance = distance * 1.2; // Amplification de 20%
    
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
    
    // Appliquer la transformation en temps réel avec une origine de rotation décalée
    // pour un effet plus naturel (comme si on tenait la carte par un coin)
    imageRef.current.style.transformOrigin = distance > 0 ? '20% 110%' : '80% 110%';
    const transform = `translateX(${normalizedDistance}px) rotate(${rotation}deg)`;
    const opacity = 1 - Math.min(0.3, Math.abs(distance) / (screenWidth * 1.5));
    
    imageRef.current.style.transform = transform;
    imageRef.current.style.opacity = opacity.toString();
    imageRef.current.style.transition = 'none';
  }

  // Gestion du swipe Tinder pour les images (mobile)
  const minSwipeDistance = 50; // Réduit pour permettre un swipe plus sensible
  const onTouchStart = (e: React.TouchEvent) => {
    // Ignorer si on touche le panneau info
    if (panelRef.current?.contains(e.target as Node)) return;
    
    // Préchargement des images adjacentes pour une animation fluide
    if (allVisuals.length > 1) {
      const nextIndex = (currentImageIndex + 1) % allVisuals.length;
      const prevIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
      
      // Précharger les images suivante et précédente
      const nextImage = new Image();
      nextImage.src = allVisuals[nextIndex];
      
      const prevImage = new Image();
      prevImage.src = allVisuals[prevIndex];
    }
    
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
    
    // Prévenir le comportement par défaut pour éviter les conflits avec le scroll
    e.preventDefault();
    
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
      // Utilise cubic-bezier pour une animation plus dynamique
      imageRef.current.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.175), opacity 0.35s ease-out';
      
      if (isLeftSwipe) {
        // Complete the swipe animation before changing image with animation améliorée
        const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.3)); // Assurer une rotation minimale
        imageRef.current.style.transform = `translateX(-120%) rotate(-${finalRotation}deg) scale(0.95)`;
        imageRef.current.style.opacity = '0';
        
        // Delay the image change to allow animation to complete
        setTimeout(() => handleNext(), 300);
      } else if (isRightSwipe) {
        // Complete the swipe animation before changing image avec animation améliorée
        const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.3)); // Assurer une rotation minimale
        imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.95)`;
        imageRef.current.style.opacity = '0';
        
        // Delay the image change to allow animation to complete
        setTimeout(() => handlePrevious(), 300);
      } else {
        // Return to center with elastic animation if not enough distance
        // Cubique bezier pour un effet de "ressort" plus prononcé
        imageRef.current.style.transform = 'translateX(0) rotate(0deg)';
        imageRef.current.style.opacity = '1';
        imageRef.current.style.transformOrigin = 'center center'; // Reset transform origin
      }
    }
    
    // Reset states
    resetSwipeState();
  }

  // Gestion du glissement du panneau d'information (mobile)
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Empêcher la propagation pour éviter le swipe d'image
    
    // Empêcher le comportement de pull-to-refresh
    e.preventDefault();
    
    setDragStartY(e.touches[0].clientY);
    
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  }
  
  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (dragStartY === null || !panelRef.current) return;
    
    // Empêcher le comportement par défaut du navigateur (pull-to-refresh, scroll, etc.)
    e.preventDefault();
    
    const currentY = e.touches[0].clientY;
    setDragCurrentY(currentY);
    
    const deltaY = currentY - dragStartY;
    const deadZone = 10; // Zone morte en pixels pour éviter les micro-mouvements accidentels
    
    // Ne rien faire si le mouvement est dans la zone morte
    if (Math.abs(deltaY) < deadZone) return;
    
    // Limiter le déplacement différemment selon l'état
    if (isInfoVisible) {
      // Panel ouvert - permettre uniquement de glisser vers le bas
      if (deltaY > deadZone) {
        // Appliquer une résistance progressive pour un effet plus naturel
        const resistedDeltaY = Math.pow(deltaY, 0.8);
        panelRef.current.style.transform = `translateY(${resistedDeltaY}px)`;
      }
    } else {
      // Panel fermé - permettre uniquement de glisser vers le haut
      if (deltaY < -deadZone) {
        // Limiter le mouvement vers le haut avec résistance
        const maxUpwardMovement = -60; // Permettre un mouvement plus grand
        const normalizedDeltaY = Math.max(deltaY * 0.8, maxUpwardMovement);
        panelRef.current.style.transform = `translateY(${normalizedDeltaY}px)`;
      }
    }
    
    // Mettre à jour l'opacité du contenu en temps réel en fonction du déplacement
    updateContentVisibility(deltaY);
  }
  
  // Fonction pour mettre à jour l'opacité du contenu en temps réel
  const updateContentVisibility = (deltaY: number) => {
    const contentElements = panelRef.current?.querySelectorAll('.panel-content');
    if (!contentElements) return;
    
    // Calculer l'opacité en fonction du déplacement
    if (isInfoVisible) {
      // Si panel ouvert, réduire l'opacité en glissant vers le bas
      const opacity = Math.max(0, 1 - (deltaY / 200));
      contentElements.forEach(el => {
        (el as HTMLElement).style.opacity = opacity.toString();
      });
    } else {
      // Si panel fermé, augmenter l'opacité en glissant vers le haut
      const opacity = Math.min(1, Math.abs(deltaY) / 150);
      contentElements.forEach(el => {
        (el as HTMLElement).style.opacity = opacity.toString();
        // Rendre le contenu visible pendant le glissement
        (el as HTMLElement).style.display = opacity > 0.1 ? 'block' : 'none';
      });
    }
  }
  
  const handlePanelTouchEnd = () => {
    if (dragStartY === null || dragCurrentY === null || !panelRef.current) return;
    
    const deltaY = dragCurrentY - dragStartY;
    const threshold = 50; // Seuil réduit pour décider si on ouvre/ferme
    
    // Utiliser une courbe cubique pour une animation plus naturelle
    panelRef.current.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    
    if (isInfoVisible) {
      // Si panel ouvert et glissé assez vers le bas
      if (deltaY > threshold) {
        setIsInfoVisible(false);
        
        // Animer la disparition du contenu
        const contentElements = panelRef.current.querySelectorAll('.panel-content');
        contentElements.forEach(el => {
          (el as HTMLElement).style.opacity = '0';
          setTimeout(() => {
            if (!isInfoVisible && el) {
              (el as HTMLElement).style.display = 'none';
            }
          }, 300);
        });
      } else {
        // Pas assez glissé, retour à la position ouverte avec animation du contenu
        panelRef.current.style.transform = '';
        const contentElements = panelRef.current.querySelectorAll('.panel-content');
        contentElements.forEach(el => {
          (el as HTMLElement).style.opacity = '1';
        });
      }
    } else {
      // Si panel fermé et glissé assez vers le haut
      if (deltaY < -threshold) {
        setIsInfoVisible(true);
        
        // Animer l'apparition du contenu
        const contentElements = panelRef.current.querySelectorAll('.panel-content');
        contentElements.forEach(el => {
          (el as HTMLElement).style.display = 'block';
          // Petit délai pour s'assurer que l'élément est visible avant l'animation
          setTimeout(() => {
            if (el) (el as HTMLElement).style.opacity = '1';
          }, 10);
        });
      } else {
        // Pas assez glissé, retour à la position fermée
        panelRef.current.style.transform = '';
        
        // Masquer le contenu
        const contentElements = panelRef.current.querySelectorAll('.panel-content');
        contentElements.forEach(el => {
          (el as HTMLElement).style.opacity = '0';
          setTimeout(() => {
            if (!isInfoVisible && el) {
              (el as HTMLElement).style.display = 'none';
            }
          }, 300);
        });
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
              className="relative h-full w-full will-change-transform"
              style={{ transformOrigin: 'center' }}
            >
              <Image 
                src={allVisuals[currentImageIndex]} 
                alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} 
                fill 
                className="object-contain" 
                sizes="100vw" 
                priority={true} // Priorité à toutes les images pour garantir un chargement rapide
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
            style={{ 
              bottom: `calc(20vh + 20px)`, // 20px au-dessus du grip qui fait 20vh de hauteur 
              zIndex: 5 // Assurer que les dots restent au-dessus
            }} 
            aria-label="Indicateurs d'images"
            aria-hidden={isInfoVisible}
          >
            <div className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
              {allVisuals.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentImageIndex(idx)} 
                  className={`w-2.5 h-2.5 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} 
                  aria-label={`Aller à l'image ${idx + 1}`} 
                  aria-current={currentImageIndex === idx ? "step" : undefined}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Nouveau panneau d'information avec grip plus grand toujours visible */}
        <div 
          ref={panelRef} 
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-lg transition-transform duration-400 ease-out transform ${isInfoVisible ? 'translate-y-0' : 'translate-y-calc'}`} 
          style={{ 
            maxHeight: '75vh',
            transform: isInfoVisible ? 'translateY(0)' : `translateY(calc(100% - 20vh))` // Grip plus grand (20vh)
          }}
          aria-hidden={!isInfoVisible}
        >
          {/* Grip avec titre visible - hauteur augmentée */}
          <div 
            ref={gripRef}
            className="w-full flex flex-col items-center justify-center p-4 cursor-grab active:cursor-grabbing min-h-[20vh]"
            onTouchStart={handlePanelTouchStart}
            onTouchMove={handlePanelTouchMove}
            onTouchEnd={handlePanelTouchEnd}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-2"></div>
            <h2 className="font-great-vibes text-2xl text-center truncate max-w-[90%] mt-2">{project.title}</h2>
          </div>
          
          {/* Contenu du panneau avec classe panel-content pour la manipulation programmée */}
          <div 
            className={`p-5 overflow-y-auto panel-content`}
            style={{ 
              maxHeight: 'calc(75vh - 20vh)',
              display: isInfoVisible ? 'block' : 'none', // État initial basé sur isInfoVisible
              opacity: isInfoVisible ? '1' : '0' // État initial basé sur isInfoVisible
            }}
          >
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