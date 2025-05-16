// ProjectModalMobile.tsx - AVEC CONSOLE.LOGS POUR DÉBOGAGE PANNEAU
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

const GRIP_HEIGHT_COLLAPSED_NEW = '2.5vh';
const GRIP_HEIGHT_EXPANDED = '75vh';
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
  const [swipeBackgroundInfo, setSwipeBackgroundInfo] = useState<{ index: number | null; direction: 'left' | 'right' | null }>({ index: null, direction: null });
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
  const backgroundImageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const panelInitialY = useRef<number>(0);

  useEffect(() => { setIsMounted(true); console.log("ProjectModalMobile: MOUNTED"); }, []);

  const initialCollapsedY = useMemo(() => {
    if (typeof window !== 'undefined' && isMounted) {
      try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED_NEW) / 100;
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

  const resetSwipeState = useCallback(() => { /* ... (comme avant) ... */ }, []);
  const handleNext = useCallback(() => { /* ... (comme avant) ... */ }, [currentImageIndex, allVisuals.length, isSwiping]);
  const handlePrevious = useCallback(() => { /* ... (comme avant) ... */ }, [currentImageIndex, allVisuals.length, isSwiping]);
  const calculateSwipeAnimation = useCallback((currentX: number, startX: number) => { /* ... (comme avant) ... */ }, [isSwiping, isMounted, currentImageIndex, allVisuals.length, nextIndex, prevIndex]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    console.log("ProjectModalMobile: onTouchStart triggered");
    const targetNode = e.target as Node;
    const panelContentEl = panelRef.current?.querySelector('.panel-content');
    if (panelContentEl?.contains(targetNode) && panelContentEl.scrollHeight > panelContentEl.clientHeight && isInfoVisible) {
        console.log("onTouchStart: returning due to scrollable panel content touch"); return;
    }
    if (panelRef.current?.contains(targetNode) && !gripRef.current?.contains(targetNode) && isInfoVisible) {
        console.log("onTouchStart: returning due to panel (not grip) touch while info visible"); return;
    }
    if (allVisuals.length <= 1 || isDraggingPanel) {
        console.log("onTouchStart: returning - visuals:", allVisuals.length, "draggingPanel:", isDraggingPanel); return;
    }
    console.log("onTouchStart: PROCEEDING WITH SWIPE INIT");
    try {
        setTouchEnd(null); const startX = e.targetTouches[0].clientX;
        setTouchStart(startX); setCurrentTouchX(startX); setIsSwiping(true);
        if (imageRef.current) imageRef.current.style.transition = 'none';
        if (backgroundImageRef.current) backgroundImageRef.current.style.transition = 'none';
    } catch (error) { console.error("TouchStart error:", error); setIsSwiping(false); }
  }, [allVisuals.length, isDraggingPanel, isInfoVisible]);

  const onTouchMove = useCallback((e: React.TouchEvent) => { /* ... (comme avant) ... */ }, [touchStart, isSwiping, currentTouchX, calculateSwipeAnimation, resetSwipeState, isDraggingPanel]);
  const onTouchEnd = useCallback(() => { /* ... (comme avant) ... */ }, [ touchStart, touchEnd, isSwiping, swipeRotation, MIN_SWIPE_DISTANCE, handleNext, handlePrevious, resetSwipeState, swipeBackgroundInfo ]);
  const calculatePanelY = useCallback((deltaY: number): number => { /* ... (comme avant) ... */ }, [isMounted]);
  const updateContentVisibility = useCallback((currentY: number | null) => { /* ... (comme avant) ... */ }, []);
  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => { /* ... (comme avant) ... */ }, [isInfoVisible, isSwiping]);
  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => { /* ... (comme avant) ... */ }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);
  const handlePanelTouchEnd = useCallback(() => { /* ... (comme avant) ... */ }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);

  // --- EFFECTS ---
  useEffect(() => {
    if (isOpen && isMounted && initialCollapsedY !== null) {
        console.log("ProjectModalMobile EFFECT[isOpen, initialCollapsedY]: Setting panelTranslateY to initialCollapsedY:", initialCollapsedY);
        setPanelTranslateY(initialCollapsedY);
        requestAnimationFrame(() => {
            if (panelRef.current) panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        });
    } else if (!isOpen) {
        console.log("ProjectModalMobile EFFECT[isOpen]: Resetting panelTranslateY (isOpen false or other conditions not met)");
        setPanelTranslateY(null); setIsInfoVisible(false);
        if (panelRef.current) panelRef.current.style.transition = 'none';
    }
  }, [isOpen, isMounted, initialCollapsedY]);

  useEffect(() => {
    if (isOpen) {
        console.log("ProjectModalMobile EFFECT[project, isOpen]: Resetting for new project or open");
        setCurrentImageIndex(0);
        resetSwipeState(); setImagesLoaded({}); setIsInfoVisible(false);
        if(isMounted && initialCollapsedY !== null) {
            console.log("ProjectModalMobile EFFECT[project, isOpen]: Resetting panelTranslateY to initialCollapsedY:", initialCollapsedY);
            setPanelTranslateY(initialCollapsedY);
        }
    }
  }, [project, isOpen, isMounted, initialCollapsedY, allVisuals.length, resetSwipeState]); // nextImageStateIndex retiré des deps

  useEffect(() => { /* Image Preloading */
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    const preloadImage = (src: string): Promise<void> => { /*...*/ };
    const preloadAllImages = async () => { /*...*/ };
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);

  useEffect(() => { /* Prevent Background Scroll */
    if (!isMounted || !isOpen) return;
    const preventDocumentScroll = (e: TouchEvent) => { /*...*/ };
    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventDocumentScroll);
  }, [isOpen, isInfoVisible, isMounted]);

   // --- RENDER FALLBACK ---
   if (!isMounted) {
     if (!isOpen) return null;
     console.log("ProjectModalMobile RENDER: Not mounted, showing fallback for open modal");
     return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
   }
   if (!isOpen) {
    console.log("ProjectModalMobile RENDER: Not open, returning null");
    return null;
   }

  const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED_NEW} + 0px)`;
  // Si panelTranslateY est null (ce qui peut arriver au premier rendu après montage mais avant que l'effet ne le définisse),
  // nous utilisons une valeur de repli qui devrait montrer le grip.
  const panelTransformValue = panelTranslateY !== null ? panelTranslateY : (initialCollapsedY !== null ? initialCollapsedY : `calc(100vh - ${GRIP_HEIGHT_COLLAPSED_NEW} - 100px)`); // fallback un peu arbitraire mais visible
  const panelTransform = `translateY(${panelTransformValue}px)`;
  console.log("ProjectModalMobile RENDER: panelTranslateY =", panelTranslateY, "initialCollapsedY =", initialCollapsedY, "panelTransform =", panelTransform);


  return (
    // Le JSX reste le même que la version précédente complète, avec les constantes de hauteur mises à jour
    // et le style du panneau utilisant panelTransform.
    // J'omets le JSX ici pour la concision de la réponse, mais il est identique à celui que vous avez.
    // Assurez-vous d'utiliser GRIP_HEIGHT_COLLAPSED_NEW dans le JSX pour les calculs de style.
    <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={isInfoVisible ? undefined : `modal-title-${project.id}`}>
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
            <button onClick={onClose} className="text-gray-700 rounded-full p-2 active:bg-gray-200 shrink-0" aria-label="Fermer"><X size={24} /></button>
            <h2 id={`modal-title-${project.id}`} className="flex-1 text-center text-black text-[1.6rem] font-poppins font-medium truncate mx-4">{project.title}</h2>
            <div className="w-8 h-8 shrink-0"></div>
        </div>
        <div className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden" style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            {allVisuals.length > 1 && swipeBackgroundInfo.index !== null && allVisuals[swipeBackgroundInfo.index] && (
                 <div ref={backgroundImageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ opacity: 0, transform: 'scale(0.85) translateY(10px)', zIndex: 5 }}>
                     <Image key={`bg-${allVisuals[swipeBackgroundInfo.index]}`} src={allVisuals[swipeBackgroundInfo.index]} alt={`Arrière-plan`} fill className="object-contain" sizes="100vw" loading="lazy" />
                 </div>
             )}
            <div ref={imageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ zIndex: 10 }}>
                {allVisuals[currentImageIndex] && (<Image key={allVisuals[currentImageIndex]} src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1}`} fill className="object-contain" sizes="100vw" priority={true} />)}
            </div>
        </div>
        {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (<> <button onClick={() => { handlePrevious(); setTimeout(resetSwipeState,0); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Précédent" style={{ transform: 'translateY(-50%)' }}> <ChevronLeft size={24} /> </button> <button onClick={() => { handleNext(); setTimeout(resetSwipeState,0);}} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Suivant" style={{ transform: 'translateY(-50%)' }}> <ChevronRight size={24} /> </button> </>)}
        {allVisuals.length > 1 && (<div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED_NEW} + 15px)` }} aria-label="Indicateurs" aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}> <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full"> {allVisuals.map((_, idx) => (<button key={idx} onClick={() => { setCurrentImageIndex(idx); setTimeout(resetSwipeState,0); }} className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined} />))} </div> </div>)}
        <div ref={panelRef}
             className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none`}
             style={{
                 maxHeight: GRIP_HEIGHT_EXPANDED, // Hauteur max
                 // La hauteur s'adaptera au contenu ou sera limitée par maxHeight
                 transform: panelTransform, // Utilise la nouvelle logique de transformation
                 zIndex: 30,
             }}
             aria-hidden={!isInfoVisible}
             onTouchStart={handlePanelTouchStart}
             onTouchMove={handlePanelTouchMove}
             onTouchEnd={handlePanelTouchEnd}
        >
            <div ref={gripRef} className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div>
                <div className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden" style={{minHeight: `calc(${GRIP_HEIGHT_COLLAPSED_NEW} - 30px)`}} >
                    {!isInfoVisible && ( <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">Description</span> )}
                </div>
            </div>
            <div className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto"
                 style={{
                     maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED_NEW})`,
                     display: 'block',
                     opacity: isInfoVisible ? 1 : 0,
                     transition: `opacity ${CONTENT_FADE_DURATION}ms ease-out`,
                     WebkitOverflowScrolling: 'touch',
                 }}
            >
                <div className="space-y-4">
                  {Array.isArray(project.description) ? ( project.description.map((p, i) => <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">{p}</p>))
                                                   : (<p className="font-poppins text-gray-700 text-sm leading-relaxed">{project.description}</p>)}
                 </div>
                 {project.link && (<a href={project.link} target="_blank" rel="noopener noreferrer" className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium">Visiter le site</a>)}
                 <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div>
            </div>
        </div>
    </div>
  );
}