"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Project {
  id: string;
  title: string;
  mainVisual: string;
  additionalVisuals: string[];
  description: string | string[];
  link: string;
}

// Constantes
const GRIP_HEIGHT_COLLAPSED = '2.5vh';  // Hauteur du grip en position repliée
const GRIP_HEIGHT_EXPANDED = '75vh';    // Hauteur maximale du panneau déplié
const PANEL_ANIMATION_DURATION = 400;
const CONTENT_FADE_DURATION = 300;
const MIN_SWIPE_DISTANCE = 80;

interface ProjectModalMobileProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export default function ProjectModalMobile({ project, isOpen, onClose }: ProjectModalMobileProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [panelTranslateY, setPanelTranslateY] = useState<number | null>(null);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const currentImageRef = useRef<HTMLDivElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const prevImageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const panelInitialY = useRef<number>(0);

  useEffect(() => { 
    setIsMounted(true); 
    console.log("ProjectModalMobile: MOUNTED"); 
  }, []);

  // Calcul de la position initiale du panneau replié
  const initialCollapsedY = useMemo(() => {
    if (typeof window !== 'undefined' && isMounted) {
      try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const calculatedY = expandedHeightPx - gripHeightPx;
        console.log("ProjectModalMobile: initialCollapsedY calculated =", calculatedY, {vh, gripHeightPx, expandedHeightPx});
        return calculatedY;
      } catch (e) { console.error("Error calculating initialCollapsedY", e); return null; }
    }
    console.log("ProjectModalMobile: initialCollapsedY not calculated (not mounted or no window)");
    return null;
  }, [isMounted]);

  const prevIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex - 1 + allVisuals.length) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);
  const nextIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex + 1) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);

  // Fonction pour naviguer vers l'image suivante
  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    console.log("ProjectModalMobile: handleNext called, currentIndex =", currentImageIndex, "nextIndex =", nextIndex);
    setCurrentImageIndex(nextIndex);
  }, [currentImageIndex, nextIndex, allVisuals.length, isSwiping]);

  // Fonction pour naviguer vers l'image précédente
  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    console.log("ProjectModalMobile: handlePrevious called, currentIndex =", currentImageIndex, "prevIndex =", prevIndex);
    setCurrentImageIndex(prevIndex);
  }, [currentImageIndex, prevIndex, allVisuals.length, isSwiping]);

  // Réinitialiser l'état du swipe
  const resetSwipeState = useCallback(() => {
    console.log("Resetting swipe state");
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsSwiping(false);
    
    if (currentImageRef.current) {
      currentImageRef.current.style.transform = 'translateX(0)';
      currentImageRef.current.style.opacity = '1';
      currentImageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    }
    
    if (nextImageRef.current) {
      nextImageRef.current.style.transform = 'translateX(100%)';
      nextImageRef.current.style.opacity = '0';
      nextImageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    }
    
    if (prevImageRef.current) {
      prevImageRef.current.style.transform = 'translateX(-100%)';
      prevImageRef.current.style.opacity = '0';
      prevImageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    }
  }, []);

  // Gestionnaire pour le début du swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Ne pas commencer un swipe si l'interaction est dans le panneau
    if (panelRef.current?.contains(e.target as Node)) {
      console.log("Touch start inside panel, ignoring for swipe");
      return;
    }
    
    // Ne pas commencer un swipe s'il n'y a qu'une seule image ou si on est déjà en train de faire glisser le panneau
    if (allVisuals.length <= 1 || isDraggingPanel) {
      console.log("Touch start ignored - allVisuals.length =", allVisuals.length, "isDraggingPanel =", isDraggingPanel);
      return;
    }
    
    console.log("Starting swipe, touchStartX =", e.touches[0].clientX);
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
    setIsSwiping(true);
    
    // Supprimer les transitions pour un mouvement fluide
    if (currentImageRef.current) currentImageRef.current.style.transition = 'none';
    if (nextImageRef.current) nextImageRef.current.style.transition = 'none';
    if (prevImageRef.current) prevImageRef.current.style.transition = 'none';
  }, [allVisuals.length, isDraggingPanel]);

  // Gestionnaire pour le mouvement pendant le swipe
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX === null || !isSwiping) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX;
    
    // Prévenir le scroll vertical si le mouvement est principalement horizontal
    if (Math.abs(deltaX) > 10 && e.cancelable) {
      e.preventDefault();
    }
    
    setTouchDeltaX(deltaX);
    
    // L'image actuelle se déplace avec le doigt
    if (currentImageRef.current) {
      const translateX = deltaX;
      currentImageRef.current.style.transform = `translateX(${translateX}px)`;
      
      // Ajuster l'opacité en fonction de la distance du swipe
      const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / (window.innerWidth * 0.5));
      currentImageRef.current.style.opacity = opacity.toString();
    }
    
    // L'image suivante apparaît en venant de la droite quand on swipe vers la gauche
    if (nextImageRef.current && deltaX < 0) {
      const progressRatio = Math.min(1, Math.abs(deltaX) / window.innerWidth);
      const translateX = window.innerWidth - (progressRatio * window.innerWidth);
      nextImageRef.current.style.transform = `translateX(${translateX}px)`;
      nextImageRef.current.style.opacity = progressRatio.toString();
    }
    
    // L'image précédente apparaît en venant de la gauche quand on swipe vers la droite
    if (prevImageRef.current && deltaX > 0) {
      const progressRatio = Math.min(1, Math.abs(deltaX) / window.innerWidth);
      const translateX = -window.innerWidth + (progressRatio * window.innerWidth);
      prevImageRef.current.style.transform = `translateX(${translateX}px)`;
      prevImageRef.current.style.opacity = progressRatio.toString();
    }
  }, [touchStartX, isSwiping]);

  // Gestionnaire pour la fin du swipe
  const handleTouchEnd = useCallback(() => {
    if (touchStartX === null || !isSwiping) return;
    
    const isLeftSwipe = touchDeltaX < -MIN_SWIPE_DISTANCE;
    const isRightSwipe = touchDeltaX > MIN_SWIPE_DISTANCE;
    
    console.log("Touch end - deltaX =", touchDeltaX, "isLeftSwipe =", isLeftSwipe, "isRightSwipe =", isRightSwipe);
    
    // Définir la transition pour l'animation de fin
    const transitionStyle = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    
    if (currentImageRef.current) currentImageRef.current.style.transition = transitionStyle;
    if (nextImageRef.current) nextImageRef.current.style.transition = transitionStyle;
    if (prevImageRef.current) prevImageRef.current.style.transition = transitionStyle;
    
    if (isLeftSwipe) {
      // Faire sortir l'image actuelle vers la gauche
      if (currentImageRef.current) {
        currentImageRef.current.style.transform = 'translateX(-100%)';
        currentImageRef.current.style.opacity = '0';
      }
      
      // Positionner l'image suivante au centre
      if (nextImageRef.current) {
        nextImageRef.current.style.transform = 'translateX(0)';
        nextImageRef.current.style.opacity = '1';
      }
      
      // Changer l'image après la transition
      setTimeout(() => {
        handleNext();
        resetSwipeState();
      }, 300);
    } else if (isRightSwipe) {
      // Faire sortir l'image actuelle vers la droite
      if (currentImageRef.current) {
        currentImageRef.current.style.transform = 'translateX(100%)';
        currentImageRef.current.style.opacity = '0';
      }
      
      // Positionner l'image précédente au centre
      if (prevImageRef.current) {
        prevImageRef.current.style.transform = 'translateX(0)';
        prevImageRef.current.style.opacity = '1';
      }
      
      // Changer l'image après la transition
      setTimeout(() => {
        handlePrevious();
        resetSwipeState();
      }, 300);
    } else {
      // Pas de swipe significatif, retour à la position initiale
      resetSwipeState();
    }
  }, [touchStartX, touchDeltaX, isSwiping, handleNext, handlePrevious, resetSwipeState]);

  const calculatePanelY = useCallback((deltaY: number): number => {
      if (!isMounted) return 0;
      try {
        const initialPos = panelInitialY.current;
        let newY = initialPos + deltaY;
        
        const vh = window.innerHeight;
        const gripH = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedH = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        
        const collapsedY = expandedH - gripH;
        const expandedY = 0;
        
        // Limiter le déplacement du panneau
        const minY = expandedY - 50;
        const maxY = collapsedY + 50;
        
        return Math.max(minY, Math.min(maxY, newY));
      } catch (error) {
        console.error("Panel Y calc error:", error);
        return panelInitialY.current;
      }
  }, [isMounted]);

  const updateContentVisibility = useCallback((currentY: number | null) => {
    if (currentY === null || !panelRef.current) return;
    
    try {
        const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
        if (!contentElement) return;
        
        const vh = window.innerHeight;
        const gripH = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedH = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        
        const collapsedY = expandedH - gripH;
        const expandedY = 0;
        
        const totalTravel = collapsedY - expandedY;
        if (totalTravel <= 0) return;
        
        const progress = Math.max(0, Math.min(1, (currentY - expandedY) / totalTravel));
        const opacity = 1 - progress;
        
        contentElement.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
        
        if (opacity > 0) {
            contentElement.style.display = 'block';
        }
    } catch (error) {
        console.error("Content visibility error", error);
    }
  }, []);

  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    if (isSwiping) return;
    
    const target = e.target as Node;
    const panelContent = panelRef.current?.querySelector('.panel-content');
    
    // Si le touch est sur un contenu scrollable du panneau, laisser le scroll fonctionner
    const isTouchingScrollableContent = panelContent?.contains(target) && 
                                       isInfoVisible && 
                                       panelContent.scrollHeight > panelContent.clientHeight;
                                       
    if (isTouchingScrollableContent) {
        setIsDraggingPanel(false);
        return;
    }
    
    try {
        e.stopPropagation();
        setDragStartY(e.touches[0].clientY);
        setIsDraggingPanel(true);
        
        if (panelRef.current) {
            panelRef.current.style.transition = 'none';
            
            const style = window.getComputedStyle(panelRef.current);
            const matrix = new DOMMatrix(style.transform === 'none' ? '' : style.transform);
            
            panelInitialY.current = matrix.m42;
            setPanelTranslateY(panelInitialY.current);
            
            // Assurer que le contenu est visible pendant le drag
            if (!isInfoVisible && panelContent) {
                (panelContent as HTMLElement).style.display = 'block';
            }
        }
    } catch (error) {
        console.error("PanelTouchStart error:", error);
        setIsDraggingPanel(false);
    }
  }, [isInfoVisible, isSwiping]);

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY === null || !isDraggingPanel || !panelRef.current) return;
    
    try {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        
        const targetY = calculatePanelY(e.touches[0].clientY - dragStartY);
        
        requestAnimationFrame(() => {
            if (!panelRef.current) return;
            panelRef.current.style.transform = `translateY(${targetY}px)`;
            updateContentVisibility(targetY);
        });
        
        setPanelTranslateY(targetY);
    } catch (error) {
        console.error("PanelTouchMove error:", error);
        setIsDraggingPanel(false);
    }
          {/* Navigation buttons */}
        {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (
            <>
                <button 
                    onClick={handlePrevious} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" 
                    aria-label="Précédent" 
                    style={{ transform: 'translateY(-50%)' }}>
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" 
                    aria-label="Suivant" 
                    style={{ transform: 'translateY(-50%)' }}>
                    <ChevronRight size={24} />
                </button>
            </>
        )}
        
        {/* Pagination indicators */}
        {allVisuals.length > 1 && (
            <div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
                 style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }} 
                 aria-label="Indicateurs" 
                 aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}>
                <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full">
                    {allVisuals.map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setCurrentImageIndex(idx)} 
                            className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} 
                            aria-label={`Image ${idx + 1}`} 
                            aria-current={currentImageIndex === idx ? "step" : undefined} 
                        />
                    ))}
                </div>
            </div>
        )}
        
        {/* Info panel */}
        <div 
            ref={panelRef}
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none"
            style={{
                height: "auto", 
                minHeight: `calc(${GRIP_HEIGHT_COLLAPSED} + 30px)`,
                maxHeight: GRIP_HEIGHT_EXPANDED,
                transform: panelTransform,
                zIndex: 30,
                visibility: 'visible',
                opacity: 1,
            }}
            aria-hidden={!isInfoVisible}
            onTouchStart={handlePanelTouchStart}
            onTouchMove={handlePanelTouchMove}
            onTouchEnd={handlePanelTouchEnd}
        >
            {/* Grip handle */}
            <div ref={gripRef} 
                 className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div>
                <div 
                    className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden" 
                    style={{
                        minHeight: `calc(${GRIP_HEIGHT_COLLAPSED} - 14px)`,
                    }}
                >
                    {!isInfoVisible && (
                        <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">
                            Description
                        </span>
                    )}
                </div>
            </div>
            
            {/* Panel content */}
            <div 
                className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto"
                style={{
                    maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`,
                    display: isInfoVisible ? 'block' : 'none',
                    opacity: isInfoVisible ? 1 : 0,
                    transition: `opacity ${CONTENT_FADE_DURATION}ms ease-out`,
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="space-y-4">
                    {Array.isArray(project.description) ? (
                        project.description.map((p, i) => (
                            <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">{p}</p>
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
                        Visiter le site
                    </a>
                )}
                
                <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div>
            </div>
        </div>
    </div>
  );"use client"

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

// Constants
export const GRIP_HEIGHT_COLLAPSED = '5vh';
export const GRIP_HEIGHT_EXPANDED = '75vh';
export const PANEL_ANIMATION_DURATION = 400;
export const CONTENT_FADE_DURATION = 300;
export const MIN_SWIPE_DISTANCE = 80;

interface ProjectModalMobileProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

export default function ProjectModalMobile({ project, isOpen, onClose }: ProjectModalMobileProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [nextImageStateIndex, setNextImageStateIndex] = useState(allVisuals.length > 1 ? 1 : 0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentTouchX, setCurrentTouchX] = useState<number | null>(null);
  const [swipeRotation, setSwipeRotation] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [panelTranslateY, setPanelTranslateY] = useState<number | null>(null);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const panelInitialY = useRef<number>(0);

  useEffect(() => { setIsMounted(true); }, []);

  const initialCollapsedY = useMemo(() => {
    if (typeof window !== 'undefined' && isMounted) {
      try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        return expandedHeightPx - gripHeightPx;
      } catch (e) { console.error("Error calculating initialCollapsedY", e); return null; }
    } return null;
  }, [isMounted]);

  const prevIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex - 1 + allVisuals.length) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);
  const nextIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex + 1) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);

  useEffect(() => {
      setNextImageStateIndex(nextIndex);
  }, [nextIndex]);

  const resetSwipeState = useCallback(() => {
    setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null);
    setSwipeRotation(0); setIsSwiping(false);
    requestAnimationFrame(() => {
        try {
            if (imageRef.current) {
                imageRef.current.style.transform = 'translateX(0px) rotate(0deg)';
                imageRef.current.style.opacity = '1';
                imageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                imageRef.current.style.transformOrigin = 'center center';
                imageRef.current.style.zIndex = '10';
            }
            if (nextImageRef.current) {
                nextImageRef.current.style.transform = 'scale(0.95) translateY(8px)';
                nextImageRef.current.style.opacity = '0.7';
                nextImageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                nextImageRef.current.style.zIndex = '5';
            }
        } catch (error) { console.error("Swipe reset style error:", error); }
    });
  }, []);

  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex + 1) % allVisuals.length;
    setCurrentImageIndex(newIndex);
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
    setCurrentImageIndex(newIndex);
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  const calculateSwipeAnimation = useCallback((currentX: number, startX: number) => {
      if (!isMounted || !isSwiping) return;
      try {
        const distance = currentX - startX;
        const screenWidth = window.innerWidth;
        const rotationFactor = 0.08; const maxRotation = 20;
        const clampedRotation = Math.max(-maxRotation, Math.min(maxRotation, rotationFactor * distance));
        const opacity = 1 - Math.min(0.5, Math.abs(distance) / (screenWidth * 0.6));
        setSwipeRotation(clampedRotation);

        requestAnimationFrame(() => {
            if (!imageRef.current || !nextImageRef.current) return;
            imageRef.current.style.transform = `translateX(${distance}px) rotate(${clampedRotation}deg)`;
            imageRef.current.style.opacity = opacity.toString();
            imageRef.current.style.transition = 'none';
            imageRef.current.style.transformOrigin = distance > 0 ? 'bottom left' : 'bottom right';
            imageRef.current.style.zIndex = '10';

            const nextProgress = Math.min(1, Math.abs(distance) / (screenWidth * 0.35));
            const nextScale = 0.95 + (0.05 * nextProgress);
            const nextTranslateY = 8 - (8 * nextProgress);
            const nextOpacity = 0.7 + (0.3 * nextProgress);
            nextImageRef.current.style.transform = `scale(${nextScale}) translateY(${nextTranslateY}px)`;
            nextImageRef.current.style.opacity = nextOpacity.toString();
            nextImageRef.current.style.transition = 'none';
            nextImageRef.current.style.zIndex = '5';
       });
    } catch (error) { console.error("Swipe calc error:", error); }
  }, [isSwiping, isMounted]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (panelRef.current?.contains(e.target as Node) || allVisuals.length <= 1 || isDraggingPanel) return;
    try {
        setTouchEnd(null); const startX = e.targetTouches[0].clientX;
        setTouchStart(startX); setCurrentTouchX(startX); setIsSwiping(true);
        if (imageRef.current) imageRef.current.style.transition = 'none';
        if (nextImageRef.current) nextImageRef.current.style.transition = 'none';
    } catch (error) { console.error("TouchStart error:", error); setIsSwiping(false); }
  }, [allVisuals.length, isDraggingPanel]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null || !isSwiping || isDraggingPanel) return;
    try {
        const currentX = e.targetTouches[0].clientX;
        const currentY = e.targetTouches[0].clientY;
        const deltaX = Math.abs(currentX - (currentTouchX ?? currentX));
        const startY = (e.targetTouches[0] as any).startY ?? currentY;
        const deltaY = Math.abs(currentY - startY);
        setCurrentTouchX(currentX);
        if (deltaX > deltaY && deltaX > 5 && e.cancelable) { e.preventDefault(); }
        setTouchEnd(currentX);
        calculateSwipeAnimation(currentX, touchStart);
    } catch (error) { console.error("TouchMove error:", error); resetSwipeState(); }
  }, [touchStart, isSwiping, currentTouchX, calculateSwipeAnimation, resetSwipeState, isDraggingPanel]);

 const onTouchEnd = useCallback(() => {
    if (!touchStart || !isSwiping) { if (!isSwiping) resetSwipeState(); return; }
    const finalDistance = (touchEnd ?? touchStart) - touchStart;
    const isLeftSwipe = finalDistance < -MIN_SWIPE_DISTANCE;
    const isRightSwipe = finalDistance > MIN_SWIPE_DISTANCE;
    setIsSwiping(false);
    try {
        const swipeAnimDuration = 350;
        const transitionCurve = 'cubic-bezier(0.175, 0.885, 0.32, 1.175)';
        const transitionStyle = `transform ${swipeAnimDuration}ms ${transitionCurve}, opacity ${swipeAnimDuration}ms ease-out`;
        if (isLeftSwipe || isRightSwipe) {
            if (imageRef.current) imageRef.current.style.transition = transitionStyle;
            if (nextImageRef.current) nextImageRef.current.style.transition = transitionStyle;
        }
        if (isLeftSwipe) {
            if(imageRef.current) { const finalRotation = -Math.max(15, Math.abs(swipeRotation * 1.2)); imageRef.current.style.transform = `translateX(-120%) rotate(${finalRotation}deg) scale(0.9)`; imageRef.current.style.opacity = '0'; }
            if(nextImageRef.current) { nextImageRef.current.style.transform = 'scale(1) translateY(0px)'; nextImageRef.current.style.opacity = '1'; nextImageRef.current.style.zIndex = '15'; }
            setTimeout(() => { handleNext(); resetSwipeState(); }, swipeAnimDuration);
        } else if (isRightSwipe) {
            if(imageRef.current) { const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.2)); imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.9)`; imageRef.current.style.opacity = '0'; }
            if(nextImageRef.current) { nextImageRef.current.style.transform = 'scale(0.95) translateY(8px)'; nextImageRef.current.style.opacity = '0.7'; }
            setTimeout(() => { handlePrevious(); resetSwipeState(); }, swipeAnimDuration);
        } else { resetSwipeState(); }
    } catch (error) { console.error("TouchEnd error:", error); resetSwipeState(); }
    finally { setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null); }
  }, [ touchStart, touchEnd, isSwiping, swipeRotation, MIN_SWIPE_DISTANCE, handleNext, handlePrevious, resetSwipeState ]);

  const calculatePanelY = useCallback((deltaY: number): number => {
      if(!isMounted) return 0;
      try {
        const initialPos = panelInitialY.current; let newY = initialPos + deltaY;
        const vh = window.innerHeight; const gripH = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedH = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const collapsedY = expandedH - gripH; const expandedY = 0;
        const minY = expandedY - 50; const maxY = collapsedY + 50;
        return Math.max(minY, Math.min(maxY, newY));
      } catch (error) { console.error("Panel Y calc error:", error); return panelInitialY.current; }
  }, [isMounted]);

  const updateContentVisibility = useCallback((currentY: number | null) => {
    if (currentY === null || !panelRef.current) return;
     try {
        const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement; if (!contentElement) return;
        const vh = window.innerHeight; const gripH = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedH = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const collapsedY = expandedH - gripH; const expandedY = 0;
        const totalTravel = collapsedY - expandedY; if (totalTravel <= 0) return;
        const progress = Math.max(0, Math.min(1, (currentY - expandedY) / totalTravel));
        const opacity = 1 - progress;
        contentElement.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
        if (opacity > 0) contentElement.style.display = 'block';
     } catch(error) { console.error("Content visibility error", error)}
  }, []);

  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    if (isSwiping) return;
    const target = e.target as Node;
    const panelContent = panelRef.current?.querySelector('.panel-content');
    const isTouchingScrollableContent = panelContent?.contains(target) && isInfoVisible && panelContent.scrollHeight > panelContent.clientHeight;
    if (isTouchingScrollableContent) { setIsDraggingPanel(false); return; }
    try {
        e.stopPropagation(); setDragStartY(e.touches[0].clientY); setIsDraggingPanel(true);
        if (panelRef.current) {
            panelRef.current.style.transition = 'none';
            const style = window.getComputedStyle(panelRef.current);
            const matrix = new DOMMatrix(style.transform === 'none' ? '' : style.transform);
            panelInitialY.current = matrix.m42; setPanelTranslateY(panelInitialY.current);
            if (!isInfoVisible && panelContent) { (panelContent as HTMLElement).style.display = 'block'; }
        }
    } catch (error) { console.error("PanelTouchStart error:", error); setIsDraggingPanel(false); }
  }, [isInfoVisible, isSwiping]);

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY === null || !isDraggingPanel || !panelRef.current) return;
    try {
        e.stopPropagation(); if (e.cancelable) e.preventDefault();
        const targetY = calculatePanelY(e.touches[0].clientY - dragStartY);
        requestAnimationFrame(() => {
             if (!panelRef.current) return;
             panelRef.current.style.transform = `translateY(${targetY}px)`;
             updateContentVisibility(targetY);
         });
        setPanelTranslateY(targetY);
    } catch (error) { console.error("PanelTouchMove error:", error); setIsDraggingPanel(false); }
  }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);

  const handlePanelTouchEnd = useCallback(() => {
    if (dragStartY === null || !isDraggingPanel || panelTranslateY === null || !panelRef.current) return;
    
    setIsDraggingPanel(false);
    
    const deltaY = panelTranslateY - panelInitialY.current;
    const threshold = 60; // Nombre de pixels pour déclencher le changement d'état
    
    try {
        const vh = window.innerHeight;
        const gripH = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedH = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        
        const collapsedY = expandedH - gripH;
        const expandedY = 0;
        
        // Déterminer si le panneau devrait être ouvert ou fermé
        let shouldBeVisible: boolean;
        if (isInfoVisible) {
            shouldBeVisible = deltaY <= threshold; // Si déjà ouvert, rester ouvert sauf si tiré suffisamment vers le bas
        } else {
            shouldBeVisible = deltaY < -threshold; // Si fermé, ouvrir seulement si tiré suffisamment vers le haut
        }
        
        const targetY = shouldBeVisible ? expandedY : collapsedY;
        
        // Animer le panneau vers sa position finale
        panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        panelRef.current.style.transform = `translateY(${targetY}px)`;
        
        setPanelTranslateY(targetY);
        setIsInfoVisible(shouldBeVisible);
        
        // Gérer l'affichage du contenu
        const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
        if (contentElement) {
            contentElement.style.transition = `opacity ${CONTENT_FADE_DURATION}ms ease-out`;
            
            if (shouldBeVisible) {
                contentElement.style.display = 'block';
                requestAnimationFrame(() => {
                    contentElement.style.opacity = '1';
                });
            } else {
                contentElement.style.opacity = '0';
                setTimeout(() => {
                    if (!isInfoVisible) {
                        contentElement.style.display = 'none';
                    }
                }, CONTENT_FADE_DURATION + 50);
            }
        }
    } catch (error) {
        console.error("PanelTouchEnd error:", error);
    } finally {
        setDragStartY(null);
    }
  }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);

  // --- EFFECTS ---
  
  // Initier le panneau lorsque le modal est ouvert
  useEffect(() => {
    console.log("Effect triggered for panelTranslateY setting, isOpen:", isOpen, "isMounted:", isMounted, "initialCollapsedY:", initialCollapsedY);
    
    if (isOpen && isMounted && initialCollapsedY !== null) {
        console.log("ProjectModalMobile EFFECT[isOpen, initialCollapsedY]: Setting panelTranslateY to initialCollapsedY:", initialCollapsedY);
        setPanelTranslateY(initialCollapsedY);
        
        // S'assurer que le panneau est visible avec une position définie avant l'animation
        if (panelRef.current) {
            panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
            panelRef.current.style.visibility = 'visible'; // <-- Important, le rendre explicitement visible
            
            requestAnimationFrame(() => {
                if (panelRef.current) {
                    panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
                }
            });
        }
    } else if (!isOpen) {
        console.log("ProjectModalMobile EFFECT[isOpen]: Resetting panelTranslateY (isOpen false or other conditions not met)");
        setPanelTranslateY(null);
        setIsInfoVisible(false);
        
        if (panelRef.current) {
            panelRef.current.style.transition = 'none';
        }
    }
  }, [isOpen, isMounted, initialCollapsedY]);

  // Réinitialiser lorsqu'un nouveau projet est affiché
  useEffect(() => {
    if (isOpen) {
        console.log("ProjectModalMobile EFFECT[project, isOpen]: Resetting for new project or open");
        setCurrentImageIndex(0);
        resetSwipeState();
        setImagesLoaded({});
        setIsInfoVisible(false);
        
        if (isMounted && initialCollapsedY !== null) {
            console.log("ProjectModalMobile EFFECT[project, isOpen]: Resetting panelTranslateY to initialCollapsedY:", initialCollapsedY);
            setPanelTranslateY(initialCollapsedY);
            
            // S'assurer que le panneau est correctement positionné
            if (panelRef.current) {
                panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
                panelRef.current.style.visibility = 'visible';
            }
        }
    }
  }, [project, isOpen, isMounted, initialCollapsedY, allVisuals.length, resetSwipeState]);

  // Précharger les images
  useEffect(() => {
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    
    const preloadImage = (src: string): Promise<void> => {
        if (imagesLoaded[src]) return Promise.resolve();
        
        return new Promise((resolve) => {
            if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
                resolve();
                return;
            }
            
            const img = new window.Image();
            img.onload = () => {
                setImagesLoaded(prev => ({ ...prev, [src]: true }));
                resolve();
            };
            img.onerror = () => {
                console.error(`Preload error: ${src}`);
                resolve();
            };
            img.src = src;
        });
    };
    
    const preloadAllImages = async () => {
        try {
            const priorityIndices = [...new Set([currentImageIndex, nextIndex, prevIndex])];
            await Promise.all(
                priorityIndices.map(idx => 
                    allVisuals[idx] ? preloadImage(allVisuals[idx]) : Promise.resolve()
                )
            );
            
            // Précharger les autres images en arrière-plan
            const otherImages = allVisuals.filter((_, i) => !priorityIndices.includes(i));
            Promise.all(
                otherImages.map(src => 
                    src ? preloadImage(src) : Promise.resolve()
                )
            );
        } catch (error) {
            console.error("Preload error:", error);
        }
    };
    
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);

  // Empêcher le défilement du document pendant le modal
  useEffect(() => {
    if (!isMounted || !isOpen) return;
    
    const preventDocumentScroll = (e: TouchEvent) => {
        try {
            const target = e.target as Node;
            const panelContent = panelRef.current?.querySelector('.panel-content');
            
            // Permettre le défilement à l'intérieur du contenu du panneau
            if (isInfoVisible && 
                panelContent?.contains(target) && 
                panelContent.scrollHeight > panelContent.clientHeight) {
                return true;
            }
            
            // Empêcher tout autre défilement de page
            if (e.cancelable) e.preventDefault();
        } catch (error) {
            console.error("Scroll prevention error:", error);
        }
    };
    
    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    
    return () => document.removeEventListener('touchmove', preventDocumentScroll);
  }, [isOpen, isInfoVisible, isMounted]);

  // Support pour les touches clavier (pour les tests sur desktop)
  useEffect(() => {
    if (!isOpen || !isMounted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMounted, handleNext, handlePrevious]);

  // Réinitialiser les positions des références d'images quand currentImageIndex change
  useEffect(() => {
    if (!isOpen || !isMounted) return;
    
    // Réinitialiser les positions après un changement d'index
    if (currentImageRef.current) {
      currentImageRef.current.style.transform = 'translateX(0)';
      currentImageRef.current.style.opacity = '1';
      currentImageRef.current.style.transition = 'none';
    }
    
    if (nextImageRef.current) {
      nextImageRef.current.style.transform = 'translateX(100%)';
      nextImageRef.current.style.opacity = '0';
      nextImageRef.current.style.transition = 'none';
    }
    
    if (prevImageRef.current) {
      prevImageRef.current.style.transform = 'translateX(-100%)';
      prevImageRef.current.style.opacity = '0';
      prevImageRef.current.style.transition = 'none';
    }
    
    // Ajouter une transition après le premier rendu
    requestAnimationFrame(() => {
      const transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      if (currentImageRef.current) currentImageRef.current.style.transition = transition;
      if (nextImageRef.current) nextImageRef.current.style.transition = transition;
      if (prevImageRef.current) prevImageRef.current.style.transition = transition;
    });
  }, [isOpen, isMounted, currentImageIndex]);

  // RENDER FALLBACK
  if (!isMounted) {
    if (!isOpen) return null;
    console.log("ProjectModalMobile RENDER: Not mounted, showing fallback for open modal");
    return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
  }
  
  if (!isOpen) {
    console.log("ProjectModalMobile RENDER: Not open, returning null");
    return null;
  }

  // Hauteur visible du grip lorsque le panneau est replié
  const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED} + 0px)`;
  
  // Déterminer la transformation pour le panneau
  const fallbackTranslateY = `calc(100vh - ${GRIP_HEIGHT_COLLAPSED} - 12px)`;
  const panelTransformValue = panelTranslateY !== null 
    ? panelTranslateY 
    : (initialCollapsedY !== null 
        ? initialCollapsedY 
        : fallbackTranslateY);
  
  const panelTransform = typeof panelTransformValue === 'number' 
    ? `translateY(${panelTransformValue}px)` 
    : `translateY(${panelTransformValue})`;
  
  console.log("ProjectModalMobile RENDER: panelTranslateY =", panelTranslateY, "initialCollapsedY =", initialCollapsedY, "panelTransform =", panelTransform);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none" 
         ref={modalRef} 
         role="dialog" 
         aria-modal="true" 
         aria-labelledby={isInfoVisible ? undefined : `modal-title-${project.id}`}>
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
            <button onClick={onClose} 
                   className="text-gray-700 rounded-full p-2 active:bg-gray-200 shrink-0" 
                   aria-label="Fermer">
                <X size={24} />
            </button>
            <h2 id={`modal-title-${project.id}`} 
                className="flex-1 text-center text-black text-[1.6rem] font-poppins font-medium truncate mx-4">
                {project.title}
            </h2>
            <div className="w-8 h-8 shrink-0"></div>
        </div>
        
        {/* Image container */}
        <div className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden" 
             style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
            
            {/* Précédente image (pour le swipe) */}
            {allVisuals.length > 1 && allVisuals[prevIndex] && (
                <div ref={prevImageRef}
                     className="absolute inset-0 flex items-center justify-center will-change-transform"
                     style={{
                         transform: 'translateX(-100%)',
                         opacity: 0,
                         zIndex: 5
                     }}>
                    <Image
                        key={`prev-${allVisuals[prevIndex]}`}
                        src={allVisuals[prevIndex]}
                        alt="Image précédente"
                        fill
                        className="object-contain"
                        sizes="100vw"
                        loading="lazy"
                    />
                </div>
            )}
            
            {/* Image actuelle */}
            <div ref={currentImageRef}
                 className="absolute inset-0 flex items-center justify-center will-change-transform"
                 style={{
                     transform: 'translateX(0)',
                     opacity: 1,
                     zIndex: 10
                 }}>
                {allVisuals[currentImageIndex] && (
                    <Image
                        key={`current-${allVisuals[currentImageIndex]}`}
                        src={allVisuals[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority={true}
                    />
                )}
            </div>
            
            {/* Prochaine image (pour le swipe) */}
            {allVisuals.length > 1 && allVisuals[nextIndex] && (
                <div ref={nextImageRef}
                     className="absolute inset-0 flex items-center justify-center will-change-transform"
                     style={{
                         transform: 'translateX(100%)',
                         opacity: 0,
                         zIndex: 5
                     }}>
                    <Image
                        key={`next-${allVisuals[nextIndex]}`}
                        src={allVisuals[nextIndex]}
                        alt="Image suivante"
                        fill
                        className="object-contain"
                        sizes="100vw"
                        loading="lazy"
                    />
                </div>
            )}
        </div>
        
        {/* Navigation buttons */}
        {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (
            <>
                <button 
                    onClick={handlePrevious} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" 
                    aria-label="Précédent" 
                    style={{ transform: 'translateY(-50%)' }}>
                    <ChevronLeft size={24} />
                </button>
                <button 
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" 
                    aria-label="Suivant" 
                    style={{ transform: 'translateY(-50%)' }}>
                    <ChevronRight size={24} />
                </button>
            </>
        )}
        
        {/* Pagination indicators */}
        {allVisuals.length > 1 && (
            <div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
                 style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }} 
                 aria-label="Indicateurs" 
                 aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}>
                <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full">
                    {allVisuals.map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setCurrentImageIndex(idx)} 
                            className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} 
                            aria-label={`Image ${idx + 1}`} 
                            aria-current={currentImageIndex === idx ? "step" : undefined} 
                        />
                    ))}
                </div>
            </div>
        )}
        
        {/* Info panel */}
        <div 
            ref={panelRef}
            className="absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none"
            style={{
                height: "auto", 
                minHeight: `calc(${GRIP_HEIGHT_COLLAPSED} + 30px)`,
                maxHeight: GRIP_HEIGHT_EXPANDED,
                transform: panelTransform,
                zIndex: 30,
                visibility: 'visible',
                opacity: 1,
            }}
            aria-hidden={!isInfoVisible}
            onTouchStart={handlePanelTouchStart}
            onTouchMove={handlePanelTouchMove}
            onTouchEnd={handlePanelTouchEnd}
        >
            {/* Grip handle */}
            <div ref={gripRef} 
                 className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div>
                <div 
                    className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden" 
                    style={{
                        minHeight: `calc(${GRIP_HEIGHT_COLLAPSED} - 14px)`,
                    }}
                >
                    {!isInfoVisible && (
                        <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">
                            Description
                        </span>
                    )}
                </div>
            </div>
            
            {/* Panel content */}
            <div 
                className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto"
                style={{
                    maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`,
                    display: isInfoVisible ? 'block' : 'none',
                    opacity: isInfoVisible ? 1 : 0,
                    transition: `opacity ${CONTENT_FADE_DURATION}ms ease-out`,
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <div className="space-y-4">
                    {Array.isArray(project.description) ? (
                        project.description.map((p, i) => (
                            <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">{p}</p>
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
                        Visiter le site
                    </a>
                )}
                
                <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div>
            </div>
        </div>
    </div>
  );
}

  const handlePanelTouchEnd = useCallback(() => {
    if (dragStartY === null || !isDraggingPanel || panelTranslateY === null || !panelRef.current) return;
    setIsDraggingPanel(false); const deltaY = panelTranslateY - panelInitialY.current; const threshold = 60;
    try {
        const vh = window.innerHeight; const gripH = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedH = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const collapsedY = expandedH - gripH; const expandedY = 0;
        let targetY: number; let shouldBeVisible: boolean;
        if (isInfoVisible) shouldBeVisible = deltaY <= threshold; else shouldBeVisible = deltaY < -threshold;
        targetY = shouldBeVisible ? expandedY : collapsedY;
        panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        panelRef.current.style.transform = `translateY(${targetY}px)`;
        setPanelTranslateY(targetY); setIsInfoVisible(shouldBeVisible);
        const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
        if (contentElement) {
            contentElement.style.transition = `opacity ${CONTENT_FADE_DURATION}ms ease-out`;
            if (shouldBeVisible) {
                contentElement.style.display = 'block'; requestAnimationFrame(() => { contentElement.style.opacity = '1'; });
            } else {
                contentElement.style.opacity = '0';
                setTimeout(() => { if (!isInfoVisible) contentElement.style.display = 'none'; }, CONTENT_FADE_DURATION + 50);
            }
        }
    } catch (error) { console.error("PanelTouchEnd error:", error); }
    finally { setDragStartY(null); }
  }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);

  // --- EFFECTS ---
  useEffect(() => {
    if (isOpen && isMounted && initialCollapsedY !== null) {
        setPanelTranslateY(initialCollapsedY);
        requestAnimationFrame(() => {
            if (panelRef.current) panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        });
    } else if (!isOpen) {
        setPanelTranslateY(null); setIsInfoVisible(false);
        if (panelRef.current) panelRef.current.style.transition = 'none';
    }
  }, [isOpen, isMounted, initialCollapsedY]);

  useEffect(() => {
    if (isOpen) {
        const newNextIndexState = allVisuals.length > 1 ? 1 : 0;
        setCurrentImageIndex(0); setNextImageStateIndex(newNextIndexState);
        resetSwipeState(); setImagesLoaded({}); setIsInfoVisible(false);
        if(isMounted && initialCollapsedY !== null) { setPanelTranslateY(initialCollapsedY); }
    }
  }, [project, isOpen, isMounted, initialCollapsedY, allVisuals.length, resetSwipeState]);

  useEffect(() => {
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    const preloadImage = (src: string): Promise<void> => {
        if (imagesLoaded[src]) return Promise.resolve();
        return new Promise((resolve) => {
            if (typeof window === 'undefined' || typeof window.Image === 'undefined') { resolve(); return; }
            const img = new window.Image();
            img.onload = () => { setImagesLoaded(prev => ({ ...prev, [src]: true })); resolve(); };
            img.onerror = () => { console.error(`Preload error: ${src}`); resolve(); };
            img.src = src;
        });
    };
    const preloadAllImages = async () => {
        try {
            // Utilise prevIndex et nextIndex (les constantes useMemo) pour le preloading
            const priorityIndices = [...new Set([currentImageIndex, nextIndex, prevIndex])];
            await Promise.all(priorityIndices.map(idx => allVisuals[idx] ? preloadImage(allVisuals[idx]) : Promise.resolve()));
            const otherImages = allVisuals.filter((_, i) => !priorityIndices.includes(i));
            Promise.all(otherImages.map(src => src ? preloadImage(src) : Promise.resolve()));
        } catch (error) { console.error("Preload error:", error); }
    };
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);

  useEffect(() => {
    if (!isMounted || !isOpen) return;
    const preventDocumentScroll = (e: TouchEvent) => {
        try {
            const target = e.target as Node;
            const panelContent = panelRef.current?.querySelector('.panel-content');
            if (isInfoVisible && panelContent?.contains(target) && panelContent.scrollHeight > panelContent.clientHeight) { return true; }
            if (e.cancelable) e.preventDefault();
        } catch (error) { console.error("Scroll prevention error:", error); }
    };
    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventDocumentScroll);
  }, [isOpen, isInfoVisible, isMounted]);

  // --- RENDER FALLBACK ---
  if (!isMounted) {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
  }
  if (!isOpen) return null;

  const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED} + 0px)`;
  const panelTransform = panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : 'translateY(100%)';

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={isInfoVisible ? undefined : `modal-title-${project.id}`}>
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
            <button onClick={onClose} className="text-gray-700 rounded-full p-2 active:bg-gray-200 shrink-0" aria-label="Fermer"><X size={24} /></button>
            <h2 id={`modal-title-${project.id}`} className="flex-1 text-center text-black text-[1.6rem] font-poppins font-medium truncate mx-4">{project.title}</h2>
            <div className="w-8 h-8 shrink-0"></div>
        </div>
        <div className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden" style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {allVisuals.length > 1 && (<div ref={nextImageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ transform: 'scale(0.95) translateY(8px)', opacity: 0.7, zIndex: 5, }}> {allVisuals[nextImageStateIndex] && (<Image key={allVisuals[nextImageStateIndex]} src={allVisuals[nextImageStateIndex]} alt={`Aperçu ${nextImageStateIndex + 1}`} fill className="object-contain" sizes="100vw" loading="lazy" />)} </div>)}
            <div ref={imageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ zIndex: 10 }}> {allVisuals[currentImageIndex] && (<Image key={allVisuals[currentImageIndex]} src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1}`} fill className="object-contain" sizes="100vw" priority={true} />)} </div>
        </div>
        {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (<> <button onClick={() => { handlePrevious(); setTimeout(resetSwipeState,0); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Précédent" style={{ transform: 'translateY(-50%)' }}> <ChevronLeft size={24} /> </button> <button onClick={() => { handleNext(); setTimeout(resetSwipeState,0);}} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Suivant" style={{ transform: 'translateY(-50%)' }}> <ChevronRight size={24} /> </button> </>)}
        {allVisuals.length > 1 && (<div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }} aria-label="Indicateurs" aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}> <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full"> {allVisuals.map((_, idx) => (<button key={idx} onClick={() => { setCurrentImageIndex(idx); setTimeout(resetSwipeState,0); }} className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined} />))} </div> </div>)}
        <div ref={panelRef} className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none`} style={{ height: GRIP_HEIGHT_EXPANDED, maxHeight: GRIP_HEIGHT_EXPANDED, transform: panelTransform, zIndex: 30, }} aria-hidden={!isInfoVisible} onTouchStart={handlePanelTouchStart} onTouchMove={handlePanelTouchMove} onTouchEnd={handlePanelTouchEnd} >
            <div ref={gripRef} className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none"> <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div> <div className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden min-h-[calc(${GRIP_HEIGHT_COLLAPSED}-30px)]"> {!isInfoVisible && ( <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">Description</span> )} </div> </div>
            <div className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto" style={{ height: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, display: 'block', opacity: isInfoVisible ? 1 : 0, transition: `opacity ${CONTENT_FADE_DURATION}ms ease-out`, WebkitOverflowScrolling: 'touch', }}> <div className="space-y-4"> {Array.isArray(project.description) ? ( project.description.map((p, i) => <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">{p}</p>)) : (<p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>)} </div> {project.link && (<a href={project.link} target="_blank" rel="noopener noreferrer" className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium">Visiter le site</a>)} <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div> </div>
        </div>
    </div>
  );
}