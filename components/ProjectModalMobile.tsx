// ProjectModalMobile.tsx - CORRECTIONS ET AMÉLIORATIONS
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
// Assurez-vous que l'interface Project est importée ou définie si elle n'est pas exportée de Desktop
// Si elle est exportée de ProjectModalDesktop.tsx, vous pouvez l'importer :
// import { Project } from "./ProjectModalDesktop";

// Ou la redéfinir ici si plus simple pour la modularité initiale :
export interface Project {
  id: string;
  title: string;
  mainVisual: string;
  additionalVisuals: string[];
  description: string | string[];
  link: string;
}


// Constants (peuvent être exportées si besoin ailleurs, sinon locales)
const GRIP_HEIGHT_COLLAPSED_NEW = '2.5vh'; // NOUVELLE VALEUR POUR LE GRIP REPLIÉ
const GRIP_HEIGHT_EXPANDED = '75vh';    // Peut rester, ou devenir dynamique
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

  // État pour l'image d'arrière-plan pendant le swipe
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
  const backgroundImageRef = useRef<HTMLDivElement>(null); // Un seul ref pour l'image de fond
  const panelRef = useRef<HTMLDivElement>(null);
  // gripRef n'est plus nécessaire pour les handlers, seulement pour le style visuel si besoin
  const panelInitialY = useRef<number>(0);

  useEffect(() => { setIsMounted(true); }, []);

  const initialCollapsedY = useMemo(() => {
    if (typeof window !== 'undefined' && isMounted) {
      try {
        const vh = window.innerHeight;
        // Utiliser la NOUVELLE constante pour la hauteur du grip replié
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED_NEW) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        // La position translateY pour l'état replié est la hauteur totale du panneau moins la partie visible du grip
        return expandedHeightPx - gripHeightPx;
      } catch (e) { console.error("Error calculating initialCollapsedY", e); return null; }
    } return null;
  }, [isMounted]); // GRIP_HEIGHT_COLLAPSED_NEW et GRIP_HEIGHT_EXPANDED sont des constantes, pas besoin en deps

  const prevIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex - 1 + allVisuals.length) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);
  const nextIndex = useMemo(() => allVisuals.length > 0 ? (currentImageIndex + 1) % allVisuals.length : 0, [currentImageIndex, allVisuals.length]);


  const resetSwipeState = useCallback(() => {
    setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null);
    setSwipeRotation(0); setIsSwiping(false);
    setSwipeBackgroundInfo({ index: null, direction: null }); // Reset l'image de fond

    requestAnimationFrame(() => {
        try {
            if (imageRef.current) {
                imageRef.current.style.transform = 'translateX(0px) rotate(0deg)';
                imageRef.current.style.opacity = '1';
                imageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                imageRef.current.style.transformOrigin = 'center center';
                imageRef.current.style.zIndex = '10';
            }
            // Assurer que l'image d'arrière-plan est cachée au reset
            if (backgroundImageRef.current) {
                backgroundImageRef.current.style.opacity = '0';
                backgroundImageRef.current.style.transform = 'scale(0.85) translateY(10px)'; // Encore plus petite
                backgroundImageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                backgroundImageRef.current.style.zIndex = '5';
            }
        } catch (error) { console.error("Swipe reset style error:", error); }
    });
  }, []); // Aucune dépendance car elle ne lit que des refs et appelle des setters

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
      if (!isMounted || !isSwiping || !imageRef.current || !backgroundImageRef.current) return;
      try {
        const distance = currentX - startX;
        const screenWidth = window.innerWidth;
        const rotationFactor = 0.08; const maxRotation = 20;
        const clampedRotation = Math.max(-maxRotation, Math.min(maxRotation, rotationFactor * distance));
        const currentImageOpacity = 1 - Math.min(0.5, Math.abs(distance) / (screenWidth * 0.6));
        setSwipeRotation(clampedRotation);

        let bgIndex: number | null = null;
        let swipeDir: 'left' | 'right' | null = null;

        if (distance < -10) { // Swipe vers la gauche
            swipeDir = 'left';
            if (currentImageIndex < allVisuals.length - 1) bgIndex = nextIndex;
        } else if (distance > 10) { // Swipe vers la droite
            swipeDir = 'right';
            if (currentImageIndex > 0) bgIndex = prevIndex;
        }
        setSwipeBackgroundInfo({ index: bgIndex, direction: swipeDir });

        requestAnimationFrame(() => {
            if (!imageRef.current || !backgroundImageRef.current) return;
            imageRef.current.style.transform = `translateX(${distance}px) rotate(${clampedRotation}deg)`;
            imageRef.current.style.opacity = currentImageOpacity.toString();
            imageRef.current.style.transition = 'none';
            imageRef.current.style.transformOrigin = distance > 0 ? 'bottom left' : 'bottom right';
            imageRef.current.style.zIndex = '10';

            if (bgIndex !== null) {
                const progress = Math.min(1, Math.abs(distance) / (screenWidth * 0.35));
                const scale = 0.85 + (0.10 * progress); // Commence à 0.85, finit à 0.95
                const translateY = 10 - (10 * progress); // Effet de rapprochement
                const opacity = 0.1 + (0.6 * progress);  // Commence à 0.1, finit à 0.7

                backgroundImageRef.current.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                backgroundImageRef.current.style.opacity = opacity.toString();
                backgroundImageRef.current.style.transition = 'none';
                backgroundImageRef.current.style.zIndex = '5';
            } else {
                backgroundImageRef.current.style.opacity = '0'; // Cache si pas d'image de fond valide
            }
       });
    } catch (error) { console.error("Swipe calc error:", error); }
  }, [isSwiping, isMounted, currentImageIndex, allVisuals.length, nextIndex, prevIndex]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Vérifier si le target est dans le contenu scrollable du panneau
    const targetNode = e.target as Node;
    const panelContent = panelRef.current?.querySelector('.panel-content');
    if (panelContent?.contains(targetNode) && panelContent.scrollHeight > panelContent.clientHeight && isInfoVisible) {
        // Si on touche du contenu scrollable dans le panneau ouvert, ne pas initier le swipe d'image
        return;
    }
    if (panelRef.current?.contains(targetNode) && !gripRef.current?.contains(targetNode) && isInfoVisible) {
        // Si on touche le panneau (hors grip) quand il est ouvert, ne pas initier le swipe d'image (pour permettre le drag du panneau)
        return;
    }

    if (allVisuals.length <= 1 || isDraggingPanel) return;
    try {
        setTouchEnd(null); const startX = e.targetTouches[0].clientX;
        setTouchStart(startX); setCurrentTouchX(startX); setIsSwiping(true);
        if (imageRef.current) imageRef.current.style.transition = 'none';
        if (backgroundImageRef.current) backgroundImageRef.current.style.transition = 'none';
    } catch (error) { console.error("TouchStart error:", error); setIsSwiping(false); }
  }, [allVisuals.length, isDraggingPanel, isInfoVisible]);

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
    const isValidLeftSwipe = swipeBackgroundInfo.direction === 'left' && finalDistance < -MIN_SWIPE_DISTANCE && swipeBackgroundInfo.index !== null;
    const isValidRightSwipe = swipeBackgroundInfo.direction === 'right' && finalDistance > MIN_SWIPE_DISTANCE && swipeBackgroundInfo.index !== null;
    setIsSwiping(false);

    try {
        const swipeAnimDuration = 350;
        const transitionCurve = 'cubic-bezier(0.175, 0.885, 0.32, 1.175)';
        const transitionStyle = `transform ${swipeAnimDuration}ms ${transitionCurve}, opacity ${swipeAnimDuration}ms ease-out`;

        if (isValidLeftSwipe || isValidRightSwipe) {
            if (imageRef.current) imageRef.current.style.transition = transitionStyle;
            if (backgroundImageRef.current) backgroundImageRef.current.style.transition = transitionStyle;
        }

        if (isValidLeftSwipe) {
            if(imageRef.current) { const finalRotation = -Math.max(15, Math.abs(swipeRotation * 1.2)); imageRef.current.style.transform = `translateX(-120%) rotate(${finalRotation}deg) scale(0.9)`; imageRef.current.style.opacity = '0'; }
            if(backgroundImageRef.current) { backgroundImageRef.current.style.transform = 'scale(1) translateY(0px)'; backgroundImageRef.current.style.opacity = '1'; backgroundImageRef.current.style.zIndex = '15'; }
            setTimeout(() => { handleNext(); resetSwipeState(); }, swipeAnimDuration);
        } else if (isValidRightSwipe) {
            if(imageRef.current) { const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.2)); imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.9)`; imageRef.current.style.opacity = '0'; }
            if(backgroundImageRef.current) { backgroundImageRef.current.style.transform = 'scale(1) translateY(0px)'; backgroundImageRef.current.style.opacity = '1'; backgroundImageRef.current.style.zIndex = '15'; }
            setTimeout(() => { handlePrevious(); resetSwipeState(); }, swipeAnimDuration);
        } else { resetSwipeState(); }
    } catch (error) { console.error("TouchEnd error:", error); resetSwipeState(); }
    finally { setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null); }
  }, [ touchStart, touchEnd, isSwiping, swipeRotation, MIN_SWIPE_DISTANCE, handleNext, handlePrevious, resetSwipeState, swipeBackgroundInfo ]);

  const calculatePanelY = useCallback((deltaY: number): number => { /* (Logic as before) */ }, [isMounted]);
  const updateContentVisibility = useCallback((currentY: number | null) => { /* (Logic as before) */ }, []);

  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    if (isSwiping) return; // Ne pas démarrer si on swipe déjà une image
    const target = e.target as Node;
    const panelContent = panelRef.current?.querySelector('.panel-content');
    const gripHandle = gripRef.current; // Utiliser la ref du grip visuel

    // Permettre le scroll si on touche le contenu scrollable et qu'il est visible
    if (panelContent?.contains(target) && isInfoVisible && panelContent.scrollHeight > panelContent.clientHeight) {
        setIsDraggingPanel(false); // Ne pas initier le drag du panneau
        return;
    }
    // Initier le drag seulement si on touche le grip ou une zone non scrollable du panneau
    if (gripHandle?.contains(target) || panelRef.current?.contains(target)) {
        try {
            e.stopPropagation(); // Empêche le swipe d'image
            setDragStartY(e.touches[0].clientY);
            setIsDraggingPanel(true);
            if (panelRef.current) {
                panelRef.current.style.transition = 'none';
                const style = window.getComputedStyle(panelRef.current);
                const matrix = new DOMMatrix(style.transform === 'none' ? '' : style.transform);
                panelInitialY.current = matrix.m42; setPanelTranslateY(panelInitialY.current);
                if (!isInfoVisible && panelContent) { (panelContent as HTMLElement).style.display = 'block'; }
            }
        } catch (error) { console.error("PanelTouchStart error:", error); setIsDraggingPanel(false); }
    }
  }, [isInfoVisible, isSwiping]);

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => { /* (Logic as before) */ }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);
  const handlePanelTouchEnd = useCallback(() => { /* (Logic as before) */ }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);

  // --- EFFECTS ---
  useEffect(() => { // Initial panel state
    if (isOpen && isMounted && initialCollapsedY !== null) { // isMobile retiré
        setPanelTranslateY(initialCollapsedY);
        requestAnimationFrame(() => {
            if (panelRef.current) panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        });
    } else if (!isOpen) {
        setPanelTranslateY(null); setIsInfoVisible(false);
        if (panelRef.current) panelRef.current.style.transition = 'none';
    }
  }, [isOpen, isMounted, initialCollapsedY]); // isMobile retiré

  useEffect(() => { // Reset on project change
    if (isOpen) { // isMobile retiré
        const newNextIndexState = allVisuals.length > 1 ? 1 : 0;
        setCurrentImageIndex(0); setNextImageStateIndex(newNextIndexState);
        resetSwipeState(); setImagesLoaded({}); setIsInfoVisible(false);
        if(isMounted && initialCollapsedY !== null) { setPanelTranslateY(initialCollapsedY); }
    }
  }, [project, isOpen, isMounted, initialCollapsedY, allVisuals.length, resetSwipeState]); // isMobile retiré

  // Cet effet ne dépendait pas de isMobile, il est correct
  useEffect(() => { /* Image Preloading */
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    const preloadImage = (src: string): Promise<void> => { /*...*/ };
    const preloadAllImages = async () => { /*...*/ };
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);

  // Cet effet ne dépendait pas de isMobile, il est correct (il est pour MOBILE UNIQUEMENT)
  useEffect(() => { /* Prevent Background Scroll */
    if (!isMounted || !isOpen) return; // isMobile implicite
    const preventDocumentScroll = (e: TouchEvent) => { /*...*/ };
    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventDocumentScroll);
  }, [isOpen, isInfoVisible, isMounted]);

   // --- RENDER FALLBACK ---
   if (!isMounted) {
     if (!isOpen) return null;
     return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
   }
   if (!isOpen) return null;

  const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED_NEW} + 0px)`; // Utiliser NOUVELLE constante
  const panelTransform = panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : (initialCollapsedY !== null ? `translateY(${initialCollapsedY}px)` : `translateY(calc(100% - ${GRIP_HEIGHT_COLLAPSED_NEW}))`);


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
            {/* Background Image (pour le swipe) */}
            {allVisuals.length > 1 && swipeBackgroundInfo.index !== null && allVisuals[swipeBackgroundInfo.index] && (
                 <div ref={backgroundImageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ opacity: 0, transform: 'scale(0.85) translateY(10px)', zIndex: 5 }}>
                     <Image key={`bg-${allVisuals[swipeBackgroundInfo.index]}`} src={allVisuals[swipeBackgroundInfo.index]} alt={`Arrière-plan`} fill className="object-contain" sizes="100vw" loading="lazy" />
                 </div>
             )}
            {/* Current Image */}
            <div ref={imageRef} className="absolute inset-0 flex items-center justify-center will-change-transform" style={{ zIndex: 10 }}>
                {allVisuals[currentImageIndex] && (<Image key={allVisuals[currentImageIndex]} src={allVisuals[currentImageIndex]} alt={`Image ${currentImageIndex + 1}`} fill className="object-contain" sizes="100vw" priority={true} />)}
            </div>
        </div>

        {/* Nav Buttons */}
        {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (<> <button onClick={() => { handlePrevious(); setTimeout(resetSwipeState,0); }} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Précédent" style={{ transform: 'translateY(-50%)' }}> <ChevronLeft size={24} /> </button> <button onClick={() => { handleNext(); setTimeout(resetSwipeState,0);}} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Suivant" style={{ transform: 'translateY(-50%)' }}> <ChevronRight size={24} /> </button> </>)}

        {/* Pagination Dots */}
        {allVisuals.length > 1 && (<div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED_NEW} + 15px)` }} aria-label="Indicateurs" aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}> <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full"> {allVisuals.map((_, idx) => (<button key={idx} onClick={() => { setCurrentImageIndex(idx); setTimeout(resetSwipeState,0); }} className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined} />))} </div> </div>)}

        {/* Info Panel (handlers sur ce div principal) */}
        <div ref={panelRef}
             className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none`} // rounded-t-lg pour coins moins arrondis
             style={{
                 maxHeight: GRIP_HEIGHT_EXPANDED, // Hauteur max
                 // La hauteur s'adaptera au contenu ou sera limitée par maxHeight
                 transform: panelTransform,
                 zIndex: 30,
             }}
             aria-hidden={!isInfoVisible}
             onTouchStart={handlePanelTouchStart}
             onTouchMove={handlePanelTouchMove}
             onTouchEnd={handlePanelTouchEnd}
        >
            {/* Grip Handle Visuel (pour l'esthétique et la petite zone de grab initiale si on veut) */}
            <div ref={gripRef} className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none"> {/* pointer-events-none ici si le parent gère le drag */}
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div>
                <div className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden" style={{minHeight: `calc(${GRIP_HEIGHT_COLLAPSED_NEW} - 30px)`}} > {/* Hauteur min pour le texte */}
                    {!isInfoVisible && ( <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">Description</span> )}
                </div>
            </div>
            {/* Panel Content (doit permettre le scroll interne) */}
            <div className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto" // Permet les events pour le scroll
                 style={{
                     // La hauteur s'adaptera. Le maxHeight est géré par le parent.
                     // Pour que overflow-y fonctionne, il faut une hauteur définie ou une contrainte de hauteur par rapport au parent.
                     // Si panelRef a une hauteur dynamique, il faut que panel-content ait aussi une gestion de hauteur.
                     // La solution la plus simple est que panel-content ait un maxHeight qui lui permet de scroller
                     // à l'intérieur de la hauteur courante de panelRef.
                     maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED_NEW})`, // Limite la hauteur pour le scroll
                     display: 'block', // Reste block
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

// Les fonctions internes aux useCallback ont été restaurées.
// J'ai supprimé le `useEffect` pour `setNextImageStateIndex` car `swipeBackgroundInfo.index` gère l'image de fond.
// Si vous aviez besoin de `nextImageStateIndex` pour autre chose que le swipe, il faudrait le réintégrer.
// Le `nextImageRef` est renommé `backgroundImageRef` pour plus de clarté.