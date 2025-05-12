// project-modal.tsx - Merged and Refined Version
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

const GRIP_HEIGHT_COLLAPSED = '10vh'; // Reduced grip height
const GRIP_HEIGHT_EXPANDED = '75vh'; // Max height when expanded
const PANEL_ANIMATION_DURATION = 400; // ms
const CONTENT_FADE_DURATION = 300; // ms (slightly faster than panel)

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals], [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // Modal open/close animation
  const [isInfoVisible, setIsInfoVisible] = useState(false); // Panel expanded state

  // Image Stack & Swipe States
  const [nextImageIndex, setNextImageIndex] = useState(allVisuals.length > 1 ? 1 : 0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [currentTouchX, setCurrentTouchX] = useState<number | null>(null);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [swipeRotation, setSwipeRotation] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({}); // From User's version

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null); // Top image
  const nextImageRef = useRef<HTMLDivElement>(null); // Image behind
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);
  const imageColumnRef = useRef<HTMLDivElement>(null); // Desktop
  const descriptionColumnRef = useRef<HTMLDivElement>(null); // Desktop

  const isMobile = useIsMobile();

  // Panel Drag States
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [panelTranslateY, setPanelTranslateY] = useState<number | null>(null); // Tracks panel Y transform
  const panelInitialY = useRef<number>(0);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);

  // Environment Detection
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBrowserEnvironment, setIsBrowserEnvironment] = useState(false);

  useEffect(() => {
    setIsBrowserEnvironment(typeof window !== 'undefined');
    setIsInitialized(true);
  }, []);

  // Reset on project change or close
  useEffect(() => {
    setCurrentImageIndex(0);
    setNextImageIndex(allVisuals.length > 1 ? 1 : 0);
    setIsInfoVisible(false);
    setPanelTranslateY(null);
    resetSwipeState();
    setIsAnimating(false);
    setImagesLoaded({}); // Reset loaded images state
    // Reset panel position visually if closing
    if (!isOpen && isMobile && panelRef.current) {
        panelRef.current.style.transform = `translateY(calc(100% - ${GRIP_HEIGHT_COLLAPSED}))`;
        panelRef.current.style.transition = 'none';
    }
  }, [project, isOpen, isMobile, allVisuals.length]); // Dependencies updated

  // Calculate adjacent indices (needed for preloading)
   const prevIndex = useMemo(() =>
    (currentImageIndex - 1 + allVisuals.length) % allVisuals.length,
    [currentImageIndex, allVisuals.length]
  );

  // --- Comprehensive Image Preloading (from User's version) ---
  useEffect(() => {
    if (!isBrowserEnvironment || !isOpen || !allVisuals?.length) return;

    const preloadImage = (src: string): Promise<void> => {
       // Avoid reloading if already loaded according to state
       if (imagesLoaded[src]) {
           return Promise.resolve();
       }
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          setImagesLoaded(prev => ({ ...prev, [src]: true }));
          resolve();
        };
        img.onerror = () => {
          console.error(`Erreur lors du chargement de l'image: ${src}`);
          // Mark as loaded even on error to prevent infinite retries? Or handle differently?
          // setImagesLoaded(prev => ({ ...prev, [src]: false })); // Mark as failed?
          resolve(); // Resolve anyway
        };
        img.src = src;
      });
    };

    const preloadAllImages = async () => {
      try {
        // Prioritize current, next, and previous
        const priorityIndices = [
            currentImageIndex,
            nextIndex,
            prevIndex
        ].filter((value, index, self) => self.indexOf(value) === index); // Unique indices

        await Promise.all(priorityIndices.map(idx => allVisuals[idx] ? preloadImage(allVisuals[idx]) : Promise.resolve()));

        // Preload the rest in the background
        const otherImages = allVisuals.filter((_, i) => !priorityIndices.includes(i));
        // Don't wait for these secondary images
        Promise.all(otherImages.map(src => src ? preloadImage(src) : Promise.resolve()));

      } catch (error) {
        console.error("Erreur lors du préchargement des images:", error);
      }
    };

    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, nextIndex, prevIndex, isBrowserEnvironment, imagesLoaded]); // Added imagesLoaded


  // --- Desktop Height Sync (Unchanged from Claude's) ---
  useEffect(() => {
    if (!isBrowserEnvironment || !isOpen || isMobile) {
        if (descriptionColumnRef.current) descriptionColumnRef.current.style.maxHeight = '';
        return;
    };
    const adjustHeight = () => { /* ... */ }; // (Implementation as before)
    const timerId = setTimeout(adjustHeight, 150);
    window.addEventListener('resize', adjustHeight);
    return () => { /* ... cleanup ... */ };
  }, [isOpen, isMobile, currentImageIndex, isBrowserEnvironment]);


  // --- Modal Open/Close Animation & Initial Panel Position ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isOpen) {
      // Set initial collapsed panel state for mobile immediately
      if (isMobile && panelRef.current) {
        const gripHeightPx = window.innerHeight * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        // Calculate based on expected full height
        const collapsedPosition = window.innerHeight * parseFloat(GRIP_HEIGHT_EXPANDED) / 100 - gripHeightPx;
        setPanelTranslateY(collapsedPosition);
        panelRef.current.style.transform = `translateY(${collapsedPosition}px)`;
        panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`; // Ensure transition is set
      }
       timeoutId = setTimeout(() => setIsAnimating(true), 10); // Trigger modal fade-in
    } else {
      setIsAnimating(false);
    }
     return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [isOpen, isMobile]); // Removed panelRef from dependencies


  // --- Prevent Background Scroll (Unchanged from Claude's) ---
  useEffect(() => {
    if (!isBrowserEnvironment || !isMobile || !isOpen) return;
    const preventDocumentScroll = (e: TouchEvent) => { /* ... */ }; // (Implementation as before)
    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventDocumentScroll);
  }, [isOpen, isMobile, isInfoVisible, isBrowserEnvironment]);


  // --- Desktop Click Outside / Keyboard Nav (Unchanged from Claude's) ---
  useEffect(() => { /* ... Click Outside ... */ }, [isOpen, onClose, isBrowserEnvironment, isMobile]);
  useEffect(() => { /* ... Keyboard Nav ... */ }, [isOpen, onClose, allVisuals.length, isBrowserEnvironment, isMobile, handleNext, handlePrevious]); // Added handlers


  // --- Swipe State Reset ---
  const resetSwipeState = useCallback(() => {
    // (Implementation largely from Claude's, resetting imageRef and nextImageRef)
    setTouchStart(null);
    setTouchEnd(null);
    setCurrentTouchX(null);
    setSwipeDistance(0);
    setSwipeRotation(0);
    setIsSwiping(false);
    setSwipeDirection(null);

    requestAnimationFrame(() => { // Ensure resets happen after state update
        if (imageRef.current) {
            imageRef.current.style.transform = 'translateX(0px) rotate(0deg)';
            imageRef.current.style.opacity = '1';
            imageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            imageRef.current.style.transformOrigin = 'center center';
            imageRef.current.style.zIndex = '10';
        }
        if (nextImageRef.current) {
            nextImageRef.current.style.transform = 'scale(0.95) translateY(8px)'; // Initial behind state
            nextImageRef.current.style.opacity = '0.7';
            nextImageRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
            nextImageRef.current.style.zIndex = '5';
        }
    });
  }, []);


  // --- Image Navigation Handlers ---
  const handleNext = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex + 1) % allVisuals.length;
    setCurrentImageIndex(newIndex);
    setNextImageIndex((newIndex + 1) % allVisuals.length);
    // Resetting state is now handled within onTouchEnd or directly after button click
    // resetSwipeState(); // Maybe not needed here if called after animation
  }, [currentImageIndex, allVisuals.length, isSwiping]);


  const handlePrevious = useCallback(() => {
    if (allVisuals.length <= 1 || isSwiping) return;
    const newIndex = (currentImageIndex - 1 + allVisuals.length) % allVisuals.length;
    setCurrentImageIndex(newIndex);
    setNextImageIndex((newIndex + 1) % allVisuals.length); // next is always +1
    // resetSwipeState(); // Maybe not needed here
  }, [currentImageIndex, allVisuals.length, isSwiping]);


  // --- Calculate Swipe Animation (Claude's 2-card logic) ---
  const calculateSwipeAnimation = useCallback((currentX: number, startX: number) => {
    if (!imageRef.current || !nextImageRef.current || !isSwiping) return;
    try {
      // (Implementation from Claude's version, animating imageRef and nextImageRef)
      const distance = currentX - startX;
      const screenWidth = window.innerWidth;
      const rotationFactor = 0.08;
      const rotation = distance * rotationFactor;
      const maxRotation = 20;
      const clampedRotation = Math.max(-maxRotation, Math.min(maxRotation, rotation));
      const opacity = 1 - Math.min(0.5, Math.abs(distance) / (screenWidth * 0.6));

      setSwipeDistance(distance);
      setSwipeRotation(clampedRotation);
      setSwipeDirection(distance > 0 ? 'right' : (distance < 0 ? 'left' : null));

      imageRef.current.style.transform = `translateX(${distance}px) rotate(${clampedRotation}deg)`;
      imageRef.current.style.opacity = opacity.toString();
      imageRef.current.style.transition = 'none';
      imageRef.current.style.transformOrigin = distance > 0 ? 'bottom left' : 'bottom right';
      imageRef.current.style.zIndex = '10';

      const nextImageProgress = Math.min(1, Math.abs(distance) / (screenWidth * 0.35)); // Adjust sensitivity
      const nextScale = 0.95 + (0.05 * nextImageProgress);
      const nextTranslateY = 8 - (8 * nextImageProgress);
      const nextOpacity = 0.7 + (0.3 * nextImageProgress);

      nextImageRef.current.style.transform = `scale(${nextScale}) translateY(${nextTranslateY}px)`;
      nextImageRef.current.style.opacity = nextOpacity.toString();
      nextImageRef.current.style.transition = 'none';
      nextImageRef.current.style.zIndex = '5';

    } catch (error) { console.error("Erreur calculateSwipeAnimation:", error); }
  }, [isSwiping]);


  // --- Touch Handlers for Swipe (Claude's logic) ---
  const minSwipeDistance = 80;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
      // Prevent swipe if touching panel or only one image
    if (panelRef.current?.contains(e.target as Node) || allVisuals.length <= 1) return;
    // Prevent swipe if panel is being dragged
     if (isDraggingPanel) return;

    try {
        setTouchEnd(null);
        const startX = e.targetTouches[0].clientX;
        setTouchStart(startX);
        setCurrentTouchX(startX);
        setIsSwiping(true);
        if (imageRef.current) imageRef.current.style.transition = 'none';
        if (nextImageRef.current) nextImageRef.current.style.transition = 'none';
    } catch (error) { console.error("Erreur onTouchStart:", error); setIsSwiping(false); }
  }, [allVisuals.length, isDraggingPanel]); // Added isDraggingPanel


  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null || !isSwiping || isDraggingPanel) return; // Also check isDraggingPanel

    try {
      const currentX = e.targetTouches[0].clientX;
      const deltaX = Math.abs(currentX - (currentTouchX ?? currentX));
      setCurrentTouchX(currentX);

      // Prevent vertical scroll only if significant horizontal movement
       if (deltaX > Math.abs(e.targetTouches[0].clientY - (touchStart ?? 0)) && deltaX > 5 && e.cancelable) {
         e.preventDefault();
       }

      setTouchEnd(currentX);
      calculateSwipeAnimation(currentX, touchStart);
    } catch (error) { console.error("Erreur onTouchMove:", error); resetSwipeState(); }
  }, [touchStart, isSwiping, currentTouchX, calculateSwipeAnimation, resetSwipeState, isDraggingPanel]); // Added isDraggingPanel


 const onTouchEnd = useCallback(() => {
    if (!touchStart || !isSwiping) {
        // If not swiping but touch ended, ensure reset just in case
        if (!isSwiping) resetSwipeState();
        return;
    }

    const finalDistance = (touchEnd ?? touchStart) - touchStart;
    const isLeftSwipe = finalDistance < -minSwipeDistance;
    const isRightSwipe = finalDistance > minSwipeDistance;

    // Indicate swiping finished before triggering state changes
    setIsSwiping(false); // Set immediately

    try {
        const swipeAnimDuration = 350; // ms
        const transitionCurve = 'cubic-bezier(0.175, 0.885, 0.32, 1.175)';
        const transitionStyle = `transform ${swipeAnimDuration}ms ${transitionCurve}, opacity ${swipeAnimDuration}ms ease-out`;

        if (imageRef.current) imageRef.current.style.transition = transitionStyle;
        if (nextImageRef.current) nextImageRef.current.style.transition = transitionStyle;

        if (isLeftSwipe) {
            if(imageRef.current) {
                const finalRotation = -Math.max(15, Math.abs(swipeRotation * 1.2));
                imageRef.current.style.transform = `translateX(-120%) rotate(${finalRotation}deg) scale(0.9)`;
                imageRef.current.style.opacity = '0';
            }
            if(nextImageRef.current) {
                 nextImageRef.current.style.transform = 'scale(1) translateY(0px)';
                 nextImageRef.current.style.opacity = '1';
                 nextImageRef.current.style.zIndex = '15'; // Bring forward definitively
            }
            // Update index *after* animation completes
            setTimeout(() => {
                handleNext();
                // Crucially reset transforms AFTER state update causes re-render
                 resetSwipeState();
            }, swipeAnimDuration);

        } else if (isRightSwipe) {
            if(imageRef.current) {
                const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.2));
                imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.9)`;
                imageRef.current.style.opacity = '0';
            }
            // For right swipe (previous), just reset next image, don't animate it in
            if(nextImageRef.current) {
                 nextImageRef.current.style.transform = 'scale(0.95) translateY(8px)';
                 nextImageRef.current.style.opacity = '0.7';
            }
             // Update index *after* animation completes
             setTimeout(() => {
                handlePrevious();
                 // Reset transforms AFTER state update
                 resetSwipeState();
            }, swipeAnimDuration);

        } else {
            // Not enough swipe, animate back to center
            resetSwipeState(); // This handles the animation back
        }
    } catch (error) {
        console.error("Erreur onTouchEnd:", error);
        resetSwipeState(); // Ensure reset on error
    } finally {
       // Reset touch tracking states whether swipe was successful or not
        setTouchStart(null);
        setTouchEnd(null);
        setCurrentTouchX(null);
        // isSwiping already set to false above
    }
  }, [touchStart, touchEnd, isSwiping, swipeRotation, minSwipeDistance, handleNext, handlePrevious, resetSwipeState]);


  // --- Panel Drag Calculation & Content Visibility (Claude's logic) ---
  const calculatePanelY = useCallback((deltaY: number): number => {
    const initialPos = panelInitialY.current;
    let newY = initialPos + deltaY;

    // Calculate bounds based on viewport height and grip/expanded constants
    const vh = window.innerHeight;
    const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
    const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;

    // Collapsed state means bottom of panel is visible by gripHeightPx
    // TranslateY = fullPanelHeight - gripHeightPx
    const collapsedY = expandedHeightPx - gripHeightPx; // Assuming panel height IS expandedHeightPx

    // Expanded state means top of panel is at or near top of viewport (translateY ~ 0)
    const expandedY = 0;

    // Clamp position, allow slight overdrag (e.g., 50px)
    const minY = expandedY - 50;
    const maxY = collapsedY + 50;

    return Math.max(minY, Math.min(maxY, newY));
  }, []);


  const updateContentVisibility = useCallback((currentY: number | null) => {
    if (currentY === null || !panelRef.current) return;
     try {
        const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
        if (!contentElement) return;

        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const collapsedY = expandedHeightPx - gripHeightPx;
        const expandedY = 0;
        const totalTravel = collapsedY - expandedY;

        if (totalTravel <= 0) return;

        const progress = Math.max(0, Math.min(1, (currentY - expandedY) / totalTravel));
        const opacity = 1 - progress;

        // Apply opacity directly during drag
        contentElement.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
         // Keep display: block during drag if it might become visible
         if (opacity > 0) contentElement.style.display = 'block';

     } catch(error) { console.error("Error updating content visibility", error)}
  }, []);


  // --- Panel Touch Handlers (Claude's logic, adjusted fade) ---
  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    // Only allow drag initiation on the grip itself
    if (!(gripRef.current?.contains(e.target as Node))) return;
     // Prevent panel drag if image swiping is in progress
     if (isSwiping) return;

    try {
        e.stopPropagation();
        setDragStartY(e.touches[0].clientY);
        setIsDraggingPanel(true);

        if (panelRef.current) {
            panelRef.current.style.transition = 'none';
            const currentTransform = window.getComputedStyle(panelRef.current).transform;
            let currentY = 0;
            if (currentTransform !== 'none') {
                 const matrix = new DOMMatrix(currentTransform);
                 currentY = matrix.m42;
            } else {
                // Fallback calculation if transform is none (might happen initially)
                 const vh = window.innerHeight;
                 const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
                 const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
                 currentY = isInfoVisible ? 0 : expandedHeightPx - gripHeightPx;
            }
            panelInitialY.current = currentY;
            setPanelTranslateY(currentY);

            // Ensure content is display: block at start of drag if opening
            if (!isInfoVisible) {
                 const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
                 if (contentElement) contentElement.style.display = 'block';
            }
        }
    } catch (error) { console.error("Erreur handlePanelTouchStart:", error); setIsDraggingPanel(false); }
  }, [isInfoVisible, isSwiping]); // Added isSwiping


  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY === null || !isDraggingPanel || !panelRef.current) return;

    try {
        e.stopPropagation(); // Prevent image swipe
        // Prevent vertical scroll of page
        if (e.cancelable) e.preventDefault();

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - dragStartY;
        const targetY = calculatePanelY(deltaY);

        panelRef.current.style.transform = `translateY(${targetY}px)`;
        setPanelTranslateY(targetY);
        updateContentVisibility(targetY); // Update opacity during move

    } catch (error) { console.error("Erreur handlePanelTouchMove:", error); setIsDraggingPanel(false); }
  }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);


  const handlePanelTouchEnd = useCallback(() => {
    if (dragStartY === null || !isDraggingPanel || panelTranslateY === null || !panelRef.current) return;

    setIsDraggingPanel(false);
    const deltaY = panelTranslateY - panelInitialY.current;
    const threshold = 60; // Slightly larger threshold

    try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const collapsedY = expandedHeightPx - gripHeightPx;
        const expandedY = 0;

        let targetY: number;
        let shouldBeVisible: boolean;

        if (isInfoVisible) { // Currently open
            shouldBeVisible = deltaY <= threshold; // Stay open unless dragged down enough
        } else { // Currently closed
            shouldBeVisible = deltaY < -threshold; // Open only if dragged up enough
        }

        targetY = shouldBeVisible ? expandedY : collapsedY;

        // Animate panel to final position
        panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        panelRef.current.style.transform = `translateY(${targetY}px)`;
        setPanelTranslateY(targetY);
        setIsInfoVisible(shouldBeVisible); // Update state *after* initiating animation

        // Animate content opacity and set display
        const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
        if (contentElement) {
            contentElement.style.transition = `opacity ${CONTENT_FADE_DURATION}ms ease-out`;
            if (shouldBeVisible) {
                contentElement.style.display = 'block'; // Ensure display first
                requestAnimationFrame(() => { // Then trigger opacity transition
                    contentElement.style.opacity = '1';
                 });
            } else {
                contentElement.style.opacity = '0';
                // Use timeout slightly longer than opacity transition to set display: none
                 setTimeout(() => {
                     // Check state *again* inside timeout in case of rapid interactions
                     if (!isInfoVisible) {
                         contentElement.style.display = 'none';
                     }
                 }, CONTENT_FADE_DURATION + 50); // Add buffer
            }
        }

    } catch (error) { console.error("Erreur handlePanelTouchEnd:", error); }
    finally {
        setDragStartY(null); // Reset drag start state
    }
  }, [dragStartY, isDraggingPanel, panelTranslateY, isInfoVisible]);


  // --- Render Fallback ---
  if (!isInitialized || !isBrowserEnvironment) {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-white z-50"></div>; // White loading bg
  }

  if (!isOpen) return null;


  // --- RENDER ---
  if (isMobile) {
    // --- MOBILE VERSION ---
    const collapsedGripVisibleHeight = `calc(${GRIP_HEIGHT_COLLAPSED} + 0px)`;

    return (
      // White bg, disable text select
      <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-title-${project.id}`}>

        {/* --- Top Bar --- */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
            <button onClick={onClose} className="text-gray-700 rounded-full p-2 active:bg-gray-200" aria-label="Fermer">
                <X size={24} />
            </button>
            {/* Title removed from here */}
            <div className="w-8 h-8"></div> {/* Spacer */}
        </div>


        {/* --- Image Stack Container --- */}
        <div
          className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden"
           style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties}
           onTouchStart={onTouchStart}
           onTouchMove={onTouchMove}
           onTouchEnd={onTouchEnd}
         >
             {/* --- Next Image (Behind) --- */}
            {allVisuals.length > 1 && (
                 <div
                    ref={nextImageRef}
                    className="absolute inset-0 flex items-center justify-center will-change-transform"
                    style={{
                         transform: 'scale(0.95) translateY(8px)', // Initial state
                         opacity: 0.7,
                         zIndex: 5,
                    }}
                 >
                     {allVisuals[nextImageIndex] && ( // Check if image source exists
                        <Image
                            key={allVisuals[nextImageIndex]} // Key helps React update
                            src={allVisuals[nextImageIndex]}
                            alt={`Aperçu image ${nextImageIndex + 1}`}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            loading="lazy"
                        />
                     )}
                 </div>
             )}

            {/* --- Current Image (Top) --- */}
             <div
                 ref={imageRef}
                 className="absolute inset-0 flex items-center justify-center will-change-transform"
                 style={{ zIndex: 10 }}
             >
                 {allVisuals[currentImageIndex] && ( // Check if image source exists
                     <Image
                        key={allVisuals[currentImageIndex]}
                        src={allVisuals[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority={true}
                     />
                 )}
             </div>
         </div>


        {/* --- Navigation Buttons --- */}
        {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && ( // Hide if swiping or dragging panel
          <>
            <button
              onClick={() => { handlePrevious(); resetSwipeState(); }} // Trigger reset immediately on click
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20"
              aria-label="Image précédente"
              style={{ transform: 'translateY(-50%)' }}
             >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => { handleNext(); resetSwipeState(); }} // Trigger reset immediately on click
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20"
              aria-label="Image suivante"
              style={{ transform: 'translateY(-50%)' }}
             >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* --- Pagination Dots --- */}
        {allVisuals.length > 1 && (
          <div
            className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} // Hide if panel open/swiping/dragging
             style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }}
            aria-label="Indicateurs d'images"
            aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}
          >
             {/* (Dots implementation as before) */}
             <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full">
               {allVisuals.map((_, idx) => ( /* ... button ... */ ))}
            </div>
          </div>
        )}


        {/* --- Information Panel --- */}
        <div
          ref={panelRef}
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl transform will-change-transform`}
          style={{
            height: GRIP_HEIGHT_EXPANDED, // Use fixed height for calculation
            maxHeight: GRIP_HEIGHT_EXPANDED,
            transform: panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : `translateY(calc(100% - ${GRIP_HEIGHT_COLLAPSED}))`, // Apply state or initial calc
            zIndex: 30,
          }}
          aria-hidden={!isInfoVisible}
         >
          {/* --- Grip Handle --- */}
          <div
            ref={gripRef}
            className="w-full flex flex-col items-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none" // touch-none essential
            style={{ minHeight: GRIP_HEIGHT_COLLAPSED }} // Define touch area height
            onTouchStart={handlePanelTouchStart}
            onTouchMove={handlePanelTouchMove}
            onTouchEnd={handlePanelTouchEnd}
          >
            <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-3 shrink-0"></div> {/* Grip line */}
             {/* Conditional Title/Text (Claude's cleaner approach) */}
             <div className="flex-grow flex items-center justify-center w-full px-4 overflow-hidden">
                 {isInfoVisible ? (
                     <h2 id={`modal-title-${project.id}`} className="font-great-vibes text-2xl text-gray-800 text-center truncate">
                        {project.title}
                     </h2>
                 ) : (
                      <span className="font-poppins text-xs font-semibold text-gray-500 uppercase tracking-wider">
                         Description
                      </span>
                 )}
             </div>
          </div>

          {/* --- Panel Content --- */}
          <div
            className="panel-content px-5 pb-5 overflow-y-auto"
            style={{
               height: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`, // Precise height calc
               maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`,
               display: isInfoVisible ? 'block' : 'none', // Controlled by state/animation
               opacity: isInfoVisible ? 1 : 0, // Controlled by state/animation
               // Transition managed in handlePanelTouchEnd
            }}
           >
             {/* (Content rendering as before) */}
             <div className="space-y-4">
                 {/* ... paragraphs ... */}
             </div>
             {project.link && ( /* ... link ... */)}
             <div className="h-10"></div> {/* Bottom padding */}
          </div>
        </div>

      </div> // End Mobile Wrapper
    );
  } else {
    // --- DESKTOP VERSION (Unchanged from Claude's/Previous) ---
    return ( /* ... Desktop JSX ... */ );
  }
}