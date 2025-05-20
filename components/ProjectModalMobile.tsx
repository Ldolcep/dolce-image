// ProjectModalMobile.tsx - AVEC CORRECTIONS ET LOGS DE DÉBOGAGE
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

// Constants
export const GRIP_HEIGHT_COLLAPSED = '3vh'; // Votre valeur
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

  const resetSwipeState = useCallback(() => {
    setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null);
    setSwipeRotation(0); setIsSwiping(false);
    setSwipeBackgroundInfo({ index: null, direction: null });
    requestAnimationFrame(() => {
        try {
            if (imageRef.current) {
                imageRef.current.style.transform = 'translateX(0px) rotate(0deg)';
                imageRef.current.style.opacity = '1';
                imageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                imageRef.current.style.transformOrigin = 'center center';
                imageRef.current.style.zIndex = '10';
            }
            if (backgroundImageRef.current) {
                backgroundImageRef.current.style.opacity = '0';
                backgroundImageRef.current.style.transform = 'scale(0.85) translateY(10px)';
                backgroundImageRef.current.style.transition = 'none';
                backgroundImageRef.current.style.zIndex = '5';
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
      if (!isMounted || !isSwiping || !imageRef.current || !backgroundImageRef.current) return;
      try {
        const distance = currentX - startX;
        const screenWidth = window.innerWidth;
        const rotationFactor = 0.08; const maxRotation = 20;
        const clampedRotation = Math.max(-maxRotation, Math.min(maxRotation, rotationFactor * distance));
        const currentImageOpacity = 1 - Math.min(0.5, Math.abs(distance) / (screenWidth * 0.6));
        setSwipeRotation(clampedRotation);
        let bgIndexToShow: number | null = null;
        let currentSwipeDirection: 'left' | 'right' | null = null;
        if (distance < -10) {
            currentSwipeDirection = 'left';
            if (currentImageIndex < allVisuals.length - 1) bgIndexToShow = nextIndex;
        } else if (distance > 10) {
            currentSwipeDirection = 'right';
            if (currentImageIndex > 0) bgIndexToShow = prevIndex;
        }
        setSwipeBackgroundInfo({ index: bgIndexToShow, direction: currentSwipeDirection });
        requestAnimationFrame(() => {
            if (!imageRef.current || !backgroundImageRef.current) return;
            imageRef.current.style.transform = `translateX(${distance}px) rotate(${clampedRotation}deg)`;
            imageRef.current.style.opacity = currentImageOpacity.toString();
            imageRef.current.style.transition = 'none';
            imageRef.current.style.transformOrigin = distance > 0 ? 'bottom left' : 'bottom right';
            imageRef.current.style.zIndex = '10';
            if (bgIndexToShow !== null && backgroundImageRef.current) {
                const progress = Math.min(1, Math.abs(distance) / (screenWidth * 0.35));
                const scale = 0.85 + (0.10 * progress);
                const translateY = 10 - (10 * progress);
                const opacity = 0.1 + (0.6 * progress);
                backgroundImageRef.current.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                backgroundImageRef.current.style.opacity = opacity.toString();
                backgroundImageRef.current.style.transition = 'none';
                backgroundImageRef.current.style.zIndex = '5';
            } else if (backgroundImageRef.current) {
                backgroundImageRef.current.style.opacity = '0';
            }
       });
    } catch (error) { console.error("Swipe calc error:", error); }
  }, [isSwiping, isMounted, currentImageIndex, allVisuals.length, nextIndex, prevIndex]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    console.log("ProjectModalMobile: ImageSwipe onTouchStart triggered - Current isSwiping:", isSwiping, "isDraggingPanel:", isDraggingPanel);
    const targetNode = e.target as Node;
    const panelContentEl = panelRef.current?.querySelector('.panel-content');

    if (panelContentEl?.contains(targetNode) && panelContentEl.scrollHeight > panelContentEl.clientHeight && isInfoVisible) {
        console.log("ImageSwipe onTouchStart: Blocked by scrollable panel content touch");
        return;
    }
    if (panelRef.current?.contains(targetNode) && !gripRef.current?.contains(targetNode) && isInfoVisible) {
        console.log("ImageSwipe onTouchStart: Blocked by panel (not grip/content) touch while info visible");
        return;
    }
    if (gripRef.current?.contains(targetNode)) {
        console.log("ImageSwipe onTouchStart: Blocked by grip touch");
        return;
    }
    if (allVisuals.length <= 1 || isDraggingPanel || isSwiping) {
        console.log("ImageSwipe onTouchStart: Blocked - visuals:", allVisuals.length, "draggingPanel:", isDraggingPanel, "isSwiping:", isSwiping);
        return;
    }
    console.log("ImageSwipe onTouchStart: PROCEEDING WITH SWIPE INIT");
    setIsSwiping(true);
    try {
        setTouchEnd(null); const startX = e.targetTouches[0].clientX;
        setTouchStart(startX); setCurrentTouchX(startX);
        if (imageRef.current) imageRef.current.style.transition = 'none';
        if (backgroundImageRef.current) backgroundImageRef.current.style.transition = 'none';
    } catch (error) { console.error("ImageSwipe TouchStart error:", error); setIsSwiping(false); }
  }, [allVisuals.length, isDraggingPanel, isInfoVisible, isSwiping]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    console.log("ProjectModalMobile: ImageSwipe onTouchMove triggered - isSwiping:", isSwiping, "touchStart:", touchStart);
    if (touchStart === null || !isSwiping || isDraggingPanel) {
        if(touchStart === null) console.log("ImageSwipe onTouchMove: Blocked - touchStart is null");
        if(!isSwiping) console.log("ImageSwipe onTouchMove: Blocked - !isSwiping");
        if(isDraggingPanel) console.log("ImageSwipe onTouchMove: Blocked - isDraggingPanel");
        return;
    }
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
    } catch (error) { console.error("ImageSwipe TouchMove error:", error); resetSwipeState(); }
  }, [touchStart, isSwiping, currentTouchX, calculateSwipeAnimation, resetSwipeState, isDraggingPanel]);

 const onTouchEnd = useCallback(() => {
    console.log("ProjectModalMobile: ImageSwipe onTouchEnd triggered - isSwiping (before set false):", isSwiping, "touchStart:", touchStart);
    if (!touchStart || !isSwiping) {
        if (!isSwiping && touchStart !== null ) { // Si un toucher a commencé mais pas de swipe validé par isSwiping
            console.log("ImageSwipe onTouchEnd: Not a valid swipe, resetting.");
            resetSwipeState();
        } else {
            console.log("ImageSwipe onTouchEnd: No swipe to end (no touchStart or already not swiping).");
        }
        return;
    }
    const finalDistance = (touchEnd ?? touchStart) - touchStart;
    const isValidLeftSwipe = swipeBackgroundInfo.direction === 'left' && finalDistance < -MIN_SWIPE_DISTANCE && swipeBackgroundInfo.index !== null;
    const isValidRightSwipe = swipeBackgroundInfo.direction === 'right' && finalDistance > MIN_SWIPE_DISTANCE && swipeBackgroundInfo.index !== null;

    setIsSwiping(false); // Action de swipe utilisateur terminée
    console.log("ImageSwipe onTouchEnd: isSwiping set to false. LeftSwipe:", isValidLeftSwipe, "RightSwipe:", isValidRightSwipe);

    try {
        const swipeAnimDuration = 350;
        const transitionCurve = 'cubic-bezier(0.175, 0.885, 0.32, 1.175)';
        const transitionStyle = `transform ${swipeAnimDuration}ms ${transitionCurve}, opacity ${swipeAnimDuration}ms ease-out`;
        if (isValidLeftSwipe || isValidRightSwipe) {
            if (imageRef.current) imageRef.current.style.transition = transitionStyle;
            if (backgroundImageRef.current && swipeBackgroundInfo.index !== null) { backgroundImageRef.current.style.transition = transitionStyle; }
        }
        if (isValidLeftSwipe) {
            console.log("ImageSwipe onTouchEnd: Executing left swipe animation.");
            if(imageRef.current) { const finalRotation = -Math.max(15, Math.abs(swipeRotation * 1.2)); imageRef.current.style.transform = `translateX(-120%) rotate(${finalRotation}deg) scale(0.9)`; imageRef.current.style.opacity = '0'; }
            if(backgroundImageRef.current) { backgroundImageRef.current.style.transform = 'scale(1) translateY(0px)'; backgroundImageRef.current.style.opacity = '1'; backgroundImageRef.current.style.zIndex = '15'; }
            setTimeout(() => { console.log("ImageSwipe onTouchEnd: Left swipe timeout - calling handleNext & resetSwipeState"); handleNext(); resetSwipeState(); }, swipeAnimDuration);
        } else if (isValidRightSwipe) {
            console.log("ImageSwipe onTouchEnd: Executing right swipe animation.");
            if(imageRef.current) { const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.2)); imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.9)`; imageRef.current.style.opacity = '0'; }
            if(backgroundImageRef.current) { backgroundImageRef.current.style.transform = 'scale(1) translateY(0px)'; backgroundImageRef.current.style.opacity = '1'; backgroundImageRef.current.style.zIndex = '15'; }
            setTimeout(() => { console.log("ImageSwipe onTouchEnd: Right swipe timeout - calling handlePrevious & resetSwipeState"); handlePrevious(); resetSwipeState(); }, swipeAnimDuration);
        } else {
            console.log("ImageSwipe onTouchEnd: No valid swipe, resetting state.");
            resetSwipeState();
        }
    } catch (error) { console.error("ImageSwipe TouchEnd error:", error); resetSwipeState(); }
    finally { setTouchStart(null); setTouchEnd(null); setCurrentTouchX(null); }
  }, [ touchStart, touchEnd, isSwiping, swipeRotation, MIN_SWIPE_DISTANCE, handleNext, handlePrevious, resetSwipeState, swipeBackgroundInfo ]);

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
    console.log("ProjectModalMobile: PanelTouchStart triggered - Current isSwiping:", isSwiping);
    if (isSwiping) {
        console.log("PanelTouchStart: Blocked by active image swipe");
        return;
    }
    const target = e.target as Node;
    const panelContent = panelRef.current?.querySelector('.panel-content');
    const isTouchingScrollableContent = panelContent?.contains(target) && isInfoVisible && panelContent.scrollHeight > panelContent.clientHeight;
    if (isTouchingScrollableContent) {
      console.log("PanelTouchStart: Allowing default for scrollable content, not dragging panel.");
      setIsDraggingPanel(false);
      return;
    }
    console.log("PanelTouchStart: PROCEEDING WITH PANEL DRAG INIT");
    try {
        e.stopPropagation();
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
  }, [isInfoVisible, isSwiping]);

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    console.log("ProjectModalMobile: PanelTouchMove triggered - isDraggingPanel:", isDraggingPanel);
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
    console.log("ProjectModalMobile: PanelTouchEnd triggered - isDraggingPanel:", isDraggingPanel);
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
        console.log("ProjectModalMobile EFFECT[isOpen, initialCollapsedY]: Setting panelTranslateY to initialCollapsedY:", initialCollapsedY);
        setPanelTranslateY(initialCollapsedY);
        if (panelRef.current) {
            panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
            panelRef.current.style.visibility = 'visible';
            requestAnimationFrame(() => {
                if (panelRef.current) panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
            });
        }
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
             if(panelRef.current) {
                 panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
                 panelRef.current.style.visibility = 'visible';
             }
        }
    }
  }, [project, isOpen, isMounted, initialCollapsedY, allVisuals.length, resetSwipeState]);

  useEffect(() => {
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    const preloadImage = (src: string): Promise<void> => { /*...*/ };
    const preloadAllImages = async () => { /*...*/ };
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);

  useEffect(() => {
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

  const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED} + 0px)`;
  const panelTransformValue = panelTranslateY !== null ? panelTranslateY : (initialCollapsedY !== null ? initialCollapsedY : `calc(100vh - ${GRIP_HEIGHT_COLLAPSED} - 100px)`);
  const panelTransform = typeof panelTransformValue === 'number' ? `translateY(${panelTransformValue}px)` : `translateY(${panelTransformValue})`;
  console.log("ProjectModalMobile RENDER: panelTranslateY =", panelTranslateY, "initialCollapsedY =", initialCollapsedY, "panelTransform =", panelTransform);

  return (
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
        {allVisuals.length > 1 && (<div className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }} aria-label="Indicateurs" aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}> <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full"> {allVisuals.map((_, idx) => (<button key={idx} onClick={() => { setCurrentImageIndex(idx); setTimeout(resetSwipeState,0); }} className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} aria-label={`Image ${idx + 1}`} aria-current={currentImageIndex === idx ? "step" : undefined} />))} </div> </div>)}
        <div ref={panelRef}
             className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none`}
             style={{
                 height: GRIP_HEIGHT_EXPANDED,
                 maxHeight: GRIP_HEIGHT_EXPANDED,
                 transform: panelTransform,
                 zIndex: 30,
                 border: "2px solid red", // DEBUG BORDER
                 visibility: isMounted && initialCollapsedY !== null ? 'visible' : 'hidden',
             }}
             aria-hidden={!isInfoVisible}
             onTouchStart={handlePanelTouchStart}
             onTouchMove={handlePanelTouchMove}
             onTouchEnd={handlePanelTouchEnd}
        >
            <div ref={gripRef} className="w-full flex flex-col items-center pt-3 pb-2 pointer-events-none">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div>
                <div className="flex items-center justify-center w-full px-4 overflow-hidden h-8"> {/* Hauteur fixe pour le texte */}
                    {!isInfoVisible && ( <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider">Description</span> )}
                </div>
            </div>
            <div className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto"
                 style={{
                     height: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED} - 44px)`,
                     maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED} - 44px)`,
                     display: 'block',
                     opacity: isInfoVisible ? 1 : 0,
                     transition: `opacity ${CONTENT_FADE_DURATION}ms ease-out`,
                     WebkitOverflowScrolling: 'touch',
                     border: "1px solid green" // DEBUG BORDER
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
