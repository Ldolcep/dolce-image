// ========================================================================
// === ProjectModalMobile.tsx - V0.24a - VERSION INTÉGRALE RESTAURÉE ===
// ========================================================================
"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSprings, animated, SpringConfig } from '@react-spring/web'
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
// MIN_SWIPE_DISTANCE sera géré par useDrag (threshold)

interface ProjectModalMobileProps {
  project: Project
  isOpen: boolean
  onClose: () => void
}

const springConfigBase: SpringConfig = {
  tension: 300,
  friction: 30,
};
const springConfigActive: SpringConfig = {
  tension: 800,
  friction: 40,
  immediate: true, // Mouvement direct pendant le drag
};
const springConfigSwipeOut: SpringConfig = {
    tension: 200,
    friction: 22,
    // clamp: true // Évite les oscillations excessives lors du swipe out
};


export default function ProjectModalMobile({ project, isOpen, onClose }: ProjectModalMobileProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [panelTranslateY, setPanelTranslateY] = useState<number | null>(null);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const panelInitialY = useRef<number>(0);
  const windowWidth = useRef(typeof window !== 'undefined' ? window.innerWidth : 300);
  const gone = useRef(new Set<number>()); // Garde une trace des cartes qui ont été swipées


  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        windowWidth.current = window.innerWidth;
    }
  }, []);

  // Réinitialiser 'gone' lorsque le projet ou le nombre d'images change
  useEffect(() => {
    console.log("ProjectModalMobile: Resetting 'gone' set due to project/allVisuals change.");
    gone.current = new Set();
    // On réinitialise aussi les springs pour que toutes les cartes soient prêtes
    if (api) { // api peut ne pas être défini au premier rendu si allVisuals est initialement vide
        api.start(i => to(i, 0, true)); // Repositionne toutes les cartes à leur état initial pour le nouvel ensemble
    }
  }, [project, allVisuals.length]); // Ajouter api plus tard si nécessaire après sa définition


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

  // --- Logique des Springs pour les Cartes ---
  // Fonction pour déterminer les props de style pour chaque carte
  const to = (i: number, activeIndex: number = currentImageIndex, isReset: boolean = false) => {
    if (gone.current.has(i) && !isReset) { // Si la carte est "partie" et qu'on ne fait pas un reset global
        return { x: (allVisuals.length + 5) * windowWidth.current * (i < activeIndex ? -1 : 1), y:0, scale: 0.8, rotateZ: 0, opacity: 0, display: 'none', config: springConfigSwipeOut, immediate: true };
    }
    const x = 0; // Les cartes sont superposées, x est contrôlé par le drag
    const y = 0; // Peut être utilisé pour un effet de pile si désiré (ex: i * -4)
    let scale = 1;
    let opacity = 0;
    let display = 'none';
    let zIndex = 0;

    if (i === activeIndex) { // Carte actuelle
      scale = 1;
      opacity = 1;
      display = 'block';
      zIndex = allVisuals.length;
    } else if (i === activeIndex + 1) { // Prochaine carte (effet de pile)
      scale = 0.95;
      opacity = 0.7;
      display = 'block';
      zIndex = allVisuals.length - 1;
    } else if (i === activeIndex -1 && activeIndex > 0) { // Carte précédente (si on voulait un effet de pile arrière)
        // Pour l'instant, on ne la montre pas activement en pile arrière
        scale = 0.85;
        opacity = 0;
        display = 'none';
        zIndex = allVisuals.length -2;
    }
    else { // Autres cartes
        scale = 0.85;
        opacity = 0;
        display = 'none';
        zIndex = allVisuals.length - Math.abs(i - activeIndex);
    }
    return { x, y, scale, rotateZ: 0, opacity, display, zIndex, config: springConfigBase, delay: isReset ? 0 : (i === activeIndex ? 100: 0) };
  };

  const [springProps, api] = useSprings(allVisuals.length, i => ({ ...to(i, currentImageIndex, true) }));

  // Mettre à jour les springs quand currentImageIndex change
  useEffect(() => {
    if (isMounted && api) { // S'assurer que api est défini
        api.start(i => to(i, currentImageIndex));
    }
  }, [currentImageIndex, api, isMounted]); // Retiré allVisuals.length car déjà géré par le reset de `gone`


  // --- Gestion du Drag avec useDrag ---
  const bind = useDrag(({ args: [index], active, movement: [mx], direction: [xDir], velocity: [vx], down, distance, cancel }) => {
    if (!isMounted || isDraggingPanel) {
        if (cancel) cancel();
        return;
    }

    const triggerDistance = windowWidth.current / 3; // Seuil de distance pour valider le swipe
    const triggerVelocity = 0.2; // Seuil de vélocité

    // Si l'utilisateur relâche
    if (!active) {
        // Si le swipe est assez rapide OU a dépassé le seuil de distance
        if (Math.abs(mx) > triggerDistance || vx > triggerVelocity) {
            const dir = xDir < 0 ? -1 : 1; // -1 for left, 1 for right

            // Swipe vers la gauche (vers image suivante)
            if (dir === -1 && currentImageIndex < allVisuals.length - 1) {
                console.log("Swipe Left Validated for index:", index);
                gone.current.add(index);
                setCurrentImageIndex(i => i + 1);
            }
            // Swipe vers la droite (vers image précédente)
            else if (dir === 1 && currentImageIndex > 0) {
                console.log("Swipe Right Validated for index:", index);
                gone.current.add(index);
                setCurrentImageIndex(i => i - 1);
            }
            // Si swipe invalide (aux bords ou pas assez fort), la carte retourne à sa place
            else {
                console.log("Swipe Invalid or at edge, snapping back index:", index);
                api.start(i => (i === index ? to(i, currentImageIndex) : undefined));
            }
        } else {
            // Pas assez de mouvement/vélocité, snap back
            console.log("Swipe not triggered (thresholds), snapping back index:", index);
            api.start(i => (i === index ? to(i, currentImageIndex) : undefined));
        }
        return; // Fin de la logique pour !active
    }

    // Pendant le drag (active est true)
    // Seule la carte actuelle (currentImageIndex) peut être draguée
    if (index !== currentImageIndex) {
        if (cancel) cancel(); // Empêche le drag des cartes en arrière-plan
        return;
    }

    const x = mx;
    const rotateZ = mx / 10; // Rotation proportionnelle au mouvement
    const scale = 1.05; // Agrandir légèrement la carte draguée
    const config = springConfigActive;

    // Animer la carte suivante pour qu'elle se prépare
    if (index + 1 < allVisuals.length) {
        const nextCardIndex = index + 1;
        const progress = Math.min(1, Math.abs(mx) / (windowWidth.current * 0.5)); // Plus sensible
        const nextScale = 0.95 + (0.05 * progress);
        const nextOpacity = 0.7 + (0.3 * progress);
        api.start(i => (i === nextCardIndex ? { scale: nextScale, opacity: nextOpacity, display: 'block', config } : undefined));
    }


    api.start(i => {
      if (i === index) { // Carte en cours de drag
        return { x, rotateZ, scale, opacity: 1, display: 'block', config, immediate: down };
      }
      return undefined; // Ne pas toucher aux autres cartes pendant le drag de l'actuelle (sauf la suivante gérée au-dessus)
    });
  });

  const handleNavNext = useCallback(() => {
    if (currentImageIndex < allVisuals.length - 1) {
        gone.current.add(currentImageIndex);
        setCurrentImageIndex(i => i + 1);
    }
  }, [currentImageIndex, allVisuals.length]);

  const handleNavPrevious = useCallback(() => {
    if (currentImageIndex > 0) {
        // Pour la navigation par bouton, on peut simuler que la carte est partie
        // en la déplaçant rapidement, ou juste la cacher.
        // Ici, on change juste l'index, et le useEffect s'occupe du reste.
        // Il faudra peut-être marquer l'ancienne carte comme "gone" pour la cohérence.
        // Cependant, l'effet actuel ne regarde `gone` que pour celles < currentImageIndex.
        // Pour la simplicité, on change juste l'index.
        api.start(i => (i === currentImageIndex ? {x: windowWidth.current * 1.5, opacity: 0, display: 'none', config: springConfigSwipeOut, onRest: () => setCurrentImageIndex(prev => prev -1)} : undefined));
        // Alternative plus simple: setCurrentImageIndex(i => i - 1); // Le useEffect fera le reste
    }
  }, [currentImageIndex, api, allVisuals.length]);


  // --- Logique pour le panneau ---
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
  useEffect(() => { // Init panel on open
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

  useEffect(() => { // Reset on project change
    if (isOpen) {
        setCurrentImageIndex(0); // Déclenchera le useEffect de useSprings
        gone.current = new Set(); // Important de reset 'gone' aussi
        setImagesLoaded({}); setIsInfoVisible(false);
        if(isMounted && initialCollapsedY !== null) {
             setPanelTranslateY(initialCollapsedY);
             if(panelRef.current) {
                 panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
                 panelRef.current.style.visibility = 'visible';
             }
        }
    }
  }, [project, isOpen, isMounted, initialCollapsedY]); // allVisuals.length et resetSwipeState retirés car gérés par le spring

  useEffect(() => { // Image Preloading
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
            const priorityIndices = [...new Set([currentImageIndex, nextIndex, prevIndex])];
            await Promise.all(priorityIndices.map(idx => allVisuals[idx] ? preloadImage(allVisuals[idx]) : Promise.resolve()));
            const otherImages = allVisuals.filter((_, i) => !priorityIndices.includes(i));
            Promise.all(otherImages.map(src => src ? preloadImage(src) : Promise.resolve()));
        } catch (error) { console.error("Preload error:", error); }
    };
    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isMounted, imagesLoaded]);

  useEffect(() => { // Prevent Background Scroll
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
            <div className="relative w-full h-full max-w-md aspect-[3/4]"> {/* Ajustez max-w et aspect-ratio si besoin */}
                {springProps.map(({ x, y, rotateZ, scale, opacity, display, zIndex }, i) => (
                    <animated.div
                        key={allVisuals[i] ? allVisuals[i] : i}
                        className="absolute w-full h-full cursor-grab active:cursor-grabbing"
                        style={{
                            display,
                            opacity,
                            transform: x.to((val) => `perspective(1500px) translateX(${val}px) translateY(${y.get()}px) rotateZ(${rotateZ.get()}deg) scale(${scale.get()})`),
                            touchAction: 'none', // Important pour use-gesture
                            zIndex,
                        }}
                        {...bind(i)}
                    >
                        {allVisuals[i] && (
                            <Image
                                src={allVisuals[i]}
                                alt={`Image ${i + 1} du projet ${project.title}`}
                                fill
                                className="object-contain rounded-lg shadow-md pointer-events-none" // pointer-events-none sur l'image pour que le drag soit sur le div
                                sizes="100vw"
                                priority={i === currentImageIndex} // Priorité pour l'image visible
                                draggable="false"
                            />
                        )}
                    </animated.div>
                ))}
            </div>

            {/* Pagination indicators */}
            {allVisuals.length > 1 && (
                <div
                    className={`absolute left-1/2 -translate-x-1/2 flex justify-center pointer-events-none transition-opacity duration-300 z-[35] ${isInfoVisible || isDraggingPanel ? 'opacity-0' : 'opacity-100'}`} // isSwiping est géré par useDrag (active)
                    style={{ bottom: '1rem' }}
                    aria-label="Indicateurs d'image"
                    aria-hidden={isInfoVisible || isDraggingPanel}
                >
                    <div className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full pointer-events-auto">
                        {allVisuals.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (idx !== currentImageIndex) {
                                        for (let k = 0; k < idx; k++) { if (k !== currentImageIndex) gone.current.add(k); } // Marque celles avant la cible comme parties
                                        if (idx < currentImageIndex) { gone.current.delete(idx); } // Si on revient en arrière, la rendre non-gone
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
        {allVisuals.length > 1 && !isDraggingPanel && ( // Condition !isSwiping retirée car gérée par useDrag
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
