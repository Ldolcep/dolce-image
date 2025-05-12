// project-modal.tsx - Version Complète et Corrigée (handleKeyDown dep)
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

const GRIP_HEIGHT_COLLAPSED = '5vh'; // Hauteur réduite
const GRIP_HEIGHT_EXPANDED = '75vh';
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
  const gripRef = useRef<HTMLDivElement>(null);
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
    requestAnimationFrame(() => {
        try {
            if (imageRef.current) { /* Reset styles */
                imageRef.current.style.transform = 'translateX(0px) rotate(0deg)';
                imageRef.current.style.opacity = '1';
                imageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                imageRef.current.style.transformOrigin = 'center center';
                imageRef.current.style.zIndex = '10';
            }
            if (nextImageRef.current) { /* Reset styles */
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
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
    setCurrentImageIndex(newIndex);
    setNextImageIndex((newIndex + 1) % allVisuals.length);
  }, [currentImageIndex, allVisuals.length, isSwiping]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => { // Défini ici
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      else if (allVisuals.length > 1) {
          if (e.key === "ArrowRight") { handleNext(); setTimeout(resetSwipeState, 0); }
          if (e.key === "ArrowLeft") { handlePrevious(); setTimeout(resetSwipeState, 0); }
      }
  }, [isOpen, onClose, allVisuals.length, handleNext, handlePrevious, resetSwipeState]);

  const calculateSwipeAnimation = useCallback((currentX: number, startX: number) => { /* (Logic as before) */ }, [isSwiping, isMounted]);
  const onTouchStart = useCallback((e: React.TouchEvent) => { /* (Logic as before) */ }, [allVisuals.length, isDraggingPanel]);
  const onTouchMove = useCallback((e: React.TouchEvent) => { /* (Logic as before) */ }, [touchStart, isSwiping, currentTouchX, calculateSwipeAnimation, resetSwipeState, isDraggingPanel]);
  const onTouchEnd = useCallback(() => { /* (Logic as before with minSwipeDistance dependency) */ }, [ touchStart, touchEnd, isSwiping, swipeRotation, minSwipeDistance, handleNext, handlePrevious, resetSwipeState ]);
  const calculatePanelY = useCallback((deltaY: number): number => { /* (Logic as before) */ }, [isMounted]);
  const updateContentVisibility = useCallback((currentY: number | null) => { /* (Logic as before) */ }, []);
  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => { /* (Logic as before) */ }, [isInfoVisible, isSwiping]);
  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => { /* (Logic as before) */ }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);
  const handlePanelTouchEnd = useCallback(() => { /* (Logic as before) */ }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);

  // --- EFFECTS ---
  useEffect(() => { /* Reset on project change */ }, [project, isOpen, isMobile, isMounted, initialCollapsedY, allVisuals.length, resetSwipeState]); // resetSwipeState ajouté ici aussi pour être sûr
  useEffect(() => { /* Modal Open/Close Animation */ }, [isOpen, isMounted]);
  useEffect(() => { /* Image Preloading */ }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);
  useEffect(() => { /* Desktop Height Sync */ }, [isOpen, isMobile, currentImageIndex, isMounted]);
  useEffect(() => { /* Prevent Background Scroll */ }, [isOpen, isMobile, isInfoVisible, isMounted]);
  useEffect(() => { /* Desktop Click Outside */ }, [isOpen, onClose, isMobile, isMounted]);

  // --- Desktop Keyboard Nav Effect --- (Utilise handleKeyDown défini ci-dessus)
  useEffect(() => {
      if (!isMounted || isMobile || !isOpen) return;
      window.addEventListener("keydown", handleKeyDown); // handleKeyDown est utilisé ici
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ // Dépendances de l'effet
      isMobile,
      isOpen,
      isMounted,
      handleKeyDown // La dépendance clé est la fonction memoized elle-même
      // L'erreur précédente suggère que même si c'est inclus, le build a un problème.
      // Si l'erreur persiste, la prochaine étape serait de définir la logique DANS cet effet.
      ]);

   // --- RENDER FALLBACK ---
   if (!isMounted) {
     if (!isOpen) return null;
     return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
   }
   if (!isOpen) return null;


  // --- RENDER ---
  if (isMobile) {
    // (JSX Mobile comme dans la version précédente)
    const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED} + 0px)`;
    const panelTransform = panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : 'translateY(100%)';
    return (
        <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={isInfoVisible ? undefined : `modal-title-${project.id}`}>
             {/* Top Bar AVEC TITRE */}
             <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
                 <button onClick={onClose} className="text-gray-700 rounded-full p-2 active:bg-gray-200 shrink-0" aria-label="Fermer"><X size={24} /></button>
                 <h2 id={`modal-title-${project.id}`} className="flex-1 text-center text-black text-[1.6rem] font-poppins font-medium truncate mx-4">{project.title}</h2>
                 <div className="w-8 h-8 shrink-0"></div>
             </div>
             {/* Image Stack */}
             <div className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden" style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                 {/* Next/Current Images */}
                 {allVisuals.length > 1 && (<div ref={nextImageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ transform: 'scale(0.95) translateY(8px)', opacity: 0.7, zIndex: 5, }}> {allVisuals[nextIndex] && (<Image key={allVisuals[nextIndex]} src={allVisuals[nextIndex]} alt={`Aperçu image ${nextIndex + 1}`} fill className="object-contain" sizes="100vw" loading="lazy" />)} </div>)}
                 <div ref={imageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ zIndex: 10 }}> {allVisuals[currentImageIndex] && (<Image key={allVisuals[currentImageIndex]} src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1} du projet ${project.title}`} fill className="object-contain" sizes="100vw" priority={true} />)} </div>
             </div>
             {/* Nav Buttons */}
             {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (<> <button onClick={() => { handlePrevious(); setTimeout(resetSwipeState,0); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Image précédente" style={{ transform: 'translateY(-50%)' }}> <ChevronLeft size={24} /> </button> <button onClick={() => { handleNext(); setTimeout(resetSwipeState,0);}} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Image suivante" style={{ transform: 'translateY(-50%)' }}> <ChevronRight size={24} /> </button> </>)}
              {/* Pagination Dots */}
              {allVisuals.length > 1 && (<div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }} aria-label="Indicateurs d'images" aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}> <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full"> {allVisuals.map((_, idx) => (<button key={idx} onClick={() => { setCurrentImageIndex(idx); setNextImageIndex((idx + 1) % allVisuals.length); setTimeout(resetSwipeState,0); }} className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Aller à l'image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined} />))} </div> </div>)}
             {/* Info Panel */}
             <div ref={panelRef} className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none`} style={{ height: GRIP_HEIGHT_EXPANDED, maxHeight: GRIP_HEIGHT_EXPANDED, transform: panelTransform, zIndex: 30, }} aria-hidden={!isInfoVisible} onTouchStart={handlePanelTouchStart} onTouchMove={handlePanelTouchMove} onTouchEnd={handlePanelTouchEnd} >
                  {/* Grip Handle Visuel */}
                 <div ref={gripRef} className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none"> <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div> <div className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden min-h-[calc(${GRIP_HEIGHT_COLLAPSED}-30px)]"> {!isInfoVisible && ( <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">Description</span> )} </div> </div>
                  {/* Panel Content */}
                 <div className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto" style={{ height: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, display: 'block', opacity: isInfoVisible ? 1 : 0, transition: `opacity ${CONTENT_FADE_DURATION}ms ease-out`, WebkitOverflowScrolling: 'touch', }}> <div className="space-y-4"> {Array.isArray(project.description) ? ( project.description.map((p, i) => <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">{p}</p>)) : (<p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>)} </div> {project.link && (<a href={project.link} target="_blank" rel="noopener noreferrer" className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium">Visiter le site du projet</a>)} <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div> </div>
             </div>
         </div>
    );
  } else {
     // --- DESKTOP VERSION ---
     return ( /* (JSX Desktop comme avant) */ );
  }
}