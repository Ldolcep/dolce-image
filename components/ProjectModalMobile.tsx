// ========================================================================
// === ProjectModalMobile.tsx - V0.24a - VERSION INTÉGRALE (CORRECTIF FINAL OMISSIONS COMPLET) ===
// ========================================================================
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSprings, animated, SpringConfig, to as interpolate } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'

export interface Project {
  id: string;
  title: string;
  mainVisual: string;
  additionalVisuals: string[];
  description: string | string[];
  link: string;
}

// Constants
export const GRIP_HEIGHT_COLLAPSED = '3vh';
export const GRIP_HEIGHT_EXPANDED = '75vh';
export const PANEL_ANIMATION_DURATION = 400;
export const CONTENT_FADE_DURATION = 300;

interface ProjectModalMobileProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

const springConfigBase: SpringConfig = { tension: 400, friction: 40 };
const springConfigActive: SpringConfig = { tension: 800, friction: 50, immediate: true };
const springConfigSwipeOut: SpringConfig = { tension: 300, friction: 26 };

export default function ProjectModalMobile({ project, isOpen, onClose }: ProjectModalMobileProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [panelTranslateY, setPanelTranslateY] = useState<number | null>(null);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const panelInitialY = useRef<number>(0);
  const windowWidth = useRef(typeof window !== 'undefined' ? window.innerWidth : 300);
  const gone = useRef(new Set<number>());
  const indexBeingDragged = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') { windowWidth.current = window.innerWidth; }
  }, []);

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

  const to = useCallback((i: number, activeIndex: number = currentImageIndex, forSwipeOut: boolean = false, swipeDir: number = 0) => {
    if (gone.current.has(i) && !forSwipeOut) {
        const xDir = i < activeIndex ? -1 : 1;
        return { x: xDir * (windowWidth.current + 200) , y:0, scale: 0.8, rot: 0, opacity: 0, display: 'none', config: springConfigSwipeOut, immediate: true};
    }
    const x = 0;
    const y = i === activeIndex + 1 ? 8 : 0;
    let scale = 1;
    let rot = 0;
    let opacity = 0;
    let display = 'none';
    let zIndex = 0;

    if (i === activeIndex) {
      scale = 1; opacity = 1; display = 'block'; zIndex = allVisuals.length;
    } else if (i === activeIndex + 1 && allVisuals.length > 1) {
      scale = 0.95; opacity = 0.7; display = 'block'; zIndex = allVisuals.length - 1;
    } else {
      scale = 0.85; opacity = 0; display = 'none'; zIndex = allVisuals.length - Math.abs(i - activeIndex);
    }
    if (forSwipeOut) {
        return { x: swipeDir * (windowWidth.current + 200), rot: swipeDir * 30, scale: 0.8, opacity: 0, display: 'block', config: springConfigSwipeOut, onRest: ({finished}: any) => { if (finished && gone.current.has(i) && api) { api.start(j => (j === i ? { display: 'none', immediate: true } : undefined)); }}};
    }
    return { x, y, scale, rot, opacity, display, zIndex, config: springConfigBase, delay: i === activeIndex ? 50 : 0 };
  }, [currentImageIndex, allVisuals.length]); // api retiré des deps ici car il est défini après

  const [springProps, api] = useSprings(allVisuals.length, i => ({ ...to(i) }), [allVisuals.length, to]); // 'to' est une dépendance

  useEffect(() => {
    if (isOpen) {
      console.log("ProjectModalMobile: Resetting for new project or open - project ID:", project.id);
      gone.current = new Set();
      setCurrentImageIndex(0);
      setImagesLoaded({});
      setIsInfoVisible(false);
      if(isMounted && initialCollapsedY !== null) {
          setPanelTranslateY(initialCollapsedY);
          if(panelRef.current) {
               panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
               panelRef.current.style.visibility = 'visible';
          }
      }
      if (api && allVisuals.length > 0) { // S'assurer que api est défini
        api.start(i => to(i, 0, true));
      }
    }
  }, [project, isOpen, isMounted, initialCollapsedY, allVisuals.length, api, to]); // api et to ajoutés

  useEffect(() => {
    if (isMounted && api && allVisuals.length > 0) {
        api.start(i => to(i, currentImageIndex));
    }
  }, [currentImageIndex, api, isMounted, allVisuals.length, to]);

  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx], down, cancel, first, last }) => {
    if(first) setIsImageDragging(true);
    if(last) setTimeout(() => setIsImageDragging(false), 50);

    if (!isMounted || isDraggingPanel || index !== currentImageIndex) {
        if (cancel && active) cancel();
        return;
    }
    indexBeingDragged.current = active ? index : null;

    const triggerDistance = windowWidth.current / 3.5;
    const triggerVelocity = 0.18;

    if (!active) {
        let swiped = false;
        if (Math.abs(mx) > triggerDistance || Math.abs(vx) > triggerVelocity) {
            const dir = xDir < 0 ? -1 : 1;
            if (dir === -1 && currentImageIndex < allVisuals.length - 1) {
                gone.current.add(index);
                api.start(i => (i === index ? to(i, currentImageIndex, true, dir) : undefined));
                setTimeout(() => setCurrentImageIndex(curr => curr + 1), 50);
                swiped = true;
            } else if (dir === 1 && currentImageIndex > 0) {
                gone.current.add(index);
                api.start(i => (i === index ? to(i, currentImageIndex, true, dir) : undefined));
                setTimeout(() => setCurrentImageIndex(curr => curr - 1), 50);
                swiped = true;
            }
        }
        if (!swiped) { api.start(i => (i === index ? to(i, currentImageIndex) : undefined)); }
        indexBeingDragged.current = null;
        return;
    }

    const x = mx;
    const rot = mx / 12;
    const scale = 1.05;
    const config = springConfigActive;

    if (currentImageIndex + 1 < allVisuals.length) {
        const nextCardIndex = currentImageIndex + 1;
        const progress = Math.min(1, Math.abs(mx) / (windowWidth.current * 0.5));
        const nextScale = 0.95 + (0.05 * progress);
        const nextOpacity = 0.7 + (0.3 * progress);
        const nextY = 8 - (8 * progress);
        api.start(i => (i === nextCardIndex ? { scale: nextScale, opacity: nextOpacity, y:nextY, display: 'block', config } : undefined));
    }
    if (currentImageIndex - 1 >= 0 && mx > 10) {
        const prevCardIndex = currentImageIndex -1;
        const progress = Math.min(1, mx / (windowWidth.current * 0.5));
        const prevScale = 0.95 + (0.05 * progress);
        const prevOpacity = 0.7 + (0.3 * progress);
        const prevY = 8 - (8 * progress);
        api.start(i => (i === prevCardIndex ? {scale: prevScale, opacity: prevOpacity, y: prevY, display: 'block', config} : undefined))
    }

    api.start(i => {
      if (i === index) {
        return { x, rot, scale, opacity: 1, display: 'block', config, immediate: down };
      } else if (i !== currentImageIndex + 1 && i !== currentImageIndex -1) {
          return to(i, currentImageIndex);
      }
      return undefined;
    });
  }, { filterTaps: true, threshold: 10 });

  const handleNavNext = useCallback(() => {
    if (currentImageIndex < allVisuals.length - 1 && api) {
        gone.current.add(currentImageIndex);
        api.start(i => (i === currentImageIndex ? to(i, currentImageIndex, true, -1) : undefined));
        setTimeout(() => setCurrentImageIndex(curr => curr + 1), 50);
    }
  }, [currentImageIndex, allVisuals.length, api, to]);

  const handleNavPrevious = useCallback(() => {
    if (currentImageIndex > 0 && api) {
        const targetPrevIndex = currentImageIndex - 1;
        gone.current.delete(targetPrevIndex);
        api.start(i => (i === currentImageIndex ? { ...to(i, currentImageIndex, true, 1), onRest: () => {
            setCurrentImageIndex(targetPrevIndex);
        }} : (i === targetPrevIndex ? { ...to(i, targetPrevIndex), x:0, y:0, rot:0, scale:1, opacity:1, display:'block', delay: 50, config: springConfigBase } : undefined) ));
    }
  }, [currentImageIndex, api, allVisuals.length, to]);


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
        if (opacity > 0) contentElement.style.display = 'block'; else contentElement.style.display = 'none';
     } catch(error) { console.error("Content visibility error", error)}
  }, []);

  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    if (isImageDragging) {
        console.log("PanelTouchStart: Blocked by active image drag/swipe");
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
  }, [isInfoVisible, isImageDragging]);

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
        if (panelRef.current) {
            panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
            panelRef.current.style.visibility = 'visible';
            requestAnimationFrame(() => {
                if (panelRef.current) panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
            });
        }
    } else if (!isOpen) {
        setPanelTranslateY(null); setIsInfoVisible(false);
        if (panelRef.current) panelRef.current.style.transition = 'none';
    }
  }, [isOpen, isMounted, initialCollapsedY]);

  useEffect(() => {
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    const currentNextForPreload = allVisuals.length > 0 ? (currentImageIndex + 1) % allVisuals.length : 0;
    const currentPrevForPreload = allVisuals.length > 0 ? (currentImageIndex - 1 + allVisuals.length) % allVisuals.length : 0;

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
            const priorityIndices = [...new Set([currentImageIndex, currentNextForPreload, currentPrevForPreload])];
            await Promise.all(priorityIndices.map(idx => allVisuals[idx] ? preloadImage(allVisuals[idx]) : Promise.resolve()));
            const otherImages = allVisuals.filter((_, i) => !priorityIndices.includes(i));
            Promise.all(otherImages.map(src => src ? preloadImage(src) : Promise.resolve()));
        } catch (error) { console.error("Preload error:", error); }
    };
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, isMounted, imagesLoaded]);

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
  const panelTransform = panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : (initialCollapsedY !== null ? `translateY(${initialCollapsedY}px)` : `translateY(calc(100% - ${GRIP_HEIGHT_COLLAPSED}))`);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby={isInfoVisible ? undefined : `modal-title-${project.id}`}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
            <button onClick={onClose} className="text-gray-700 rounded-full p-2 active:bg-gray-200 shrink-0" aria-label="Fermer"><X size={24} /></button>
            <h2 id={`modal-title-${project.id}`} className="flex-1 text-center text-black text-[1.6rem] font-poppins font-medium truncate mx-4">{project.title}</h2>
            <div className="w-8 h-8 shrink-0"></div>
        </div>

        {/* Conteneur principal pour images ET dots */}
        <div className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden flex items-center justify-center"
             style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties}
        >
            {/* Image Stack avec react-spring */}
            <div className="relative w-full h-full max-w-md aspect-[3/4]">
                {springProps.map(({ x, y, rot, scale, opacity, display, zIndex }, i) => (
                    <animated.div
                        key={allVisuals[i] ? allVisuals[i] : `card-${i}`}
                        className="absolute w-full h-full cursor-grab active:cursor-grabbing"
                        style={{
                            display,
                            opacity,
                            transform: interpolate([x, y, rot, scale], (xVal, yVal, rVal, sVal) =>
                                `perspective(1500px) translateX(${xVal}px) translateY(${yVal}px) rotateZ(${rVal}deg) scale(${sVal})`
                            ),
                            touchAction: 'none',
                            zIndex,
                        }}
                        {...bind(i)}
                    >
                        {allVisuals[i] && (
                            <Image
                                src={allVisuals[i]}
                                alt={`Image ${i + 1} du projet ${project.title}`}
                                fill
                                className="object-contain rounded-lg shadow-md pointer-events-none"
                                sizes="100vw"
                                priority={i === currentImageIndex}
                                draggable="false"
                            />
                        )}
                    </animated.div>
                ))}
            </div>

            {/* Pagination indicators */}
            {allVisuals.length > 1 && (
                <div
                    className={`absolute left-1/2 -translate-x-1/2 flex justify-center pointer-events-none transition-opacity duration-300 z-[35] ${isInfoVisible || isImageDragging || isDraggingPanel ? 'opacity-0' : 'opacity-100'}`}
                    style={{ bottom: '1rem' }}
                    aria-label="Indicateurs d'image"
                    aria-hidden={isInfoVisible || isImageDragging || isDraggingPanel}
                >
                    <div className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full pointer-events-auto">
                        {allVisuals.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (idx !== currentImageIndex) {
                                        if (idx > currentImageIndex) {
                                            for (let k = currentImageIndex; k < idx; k++) { if (k !== currentImageIndex) gone.current.add(k); }
                                        } else {
                                            for (let k = idx + 1; k <= currentImageIndex; k++) { gone.current.add(k); }
                                            gone.current.delete(idx);
                                        }
                                        setCurrentImageIndex(idx);
                                    }
                                }}
                                className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                                aria-label={`Aller à l'image ${idx + 1}`}
                                aria-current={currentImageIndex === idx ? "step" : undefined}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>


        {/* Nav Buttons */}
        {allVisuals.length > 1 && !isImageDragging && !isDraggingPanel && (
            <>
                <button onClick={handleNavPrevious} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Précédent" style={{ transform: 'translateY(-50%)' }}> <ChevronLeft size={24} /> </button>
                <button onClick={handleNavNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" aria-label="Suivant" style={{ transform: 'translateY(-50%)' }}> <ChevronRight size={24} /> </button>
            </>
        )}

        {/* Info Panel */}
        <div ref={panelRef}
             className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none`}
             style={{
                 height: GRIP_HEIGHT_EXPANDED,
                 maxHeight: GRIP_HEIGHT_EXPANDED,
                 transform: panelTransform,
                 zIndex: 30,
                 visibility: isMounted && initialCollapsedY !== null ? 'visible' : 'hidden',
             }}
             aria-hidden={!isInfoVisible}
             onTouchStart={handlePanelTouchStart}
             onTouchMove={handlePanelTouchMove}
             onTouchEnd={handlePanelTouchEnd}
        >
            <div ref={gripRef}
                 className="w-full flex flex-col items-center justify-center pointer-events-none px-4"
                 style={{ height: GRIP_HEIGHT_COLLAPSED }}
            >
                <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-2 shrink-0"></div>
                {!isInfoVisible && (
                    <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider leading-tight">
                        Description
                    </span>
                )}
            </div>
            <div className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto"
                 style={{
                     height: `calc(100% - ${GRIP_HEIGHT_COLLAPSED})`,
                     maxHeight: `calc(100% - ${GRIP_HEIGHT_COLLAPSED})`,
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
