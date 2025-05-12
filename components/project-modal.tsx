// project-modal.tsx - Version Complète avec Améliorations Mobile
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
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

// --- CONSTANTES DE STYLE ---
const GRIP_HEIGHT_COLLAPSED = '5vh'; // Hauteur réduite
const GRIP_HEIGHT_EXPANDED = '75vh'; // Hauteur max dépliée (peut rester)
const PANEL_ANIMATION_DURATION = 400;
const CONTENT_FADE_DURATION = 300;
const minSwipeDistance = 80;

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  // --- STATES ---
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals], [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [nextImageIndex, setNextImageIndex] = useState(allVisuals.length > 1 ? 1 : 0);
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

  // --- REFS ---
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null); // Gardé pour référence mais handlers déplacés
  const imageColumnRef = useRef<HTMLDivElement>(null);
  const descriptionColumnRef = useRef<HTMLDivElement>(null);
  const panelInitialY = useRef<number>(0);

  // --- HOOKS ---
  const isMobile = useIsMobile();

  // --- LIFECYCLE & HELPERS ---
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

  // --- CALLBACKS (Memoized Functions) ---

  const resetSwipeState = useCallback(() => {
    setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null);
    setSwipeRotation(0); setIsSwiping(false);
    requestAnimationFrame(() => { // Reset styles visually
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
    setNextImageIndex((newIndex + 1) % allVisuals.length);
    // Reset est appelé séparément via setTimeout(0) après l'appel
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
    setCurrentImageIndex(newIndex);
    setNextImageIndex((newIndex + 1) % allVisuals.length);
    // Reset est appelé séparément via setTimeout(0) après l'appel
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  const calculateSwipeAnimation = useCallback((currentX: number, startX: number) => {
      if (!isMounted || !isSwiping) return;
      try { /* (Logic as before, animating imageRef and nextImageRef) */
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
    // Ne pas démarrer le swipe si on touche le panneau ou s'il n'y a qu'une image
    if (panelRef.current?.contains(e.target as Node) || allVisuals.length <= 1) return;
    // Également, ne pas démarrer le swipe d'image si on drague déjà le panneau
    if (isDraggingPanel) return;
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
    const isLeftSwipe = finalDistance < -minSwipeDistance;
    const isRightSwipe = finalDistance > minSwipeDistance;

    // Set isSwiping false but keep other states for animation logic
    setIsSwiping(false);

    try {
        const swipeAnimDuration = 350;
        const transitionCurve = 'cubic-bezier(0.175, 0.885, 0.32, 1.175)';
        const transitionStyle = `transform ${swipeAnimDuration}ms ${transitionCurve}, opacity ${swipeAnimDuration}ms ease-out`;

        // Apply transition only if an animation will occur
        if (isLeftSwipe || isRightSwipe) {
            if (imageRef.current) imageRef.current.style.transition = transitionStyle;
            if (nextImageRef.current) nextImageRef.current.style.transition = transitionStyle;
        }

        if (isLeftSwipe) {
            if(imageRef.current) {
                const finalRotation = -Math.max(15, Math.abs(swipeRotation * 1.2));
                imageRef.current.style.transform = `translateX(-120%) rotate(${finalRotation}deg) scale(0.9)`;
                imageRef.current.style.opacity = '0';
            }
            if(nextImageRef.current) {
                 nextImageRef.current.style.transform = 'scale(1) translateY(0px)';
                 nextImageRef.current.style.opacity = '1';
                 nextImageRef.current.style.zIndex = '15';
            }
            // Update state first, then reset styles after animation
            setTimeout(() => {
                handleNext(); // Met à jour l'index
                // resetSwipeState doit s'appliquer à la *nouvelle* image à l'index mis à jour
                // L'appel à resetSwipeState à l'intérieur de ce timeout est correct
                resetSwipeState();
            }, swipeAnimDuration);
        } else if (isRightSwipe) {
            if(imageRef.current) {
                const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.2));
                imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.9)`;
                imageRef.current.style.opacity = '0';
            }
            if(nextImageRef.current) { // Reset next image style
                 nextImageRef.current.style.transform = 'scale(0.95) translateY(8px)';
                 nextImageRef.current.style.opacity = '0.7';
            }
            setTimeout(() => {
                handlePrevious(); // Met à jour l'index
                resetSwipeState(); // Reset après mise à jour
            }, swipeAnimDuration);
        } else {
            // Pas assez de swipe, réinitialiser immédiatement les styles avec animation
            resetSwipeState();
        }
    } catch (error) { console.error("TouchEnd error:", error); resetSwipeState(); }
    finally {
        // Réinitialiser les états de suivi de toucher
        setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null);
        // isSwiping déjà mis à false
    }
  }, [ touchStart, touchEnd, isSwiping, swipeRotation, minSwipeDistance, handleNext, handlePrevious, resetSwipeState ]);

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
    if (isSwiping) return; // Ne pas démarrer le drag du panneau si on swipe l'image

    const target = e.target as Node;
    const panelContent = panelRef.current?.querySelector('.panel-content');
    const isTouchingScrollableContent = panelContent?.contains(target) && isInfoVisible && panelContent.scrollHeight > panelContent.clientHeight;

    // Si on touche le contenu scrollable, ne pas initier le drag du panneau
    if (isTouchingScrollableContent) {
        setIsDraggingPanel(false); // Assure que le drag est désactivé
        return;
    }

    // Sinon, initier le drag du panneau
    try {
        e.stopPropagation(); // Empêche le swipe d'image si on grab le panneau
        setDragStartY(e.touches[0].clientY);
        setIsDraggingPanel(true);
        if (panelRef.current) {
            panelRef.current.style.transition = 'none';
            const style = window.getComputedStyle(panelRef.current);
            const matrix = new DOMMatrix(style.transform === 'none' ? '' : style.transform);
            panelInitialY.current = matrix.m42; // Stocke la position Y actuelle
            setPanelTranslateY(panelInitialY.current); // Synchronise l'état

            // Assure que le contenu est visible (display: block) au début du drag si on ouvre
            if (!isInfoVisible && panelContent) { (panelContent as HTMLElement).style.display = 'block'; }
        }
    } catch (error) { console.error("PanelTouchStart error:", error); setIsDraggingPanel(false); }
  }, [isInfoVisible, isSwiping]); // Dépendances

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY === null || !isDraggingPanel || !panelRef.current) return;
    try {
        e.stopPropagation(); if (e.cancelable) e.preventDefault(); // Empêche le scroll de la page
        const targetY = calculatePanelY(e.touches[0].clientY - dragStartY);
        requestAnimationFrame(() => { // Applique le transform via rAF
             if (!panelRef.current) return;
             panelRef.current.style.transform = `translateY(${targetY}px)`;
             updateContentVisibility(targetY); // Met à jour l'opacité en même temps
         });
        setPanelTranslateY(targetY); // Met à jour l'état (peut léger décalage visuel)
    } catch (error) { console.error("PanelTouchMove error:", error); setIsDraggingPanel(false); }
  }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);

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
                contentElement.style.display = 'block';
                requestAnimationFrame(() => { contentElement.style.opacity = '1'; });
            } else {
                contentElement.style.opacity = '0';
                setTimeout(() => { if (!isInfoVisible) contentElement.style.display = 'none'; }, CONTENT_FADE_DURATION + 50);
            }
        }
    } catch (error) { console.error("PanelTouchEnd error:", error); }
    finally { setDragStartY(null); }
  }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);


  // --- EFFECTS (Autres) ---
  useEffect(() => { /* Preloading */ }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);
  useEffect(() => { /* Desktop Height Sync */ }, [isOpen, isMobile, currentImageIndex, isMounted]);
  useEffect(() => { /* Prevent Background Scroll */ }, [isOpen, isMobile, isInfoVisible, isMounted]);
  useEffect(() => { /* Desktop Click Outside */ }, [isOpen, onClose, isMobile, isMounted]);
  useEffect(() => { /* Desktop Keyboard Nav Listener */ }, [isMobile, isOpen, handleKeyDown, isMounted]);


   // --- RENDER FALLBACK ---
   if (!isMounted) {
     if (!isOpen) return null;
     return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
   }
   if (!isOpen) return null;


  // --- RENDER ---
  if (isMobile) {
    const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED} + 0px)`;
    const panelTransform = panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : 'translateY(100%)'; // Fallback

    return (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={isInfoVisible ? undefined : `modal-title-${project.id}`}>
            {/* Top Bar AVEC TITRE */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
                <button onClick={onClose} className="text-gray-700 rounded-full p-2 active:bg-gray-200 shrink-0" aria-label="Fermer"><X size={24} /></button>
                {/* Titre centré */}
                <h2 id={`modal-title-${project.id}`} className="flex-1 text-center text-black text-[1.6rem] font-poppins font-medium truncate mx-4">
                    {project.title}
                </h2>
                {/* Spacer invisible pour équilibrer le bouton fermer */}
                <div className="w-8 h-8 shrink-0"></div>
            </div>

            {/* Image Stack */}
            <div className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden" style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                {/* Next Image */}
                {allVisuals.length > 1 && (<div ref={nextImageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ transform: 'scale(0.95) translateY(8px)', opacity: 0.7, zIndex: 5, }}> {allVisuals[nextIndex] && (<Image key={allVisuals[nextIndex]} src={allVisuals[nextIndex]} alt={`Aperçu image ${nextIndex + 1}`} fill className="object-contain" sizes="100vw" loading="lazy" />)} </div>)}
                {/* Current Image */}
                <div ref={imageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ zIndex: 10 }}> {allVisuals[currentImageIndex] && (<Image key={allVisuals[currentImageIndex]} src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} fill className="object-contain" sizes="100vw" priority={true} />)} </div>
            </div>

            {/* Nav Buttons */}
            {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (<> <button onClick={() => { handlePrevious(); setTimeout(resetSwipeState,0); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Image précédente" style={{ transform: 'translateY(-50%)' }}> <ChevronLeft size={24} /> </button> <button onClick={() => { handleNext(); setTimeout(resetSwipeState,0);}} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Image suivante" style={{ transform: 'translateY(-50%)' }}> <ChevronRight size={24} /> </button> </>)}

             {/* Pagination Dots */}
             {allVisuals.length > 1 && (<div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }} aria-label="Indicateurs d'images" aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}> <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full"> {allVisuals.map((_, idx) => (<button key={idx} onClick={() => { setCurrentImageIndex(idx); setNextImageIndex((idx + 1) % allVisuals.length); setTimeout(resetSwipeState,0); }} className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Aller à l'image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined} />))} </div> </div>)}

            {/* Info Panel - Handlers déplacés ici */}
            <div
              ref={panelRef}
              className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none`} // Moins arrondi, ajout cursor/touch-none
              style={{ height: GRIP_HEIGHT_EXPANDED, maxHeight: GRIP_HEIGHT_EXPANDED, transform: panelTransform, zIndex: 30, }}
              aria-hidden={!isInfoVisible}
              onTouchStart={handlePanelTouchStart}
              onTouchMove={handlePanelTouchMove}
              onTouchEnd={handlePanelTouchEnd}
             >
                 {/* Grip Handle Visuel (sans handlers) */}
                <div ref={gripRef} className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none"> {/* pointer-events-none ici */}
                    <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div>
                     {/* Texte conditionnel "DESCRIPTION" ou rien */}
                    <div className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden min-h-[calc(${GRIP_HEIGHT_COLLAPSED}-30px)]"> {/* Ajuste min-height */}
                         {!isInfoVisible && ( // Affiche "DESCRIPTION" seulement si fermé
                             <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">Description</span>
                         )}
                         {/* Le titre du projet est maintenant en haut, plus besoin ici */}
                     </div>
                 </div>
                 {/* Panel Content (reste interactif pour le scroll) */}
                <div className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto" // Permet les events ici
                     style={{ height: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, display: 'block', // Toujours 'block' pour mesurer scrollHeight
                             opacity: isInfoVisible ? 1 : 0, // Contrôle la visibilité réelle
                             transition: `opacity ${CONTENT_FADE_DURATION}ms ease-out`, // Transition pour le contenu
                             WebkitOverflowScrolling: 'touch',
                           }}
                 >
                     <div className="space-y-4">
                      {Array.isArray(project.description) ? ( project.description.map((p, i) => <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">{p}</p>))
                                                       : (<p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>)}
                     </div>
                     {project.link && (<a href={project.link} target="_blank" rel="noopener noreferrer" className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium">Visiter le site du projet</a>)}
                     <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div>
                 </div>
            </div>
        </div>
    );
  } else {
     // --- DESKTOP VERSION ---
     // (JSX Desktop comme avant, avec les appels à resetSwipeState dans les onClick)
     return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 transition-opacity duration-300" style={{ opacity: isAnimating ? 1 : 0 }} role="dialog" aria-modal="true" aria-labelledby={`modal-title-${project.id}`} >
             <div ref={modalRef} className="bg-white w-full max-w-5xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl" style={{ transform: isAnimating ? 'scale(1)' : 'scale(0.95)', opacity: isAnimating ? 1 : 0 }} >
               {/* Left Column */}
               <div className="w-full md:w-1/2 relative" ref={imageColumnRef}>
                 <div className="relative" style={{ aspectRatio: '4/5' }}>
                   {allVisuals[currentImageIndex] && ( <Image src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" priority={currentImageIndex === 0} key={allVisuals[currentImageIndex]} /> )}
                   {allVisuals.length > 1 && ( <> <button onClick={() => {handlePrevious(); setTimeout(resetSwipeState, 0);}} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" aria-label="Image précédente"> <ChevronLeft size={20} /> </button> <button onClick={() => {handleNext(); setTimeout(resetSwipeState, 0);}} className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" aria-label="Image suivante"> <ChevronRight size={20} /> </button> </> )}
                   {allVisuals.length > 1 && ( <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center" > <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full"> {allVisuals.map((_, index) => ( <button key={index} onClick={() => {setCurrentImageIndex(index); setNextImageIndex((index + 1) % allVisuals.length); setTimeout(resetSwipeState,0);}} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`} aria-label={`Aller à l'image ${index + 1}`} aria-current={currentImageIndex === index ? "step" : undefined} /> ))} </div> </div> )}
                 </div>
               </div>
               {/* Right Column */}
               <div className="w-full md:w-1/2 p-8 overflow-y-auto" ref={descriptionColumnRef} >
                 <h2 id={`modal-title-${project.id}`} className="font-great-vibes text-2xl md:text-3xl font-medium mb-4" > {project.title} </h2>
                 <div className="font-poppins text-base text-gray-700 leading-relaxed"> {Array.isArray(project.description) ? ( project.description.map((p, i)=><p key={i} className="mb-4 last:mb-0">{p}</p>)) : (<p>{project.description}</p>)} </div>
                 {project.link && ( <a href={project.link} target="_blank" rel="noopener noreferrer" className="font-poppins block mt-6 text-primary-blue hover:underline" > Visiter le site du projet </a> )}
               </div>
               {/* Close Button */}
               <button className="absolute -top-5 -right-5 z-20 bg-primary-orange text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange" onClick={onClose} aria-label="Fermer" > <X size={20} /> </button>
             </div>
         </div>
      );
  }
}