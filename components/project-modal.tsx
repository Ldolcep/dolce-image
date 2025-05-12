// project-modal.tsx - Ajout de gardes pour les useMemo
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

const GRIP_HEIGHT_COLLAPSED = '10vh';
const GRIP_HEIGHT_EXPANDED = '75vh';
const PANEL_ANIMATION_DURATION = 400;
const CONTENT_FADE_DURATION = 300;

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals], [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  // Image Stack & Swipe States
  const [nextImageIndex, setNextImageIndex] = useState(allVisuals.length > 1 ? 1 : 0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentTouchX, setCurrentTouchX] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [swipeRotation, setSwipeRotation] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const nextImageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const imageColumnRef = useRef<HTMLDivElement>(null);
  const descriptionColumnRef = useRef<HTMLDivElement>(null);

  const isMobile = useIsMobile();

  // Panel Drag States
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [panelTranslateY, setPanelTranslateY] = useState<number | null>(null);
  const panelInitialY = useRef<number>(0);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);

  // Mount State
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- Calculate initial collapsed position safely ---
  const initialCollapsedY = useMemo(() => {
    if (typeof window !== 'undefined' && isMounted) {
      try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        return expandedHeightPx - gripHeightPx;
      } catch (e) { console.error("Error calculating initialCollapsedY", e); return null; }
    }
    return null;
  }, [isMounted]);

  // --- Effect to set initial panel state when opening ---
  useEffect(() => {
    if (isOpen && isMobile && isMounted && initialCollapsedY !== null) {
        setPanelTranslateY(initialCollapsedY);
        requestAnimationFrame(() => {
            if (panelRef.current) panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        });
    } else if (!isOpen) {
        setPanelTranslateY(null); setIsInfoVisible(false);
        if (panelRef.current) panelRef.current.style.transition = 'none';
    }
  }, [isOpen, isMobile, isMounted, initialCollapsedY]);


  // --- Calculate adjacent indices safely ---
  const prevIndex = useMemo(() =>
    // AJOUT GARDE: Vérifie que allVisuals n'est pas vide
    allVisuals.length > 0 ? (currentImageIndex - 1 + allVisuals.length) % allVisuals.length : 0,
    [currentImageIndex, allVisuals.length]
  );

  const nextIndex = useMemo(() =>
    // AJOUT GARDE: Vérifie que allVisuals n'est pas vide
    allVisuals.length > 0 ? (currentImageIndex + 1) % allVisuals.length : 0,
    [currentImageIndex, allVisuals.length]
  );

  // Reset on project change
  useEffect(() => {
    if (isOpen) {
        const newNextIndexState = allVisuals.length > 1 ? 1 : 0;
        setCurrentImageIndex(0);
        setNextImageIndex(newNextIndexState); // Use calculated value
        resetSwipeState();
        setImagesLoaded({});
        setIsInfoVisible(false);
        if(isMobile && isMounted && initialCollapsedY !== null) {
            setPanelTranslateY(initialCollapsedY);
        }
    }
     // Note: prevIndex/nextIndex se recalculeront automatiquement via useMemo
  }, [project, isOpen, isMobile, isMounted, initialCollapsedY, allVisuals.length]); // allVisuals.length ajouté


  // --- Modal Open/Close Animation ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isOpen && isMounted) {
      timeoutId = setTimeout(() => setIsAnimating(true), 50);
    } else { setIsAnimating(false); }
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [isOpen, isMounted]);


  // --- Comprehensive Image Preloading ---
  useEffect(() => {
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    // Utilise prevIndex et nextIndex (qui ont maintenant des gardes)
    const preloadImage = (src: string): Promise<void> => { /* ... */ };
    const preloadAllImages = async () => { /* ... */ };
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]); // Dépendances correctes


 // --- Handlers & other Effects (Implémentations comme avant, mais s'assurer qu'ils utilisent les bonnes variables et dépendent de isMounted si nécessaire) ---

   // --- Swipe State Reset ---
  const resetSwipeState = useCallback(() => { /* (Implementation as before) */ }, []);

  // --- Image Navigation Handlers ---
  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex + 1) % allVisuals.length;
    setCurrentImageIndex(newIndex);
    // Utilise la NOUVELLE valeur de newIndex pour calculer le prochain index de l'état
    setNextImageIndex((newIndex + 1) % allVisuals.length);
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
    setCurrentImageIndex(newIndex);
    // Utilise la NOUVELLE valeur de newIndex pour calculer le prochain index de l'état
    setNextImageIndex((newIndex + 1) % allVisuals.length);
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  // --- Desktop Keyboard Nav ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      else if (allVisuals.length > 1) {
          // Important: Appeler resetSwipeState *après* avoir changé l'état
          if (e.key === "ArrowRight") { handleNext(); setTimeout(resetSwipeState, 0); }
          if (e.key === "ArrowLeft") { handlePrevious(); setTimeout(resetSwipeState, 0); }
      }
  }, [isOpen, onClose, allVisuals.length, handleNext, handlePrevious, resetSwipeState]); // resetSwipeState ajouté

   // Autres hooks et callbacks (calculateSwipeAnimation, onTouch*, Panel Handlers, etc.) comme dans la version précédente
   // ... (garder les implémentations précédentes pour ces fonctions)

    // --- Calculate Swipe Animation ---
    const calculateSwipeAnimation = useCallback((currentX: number, startX: number) => {
        if (!isMounted || !isSwiping) return;
        // ... (logique comme avant) ...
    }, [isSwiping, isMounted]);

    // --- Touch Handlers for Swipe ---
    const onTouchStart = useCallback((e: React.TouchEvent) => {
        if (panelRef.current?.contains(e.target as Node) || allVisuals.length <= 1 || isDraggingPanel) return;
        // ... (logique comme avant) ...
    }, [allVisuals.length, isDraggingPanel]);

    const onTouchMove = useCallback((e: React.TouchEvent) => {
        if (touchStart === null || !isSwiping || isDraggingPanel) return;
        // ... (logique comme avant) ...
    }, [touchStart, isSwiping, currentTouchX, calculateSwipeAnimation, resetSwipeState, isDraggingPanel]);

    const onTouchEnd = useCallback(() => {
        if (!touchStart || !isSwiping) { if (!isSwiping) resetSwipeState(); return; }
        // ... (logique comme avant, s'assurer que resetSwipeState est appelé dans les bonnes branches) ...
    }, [touchStart, touchEnd, isSwiping, swipeRotation, minSwipeDistance, handleNext, handlePrevious, resetSwipeState]);


    // --- Panel Drag Calculation & Content Visibility ---
    const calculatePanelY = useCallback((deltaY: number): number => {
        if(!isMounted) return 0;
        // ... (logique comme avant) ...
         try { const initialPos = panelInitialY.current; let newY = initialPos + deltaY; const vh = window.innerHeight; const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100; const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100; const collapsedY = expandedHeightPx - gripHeightPx; const expandedY = 0; const minY = expandedY - 50; const maxY = collapsedY + 50; return Math.max(minY, Math.min(maxY, newY)); } catch (error) { console.error("Panel Y calc error:", error); return panelInitialY.current; }
    }, [isMounted]);

    const updateContentVisibility = useCallback((currentY: number | null) => {
        if (currentY === null || !panelRef.current) return;
        // ... (logique comme avant) ...
         try { const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement; if (!contentElement) return; const vh = window.innerHeight; const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100; const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100; const collapsedY = expandedHeightPx - gripHeightPx; const expandedY = 0; const totalTravel = collapsedY - expandedY; if (totalTravel <= 0) return; const progress = Math.max(0, Math.min(1, (currentY - expandedY) / totalTravel)); const opacity = 1 - progress; contentElement.style.opacity = Math.max(0, Math.min(1, opacity)).toString(); if (opacity > 0) contentElement.style.display = 'block'; } catch(error) { console.error("Content visibility error", error)}
    }, []);


    // --- Panel Touch Handlers ---
    const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
        if (!(gripRef.current?.contains(e.target as Node)) || isSwiping) return;
        // ... (logique comme avant) ...
    }, [isInfoVisible, isSwiping]);

    const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
        if (dragStartY === null || !isDraggingPanel || !panelRef.current) return;
        // ... (logique comme avant) ...
    }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);

    const handlePanelTouchEnd = useCallback(() => {
        if (dragStartY === null || !isDraggingPanel || panelTranslateY === null || !panelRef.current) return;
        // ... (logique comme avant) ...
    }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);


   // --- Render Fallback ---
   if (!isMounted) {
     if (!isOpen) return null;
     return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
   }
   if (!isOpen) return null;


  // --- RENDER ---
  // (Le JSX reste identique à la version précédente, y compris la partie Desktop)
  if (isMobile) {
    const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED} + 0px)`;
    const panelTransform = panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : (initialCollapsedY !== null ? `translateY(${initialCollapsedY}px)` : 'translateY(100%)');

    return (
        // (JSX Mobile comme avant)
        <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={`modal-title-${project.id}`}>
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
                <button onClick={onClose} className="text-gray-700 rounded-full p-2 active:bg-gray-200" aria-label="Fermer"><X size={24} /></button>
                <div className="w-8 h-8"></div>
            </div>
            {/* Image Stack */}
            <div className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden" style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                {/* Next Image */}
                {allVisuals.length > 1 && (<div ref={nextImageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ transform: 'scale(0.95) translateY(8px)', opacity: 0.7, zIndex: 5, }}> {allVisuals[nextImageIndex] && (<Image key={allVisuals[nextImageIndex]} src={allVisuals[nextImageIndex]} alt={`Aperçu image ${nextImageIndex + 1}`} fill className="object-contain" sizes="100vw" loading="lazy" />)} </div>)}
                {/* Current Image */}
                <div ref={imageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ zIndex: 10 }}> {allVisuals[currentImageIndex] && (<Image key={allVisuals[currentImageIndex]} src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} fill className="object-contain" sizes="100vw" priority={true} />)} </div>
            </div>
            {/* Nav Buttons */}
            {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (<> <button onClick={() => { handlePrevious(); setTimeout(resetSwipeState,0); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Image précédente" style={{ transform: 'translateY(-50%)' }}> <ChevronLeft size={24} /> </button> <button onClick={() => { handleNext(); setTimeout(resetSwipeState,0);}} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Image suivante" style={{ transform: 'translateY(-50%)' }}> <ChevronRight size={24} /> </button> </>)}
             {/* Pagination Dots */}
             {allVisuals.length > 1 && (<div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }} aria-label="Indicateurs d'images" aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}> <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full"> {allVisuals.map((_, idx) => (<button key={idx} onClick={() => { setCurrentImageIndex(idx); setNextImageIndex((idx + 1) % allVisuals.length); setTimeout(resetSwipeState,0); }} className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Aller à l'image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined} />))} </div> </div>)}
            {/* Info Panel */}
            <div ref={panelRef} className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl transform will-change-transform`} style={{ height: GRIP_HEIGHT_EXPANDED, maxHeight: GRIP_HEIGHT_EXPANDED, transform: panelTransform, zIndex: 30, }} aria-hidden={!isInfoVisible}>
                 {/* Grip Handle */}
                <div ref={gripRef} className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none" style={{ minHeight: GRIP_HEIGHT_COLLAPSED }} onTouchStart={handlePanelTouchStart} onTouchMove={handlePanelTouchMove} onTouchEnd={handlePanelTouchEnd}> <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div> <div className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden"> {isInfoVisible ? (<h2 id={`modal-title-${project.id}`} className="font-great-vibes text-2xl text-gray-800 text-center truncate">{project.title}</h2>) : (<span className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>)} </div> </div>
                 {/* Panel Content */}
                <div className="panel-content px-5 pb-5 overflow-y-auto" style={{ height: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, display: isInfoVisible ? 'block' : 'none', opacity: isInfoVisible ? 1 : 0, WebkitOverflowScrolling: 'touch', }}> <div className="space-y-4"> {Array.isArray(project.description) ? ( project.description.map((p, i) => <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">{p}</p>)) : (<p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>)} </div> {project.link && (<a href={project.link} target="_blank" rel="noopener noreferrer" className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium">Visiter le site du projet</a>)} <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div> </div>
            </div>
        </div>
    );
  } else {
     // --- DESKTOP VERSION ---
     // (JSX Desktop comme avant, s'assurer que les onClick des boutons et points appellent resetSwipeState si nécessaire)
     return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 transition-opacity duration-300" style={{ opacity: isAnimating ? 1 : 0 }} role="dialog" aria-modal="true" aria-labelledby={`modal-title-${project.id}`} >
             <div ref={modalRef} className="bg-white w-full max-w-5xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl" style={{ transform: isAnimating ? 'scale(1)' : 'scale(0.95)', opacity: isAnimating ? 1 : 0 }} >
               {/* Left Column */}
               <div className="w-full md:w-1/2 relative" ref={imageColumnRef}>
                 <div className="relative" style={{ aspectRatio: '4/5' }}>
                   {allVisuals[currentImageIndex] && ( <Image src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} fill className="object-contain" sizes="(max-width: 768px) 100vw, 50vw" priority={currentImageIndex === 0} key={allVisuals[currentImageIndex]} /> )}
                   {allVisuals.length > 1 && ( <> <button onClick={() => {handlePrevious(); setTimeout(resetSwipeState, 0);}} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" aria-label="Image précédente"> <ChevronLeft size={20} /> </button> <button onClick={() => {handleNext(); setTimeout(resetSwipeState, 0);}} className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow" aria-label="Image suivante"> <ChevronRight size={20} /> </button> </> )}
                   {allVisuals.length > 1 && ( <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center" > <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full"> {allVisuals.map((_, index) => ( <button key={index} onClick={() => {setCurrentImageIndex(index); setTimeout(resetSwipeState,0);}} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`} aria-label={`Aller à l'image ${index + 1}`} aria-current={currentImageIndex === index ? "step" : undefined} /> ))} </div> </div> )}
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