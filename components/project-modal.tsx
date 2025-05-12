// project-modal.tsx - Version améliorée avec fond blanc et effet de pile
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
  const prevImageRef = useRef<HTMLDivElement>(null) // Référence pour l'image précédente
  const nextImageRef = useRef<HTMLDivElement>(null) // Référence pour l'image suivante
  const panelRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)
  
  // Références pour la synchronisation
  const imageColumnRef = useRef<HTMLDivElement>(null)
  const descriptionColumnRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile() // Utilise le hook existant

  // États pour la gestion du glissement du panneau d'information (mobile)
  const [dragStartY, setDragStartY] = useState<number | null>(null)
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null)
  const [dragDistance, setDragDistance] = useState(0)
  
  // États pour la gestion des images pré-chargées
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({})
  
  // Flags additionnels pour gérer les erreurs
  const [isInitialized, setIsInitialized] = useState(false)
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false)

  // Détection de l'environnement navigateur
  useEffect(() => {
    setIsBrowserEnvironment(typeof window !== 'undefined');
    setIsInitialized(true);
  }, []);

  // Reset current image when project changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setIsInfoVisible(false)
    setImagesLoaded({}) // Reset des images chargées
  }, [project])

  // Calculer les indices des images adjacentes
  const prevIndex = useMemo(() => 
    (currentImageIndex - 1 + allVisuals.length) % allVisuals.length, 
    [currentImageIndex, allVisuals.length]
  );
  
  const nextIndex = useMemo(() => 
    (currentImageIndex + 1) % allVisuals.length, 
    [currentImageIndex, allVisuals.length]
  );

  // --- useEffect pour précharger toutes les images ---
  useEffect(() => {
    if (!isBrowserEnvironment || !isOpen) return;
    
    // Fonction pour précharger une image
    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [src]: true }));
          resolve();
        };
        img.onerror = () => {
          console.error(`Erreur lors du chargement de l'image: ${src}`);
          resolve(); // Résoudre quand même pour ne pas bloquer
        };
        img.src = src;
      });
    };
    
    // Précharger toutes les images du projet
    const preloadAllImages = async () => {
      try {
        // Précharger d'abord les images adjacentes pour une expérience optimale
        if (allVisuals.length > 1) {
          // Commencer par l'image courante, puis les adjacentes
          await Promise.all([
            preloadImage(allVisuals[currentImageIndex]),
            preloadImage(allVisuals[prevIndex]),
            preloadImage(allVisuals[nextIndex])
          ]);
          
          // Puis charger le reste des images en arrière-plan
          const otherImages = allVisuals.filter((_, i) => 
            i !== currentImageIndex && i !== prevIndex && i !== nextIndex
          );
          
          if (otherImages.length > 0) {
            Promise.all(otherImages.map(preloadImage));
          }
        } else if (allVisuals.length === 1) {
          await preloadImage(allVisuals[0]);
        }
      } catch (error) {
        console.error("Erreur lors du préchargement des images:", error);
      }
    };
    
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, prevIndex, nextIndex, isBrowserEnvironment]);
  
  // --- useEffect pour synchroniser la hauteur ---
  useEffect(() => {
    if (!isBrowserEnvironment) return;
    
    const adjustHeight = () => {
      try {
        // Assure que les refs existent et qu'on n'est pas en mobile
        if (imageColumnRef.current && descriptionColumnRef.current && !isMobile) {
          const imageHeight = imageColumnRef.current.offsetHeight;
          // Applique maxHeight à la colonne description
          descriptionColumnRef.current.style.maxHeight = `${imageHeight}px`;
        } else if (descriptionColumnRef.current && !isMobile) {
           // Si l'image n'a pas de ref ou n'est pas prête, on retire le maxHeight
           descriptionColumnRef.current.style.maxHeight = '';
        }
      } catch (error) {
        console.error("Erreur lors de l'ajustement de la hauteur:", error);
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
        try {
          if (descriptionColumnRef.current) {
              descriptionColumnRef.current.style.maxHeight = '';
          }
        } catch (error) {
          console.error("Erreur lors du nettoyage:", error);
        }
      }
    }
     // Si on passe en mobile pendant que c'est ouvert, retirer maxHeight
     else if (descriptionColumnRef.current) {
         try {
           descriptionColumnRef.current.style.maxHeight = '';
         } catch (error) {
           console.error("Erreur lors de la réinitialisation de la hauteur:", error);
         }
     }

  }, [isOpen, isMobile, currentImageIndex, isBrowserEnvironment]);

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

  // Gestion des événements tactiles avec une meilleure sélectivité
  useEffect(() => {
    if (!isBrowserEnvironment) return;
    
    // Cette fonction empêche le défilement du document quand le modal est ouvert en mobile
    const preventDocumentScroll = (e: TouchEvent) => {
      try {
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
            if (e.cancelable) {
              e.preventDefault();
            }
          }
        }
      } catch (error) {
        console.error("Erreur dans preventDocumentScroll:", error);
      }
    };
    
    // Ajouter l'écouteur d'événement avec passive: false pour permettre preventDefault()
    try {
      document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'écouteur touchmove:", error);
      // Fallback en mode passif si nécessaire
      document.addEventListener('touchmove', preventDocumentScroll);
    }
    
    return () => {
      try {
        document.removeEventListener('touchmove', preventDocumentScroll);
      } catch (error) {
        console.error("Erreur lors du retrait de l'écouteur touchmove:", error);
      }
    };
  }, [isOpen, isMobile, isInfoVisible, isBrowserEnvironment]);

  // Handle click outside to close
  useEffect(() => {
    if (!isBrowserEnvironment) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      try {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose()
        }
      } catch (error) {
        console.error("Erreur dans handleClickOutside:", error);
        // En cas d'erreur, on ferme quand même le modal
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, isBrowserEnvironment])

  // Handle keyboard navigation
  useEffect(() => {
    if (!isBrowserEnvironment) return;
    
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
  }, [isOpen, onClose, allVisuals.length, isBrowserEnvironment])

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
    try {
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
      
      // Reset également les transformations des images adjacentes
      if (prevImageRef.current) {
        prevImageRef.current.style.transform = 'translateX(-15%) scale(0.9) rotate(-5deg)';
        prevImageRef.current.style.opacity = '0.5';
      }
      
      if (nextImageRef.current) {
        nextImageRef.current.style.transform = 'translateX(15%) scale(0.9) rotate(5deg)';
        nextImageRef.current.style.opacity = '0.5';
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation de l'état de swipe:", error);
    }
  }

  // Calcul des paramètres de l'animation Tinder
  const calculateSwipeAnimation = (currentX: number, startX: number) => {
    if (!imageRef.current) return;
    
    try {
      const distance = currentX - startX;
      const maxRotation = 25; // Angle maximum de rotation augmenté
      const screenWidth = window.innerWidth;
      const swipeThreshold = screenWidth * 0.3; // Distance minimale pour changer d'image
      
      // Calcul de la rotation proportionnelle avec coefficient amplifié
      const rotation = (distance / screenWidth) * maxRotation * 1.3; // Amplification de 30%
      
      // Amplifier légèrement le déplacement pour un effet plus dynamique
      const normalizedDistance = distance * 1.2; // Amplification de 20%
      
      setSwipeDistance(normalizedDistance);
      setSwipeRotation(rotation);
      
      // Déterminer la direction du swipe
      const direction = distance > 0 ? 'right' : distance < 0 ? 'left' : null;
      setSwipeDirection(direction);
      
      // Appliquer la transformation en temps réel avec une origine de rotation décalée
      // pour un effet plus naturel (comme si on tenait la carte par un coin)
      imageRef.current.style.transformOrigin = distance > 0 ? '20% 110%' : '80% 110%';
      const transform = `translateX(${normalizedDistance}px) rotate(${rotation}deg)`;
      const opacity = 1 - Math.min(0.3, Math.abs(distance) / (screenWidth * 1.5));
      
      imageRef.current.style.transform = transform;
      imageRef.current.style.opacity = opacity.toString();
      imageRef.current.style.transition = 'none';
      imageRef.current.style.zIndex = '10'; // Assurer que l'image actuelle est au-dessus
      
      // Animer les images adjacentes en fonction de la direction du swipe
      if (prevImageRef.current && nextImageRef.current) {
        // Quand on swipe vers la gauche (next), l'image suivante devient plus visible
        if (distance < 0) {
          const nextVisibility = Math.min(0.8, 0.5 + Math.abs(distance) / (screenWidth * 1.5));
          const nextScale = 0.9 + (Math.abs(distance) / screenWidth) * 0.2;
          const nextRotation = 5 - (Math.abs(distance) / screenWidth) * 10;
          const nextTranslateX = 15 - (Math.abs(distance) / screenWidth) * 30;
          
          nextImageRef.current.style.opacity = nextVisibility.toString();
          nextImageRef.current.style.transform = `translateX(${nextTranslateX}%) scale(${nextScale}) rotate(${nextRotation}deg)`;
          nextImageRef.current.style.zIndex = '5';
          
          // Cacher l'image précédente
          prevImageRef.current.style.opacity = '0.2';
          prevImageRef.current.style.transform = 'translateX(-20%) scale(0.8) rotate(-8deg)';
          prevImageRef.current.style.zIndex = '1';
        } 
        // Quand on swipe vers la droite (previous), l'image précédente devient plus visible
        else if (distance > 0) {
          const prevVisibility = Math.min(0.8, 0.5 + Math.abs(distance) / (screenWidth * 1.5));
          const prevScale = 0.9 + (Math.abs(distance) / screenWidth) * 0.2;
          const prevRotation = -5 + (Math.abs(distance) / screenWidth) * 10;
          const prevTranslateX = -15 + (Math.abs(distance) / screenWidth) * 30;
          
          prevImageRef.current.style.opacity = prevVisibility.toString();
          prevImageRef.current.style.transform = `translateX(${prevTranslateX}%) scale(${prevScale}) rotate(${prevRotation}deg)`;
          prevImageRef.current.style.zIndex = '5';
          
          // Cacher l'image suivante
          nextImageRef.current.style.opacity = '0.2';
          nextImageRef.current.style.transform = 'translateX(20%) scale(0.8) rotate(8deg)';
          nextImageRef.current.style.zIndex = '1';
        }
      }
      
    } catch (error) {
      console.error("Erreur lors du calcul de l'animation Tinder:", error);
    }
  }

  // Gestion du swipe Tinder pour les images (mobile)
  const minSwipeDistance = 50; // Réduit pour permettre un swipe plus sensible
  const onTouchStart = (e: React.TouchEvent) => {
    try {
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
    } catch (error) {
      console.error("Erreur dans onTouchStart:", error);
      // En cas d'erreur, désactiver le swipe
      setIsSwiping(false);
    }
  }
  
  const onTouchMove = (e: React.TouchEvent) => {
    try {
      if (touchStart === null || !isSwiping) return;
      
      // Prévenir le comportement par défaut pour éviter les conflits avec le scroll
      if (e.cancelable) {
        e.preventDefault();
      }
      
      // Update currentTouch positions
      setCurrentTouchX(e.targetTouches[0].clientX);
      setCurrentTouchY(e.targetTouches[0].clientY);
      setTouchEnd(e.targetTouches[0].clientX);
      
      // Calculate and apply the Tinder animation
      calculateSwipeAnimation(e.targetTouches[0].clientX, touchStart);
    } catch (error) {
      console.error("Erreur dans onTouchMove:", error);
      // En cas d'erreur, réinitialiser l'état
      resetSwipeState();
    }
  }

  const onTouchEnd = () => {
    try {
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
          
          // Animer l'image suivante pour qu'elle prenne la place
          if (nextImageRef.current) {
            nextImageRef.current.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.175), opacity 0.35s ease-out';
            nextImageRef.current.style.transform = 'translateX(0) rotate(0deg) scale(1)';
            nextImageRef.current.style.opacity = '1';
            nextImageRef.current.style.zIndex = '15';
          }
          
          // Delay the image change to allow animation to complete
          setTimeout(() => handleNext(), 300);
        } else if (isRightSwipe) {
          // Complete the swipe animation before changing image avec animation améliorée
          const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.3)); // Assurer une rotation minimale
          imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.95)`;
          imageRef.current.style.opacity = '0';
          
          // Animer l'image précédente pour qu'elle prenne la place
          if (prevImageRef.current) {
            prevImageRef.current.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.175), opacity 0.35s ease-out';
            prevImageRef.current.style.transform = 'translateX(0) rotate(0deg) scale(1)';
            prevImageRef.current.style.opacity = '1';
            prevImageRef.current.style.zIndex = '15';
          }
          
          // Delay the image change to allow animation to complete
          setTimeout(() => handlePrevious(), 300);
        } else {
          // Return to center with elastic animation if not enough distance
          // Cubique bezier pour un effet de "ressort" plus prononcé
          imageRef.current.style.transform = 'translateX(0) rotate(0deg)';
          imageRef.current.style.opacity = '1';
          imageRef.current.style.transformOrigin = 'center center'; // Reset transform origin
          
          // Remettre les images adjacentes à leur place
          if (prevImageRef.current) {
            prevImageRef.current.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.175), opacity 0.35s ease-out';
            prevImageRef.current.style.transform = 'translateX(-15%) scale(0.9) rotate(-5deg)';
            prevImageRef.current.style.opacity = '0.5';
          }
          
          if (nextImageRef.current) {
            nextImageRef.current.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.175), opacity 0.35s ease-out';
            nextImageRef.current.style.transform = 'translateX(15%) scale(0.9) rotate(5deg)';
            nextImageRef.current.style.opacity = '0.5';
          }
        }
      }
    } catch (error) {
      console.error("Erreur dans onTouchEnd:", error);
    } finally {
      // Reset states
      resetSwipeState();
    }
  }

  // Fonction pour mettre à jour l'opacité du contenu en temps réel
  const updateContentVisibility = (deltaY: number) => {
    try {
      const contentElements = panelRef.current?.querySelectorAll('.panel-content');
      if (!contentElements) return;
      
      // Calculer l'opacité en fonction du déplacement
      if (isInfoVisible) {
        // Si panel ouvert, réduire l'opacité en glissant vers le bas
        const opacity = Math.max(0, 1 - (deltaY / 300)); // Réduire plus lentement
        contentElements.forEach(el => {
          (el as HTMLElement).style.opacity = opacity.toString();
        });
      } else {
        // Si panel fermé, augmenter l'opacité en glissant vers le haut
        const opacity = Math.min(1, Math.abs(deltaY) / 200); // Augmenter plus lentement
        contentElements.forEach(el => {
          (el as HTMLElement).style.opacity = opacity.toString();
          // Rendre le contenu visible pendant le glissement
          (el as HTMLElement).style.display = opacity > 0.1 ? 'block' : 'none';
        });
      }
    } catch (error) {
      console.error("Erreur dans updateContentVisibility:", error);
    }
  }

  // Gestion du glissement du panneau d'information (mobile)
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    try {
      e.stopPropagation(); // Empêcher la propagation pour éviter le swipe d'image
      
      // Empêcher le comportement de pull-to-refresh seulement si cancelable
      if (e.cancelable) {
        e.preventDefault();
      }
      
      setDragStartY(e.touches[0].clientY);
      setDragDistance(0);
      
      if (panelRef.current) {
        panelRef.current.style.transition = 'none';
      }
    } catch (error) {
      console.error("Erreur dans handlePanelTouchStart:", error);
    }
  }
  
  const handlePanelTouchMove = (e: React.TouchEvent) => {
    try {
      if (dragStartY === null || !panelRef.current) return;
      
      // Empêcher le comportement par défaut du navigateur seulement si cancelable
      if (e.cancelable) {
        e.preventDefault();
      }
      
      const currentY = e.touches[0].clientY;
      setDragCurrentY(currentY);
      
      const deltaY = currentY - dragStartY;
      setDragDistance(deltaY);
      
      const deadZone = 5; // Zone morte en pixels réduite pour plus de sensibilité
      
      // Ne rien faire si le mouvement est dans la zone morte
      if (Math.abs(deltaY) < deadZone) return;
      
      // Appliquer la transformation directement en fonction du mouvement du doigt
      // sans limiter la direction (pour un suivi plus fluide)
      panelRef.current.style.transform = `translateY(${deltaY}px)`;
      
      // Mettre à jour l'opacité du contenu en temps réel
      updateContentVisibility(deltaY);
      
      // Mettre à jour dynamiquement le texte du grip
      updateGripText(deltaY);
      
    } catch (error) {
      console.error("Erreur dans handlePanelTouchMove:", error);
    }
  }
  
  // Mise à jour dynamique du texte du grip pendant le mouvement
  const updateGripText = (deltaY: number) => {
    try {
      const gripTitle = gripRef.current?.querySelector('h2');
      if (!gripTitle) return;
      
      // Calculer le pourcentage de progression vers l'état opposé
      const panelHeight = panelRef.current?.getBoundingClientRect().height || 0;
      const thresholdRatio = panelHeight * 0.2; // 20% de la hauteur du panneau comme seuil
      
      if (isInfoVisible) {
        // Si le panneau est ouvert et qu'on glisse vers le bas
        if (deltaY > 0) {
          const progress = Math.min(1, deltaY / thresholdRatio);
          if (progress > 0.5) {
            (gripTitle as HTMLElement).textContent = 'DESCRIPTION';
          } else {
            (gripTitle as HTMLElement).textContent = project.title;
          }
        }
      } else {
        // Si le panneau est fermé et qu'on glisse vers le haut
        if (deltaY < 0) {
          const progress = Math.min(1, Math.abs(deltaY) / thresholdRatio);
          if (progress > 0.5) {
            (gripTitle as HTMLElement).textContent = project.title;
          } else {
            (gripTitle as HTMLElement).textContent = 'DESCRIPTION';
          }
        }
      }
    } catch (error) {
      console.error("Erreur dans updateGripText:", error);
    }
  }
  
  const handlePanelTouchEnd = () => {
    try {
      if (dragStartY === null || dragCurrentY === null || !panelRef.current) return;
      
      const deltaY = dragCurrentY - dragStartY;
      // Seuil de décision réduit pour être plus sensible
      const threshold = 40;
      
      // Utiliser une courbe cubique pour une animation plus naturelle
      panelRef.current.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      
      if (isInfoVisible) {
        // Si panel ouvert et glissé assez vers le bas
        if (deltaY > threshold) {
          setIsInfoVisible(false);
          
          // Animer la disparition du contenu de manière plus progressive
          const contentElements = panelRef.current.querySelectorAll('.panel-content');
          contentElements.forEach(el => {
            // Transition plus lente pour l'opacité
            (el as HTMLElement).style.transition = 'opacity 0.5s ease-out';
            (el as HTMLElement).style.opacity = '0';
            
            // Retarder le masquage de l'élément pour permettre à l'animation de finir
            setTimeout(() => {
              if (!isInfoVisible && el) {
                (el as HTMLElement).style.display = 'none';
              }
            }, 500); // Délai augmenté pour une transition plus progressive
          });
          
          // Changer le texte du grip
          const gripTitle = gripRef.current?.querySelector('h2');
          if (gripTitle) {
            (gripTitle as HTMLElement).textContent = 'DESCRIPTION';
            (gripTitle as HTMLElement).className = 'font-poppins text-sm uppercase font-medium tracking-wide text-center max-w-[90%] mt-0';
          }
        } else {
          // Pas assez glissé, retour à la position ouverte avec animation du contenu
          panelRef.current.style.transform = '';
          
          const contentElements = panelRef.current.querySelectorAll('.panel-content');
          contentElements.forEach(el => {
            (el as HTMLElement).style.transition = 'opacity 0.3s ease-in';
            (el as HTMLElement).style.opacity = '1';
          });
          
          // S'assurer que le titre est correct
          const gripTitle = gripRef.current?.querySelector('h2');
          if (gripTitle) {
            (gripTitle as HTMLElement).textContent = project.title;
            (gripTitle as HTMLElement).className = 'font-great-vibes text-2xl text-center truncate max-w-[90%] mt-2';
          }
        }
      } else {
        // Si panel fermé et glissé assez vers le haut
        if (deltaY < -threshold) {
          setIsInfoVisible(true);
          
          // Animer l'apparition du contenu
          const contentElements = panelRef.current.querySelectorAll('.panel-content');
          contentElements.forEach(el => {
            (el as HTMLElement).style.display = 'block';
            (el as HTMLElement).style.transition = 'opacity 0.4s ease-in';
            
            // Petit délai pour s'assurer que l'élément est visible avant l'animation
            setTimeout(() => {
              if (el) (el as HTMLElement).style.opacity = '1';
            }, 10);
          });
          
          // Changer le texte du grip
          const gripTitle = gripRef.current?.querySelector('h2');
          if (gripTitle) {
            (gripTitle as HTMLElement).textContent = project.title;
            (gripTitle as HTMLElement).className = 'font-great-vibes text-2xl text-center truncate max-w-[90%] mt-2';
          }
        } else {
          // Pas assez glissé, retour à la position fermée
          panelRef.current.style.transform = '';
          
          // Masquer le contenu progressivement
          const contentElements = panelRef.current.querySelectorAll('.panel-content');
          contentElements.forEach(el => {
            (el as HTMLElement).style.transition = 'opacity 0.3s ease-out';
            (el as HTMLElement).style.opacity = '0';
            setTimeout(() => {
              if (!isInfoVisible && el) {
                (el as HTMLElement).style.display = 'none';
              }
            }, 300);
          });
          
          // S'assurer que le titre est correct
          const gripTitle = gripRef.current?.querySelector('h2');
          if (gripTitle) {
            (gripTitle as HTMLElement).textContent = 'DESCRIPTION';
            (gripTitle as HTMLElement).className = 'font-poppins text-sm uppercase font-medium tracking-wide text-center max-w-[90%] mt-0';
          }
        }
      }
    } catch (error) {
      console.error("Erreur dans handlePanelTouchEnd:", error);
    } finally {
      // Réinitialiser les états
      setDragStartY(null);
      setDragCurrentY(null);
      setDragDistance(0);
    }
  }