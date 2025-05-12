// project-modal.tsx - Merged and Refined Version (Syntax Corrected)
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
        // Use try-catch for safety, although errors here are less likely
        try {
            panelRef.current.style.transform = `translateY(calc(100% - ${GRIP_HEIGHT_COLLAPSED}))`;
            panelRef.current.style.transition = 'none';
        } catch (error) {
             console.error("Error resetting panel style on close:", error);
        }
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
        // Check if window.Image exists for safety (SSR/build edge cases)
        if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
             console.warn("window.Image not available for preloading.");
             resolve();
             return;
        }
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


  // --- Desktop Height Sync ---
  useEffect(() => {
    if (!isBrowserEnvironment || !isOpen || isMobile) {
        try {
            if (descriptionColumnRef.current) descriptionColumnRef.current.style.maxHeight = '';
        } catch (error) {
             console.error("Error resetting description maxHeight:", error);
        }
        return;
    };

    const adjustHeight = () => {
        try {
            if (imageColumnRef.current && descriptionColumnRef.current) {
                const imageHeight = imageColumnRef.current.offsetHeight;
                descriptionColumnRef.current.style.maxHeight = `${imageHeight}px`;
            } else if (descriptionColumnRef.current) {
                descriptionColumnRef.current.style.maxHeight = '';
            }
        } catch (error) {
            console.error("Error adjusting description height:", error);
        }
    };

    const timerId = setTimeout(adjustHeight, 150);
    window.addEventListener('resize', adjustHeight);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener('resize', adjustHeight);
      try {
        if (descriptionColumnRef.current) {
            descriptionColumnRef.current.style.maxHeight = '';
        }
      } catch (error) {
          console.error("Error cleaning up description height sync:", error);
      }
    };
  }, [isOpen, isMobile, currentImageIndex, isBrowserEnvironment]); // currentImageIndex might not be needed


  // --- Modal Open/Close Animation & Initial Panel Position ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (isOpen) {
      // Set initial collapsed panel state for mobile immediately
      if (isMobile && panelRef.current) {
          try {
            const vh = window.innerHeight;
            const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
            // Calculate based on expected full height of the expanded panel
            const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
            const collapsedPosition = expandedHeightPx - gripHeightPx;
            setPanelTranslateY(collapsedPosition);
            panelRef.current.style.transform = `translateY(${collapsedPosition}px)`;
            panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
         } catch (error) {
             console.error("Error setting initial panel position:", error);
         }
      }
       timeoutId = setTimeout(() => setIsAnimating(true), 10); // Trigger modal fade-in
    } else {
      setIsAnimating(false);
    }
     return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [isOpen, isMobile]); // Removed panelRef from dependencies


  // --- Prevent Background Scroll ---
  useEffect(() => {
    if (!isBrowserEnvironment || !isMobile || !isOpen) return;
    const preventDocumentScroll = (e: TouchEvent) => {
        try {
            const target = e.target as Node;
            const panelContent = panelRef.current?.querySelector('.panel-content');
            const isTouchingGrip = gripRef.current?.contains(target);
            const isTouchingPanelContent = panelContent?.contains(target);

            if (isInfoVisible && isTouchingPanelContent) {
                if (panelContent.scrollHeight > panelContent.clientHeight) {
                     return true; // Allow scroll within scrollable content
                }
            }
            // Prevent scroll otherwise
            if (e.cancelable) {
                e.preventDefault();
            }
        } catch (error) {
            console.error("Erreur dans preventDocumentScroll:", error);
        }
    };
    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventDocumentScroll);
  }, [isOpen, isMobile, isInfoVisible, isBrowserEnvironment]);


   // --- Desktop Click Outside ---
   useEffect(() => {
        if (!isBrowserEnvironment || isMobile || !isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            try {
                if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                    onClose();
                }
            } catch (error) {
                console.error("Erreur dans handleClickOutside:", error);
                onClose(); // Close anyway on error
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose, isBrowserEnvironment, isMobile]);


  // --- Desktop Keyboard Nav ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
          onClose();
      } else if (allVisuals.length > 1) {
          if (e.key === "ArrowRight") handleNext();
          if (e.key === "ArrowLeft") handlePrevious();
      }
  }, [isOpen, onClose, allVisuals.length, handleNext, handlePrevious]); // Dependencies included

  useEffect(() => {
      if (!isBrowserEnvironment || isMobile || !isOpen) return;
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBrowserEnvironment, isMobile, isOpen, handleKeyDown]); // handleKeyDown is now stable


  // --- Swipe State Reset ---
  const resetSwipeState = useCallback(() => {
    setTouchStart(null);
    setTouchEnd(null);
    setCurrentTouchX(null);
    setSwipeDistance(0);
    setSwipeRotation(0);
    setIsSwiping(false);
    setSwipeDirection(null);

    requestAnimationFrame(() => { // Ensure resets happen after state update
        try {
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
        } catch (error) {
             console.error("Error resetting swipe styles:", error);
        }
    });
  }, []); // Empty dependency array assumed


  // --- Image Navigation Handlers ---
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
    setNextImageIndex((newIndex + 1) % allVisuals.length); // next is always +1
  }, [currentImageIndex, allVisuals.length, isSwiping]);


  // --- Calculate Swipe Animation (Claude's 2-card logic) ---
  const calculateSwipeAnimation = useCallback((currentX: number, startX: number) => {
    if (!imageRef.current || !nextImageRef.current || !isSwiping) return;
    try {
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

      // Use requestAnimationFrame for smoother visual updates during drag
       requestAnimationFrame(() => {
            if (!imageRef.current || !nextImageRef.current) return; // Check refs again inside rAF
            imageRef.current.style.transform = `translateX(${distance}px) rotate(${clampedRotation}deg)`;
            imageRef.current.style.opacity = opacity.toString();
            imageRef.current.style.transition = 'none';
            imageRef.current.style.transformOrigin = distance > 0 ? 'bottom left' : 'bottom right';
            imageRef.current.style.zIndex = '10';

            const nextImageProgress = Math.min(1, Math.abs(distance) / (screenWidth * 0.35));
            const nextScale = 0.95 + (0.05 * nextImageProgress);
            const nextTranslateY = 8 - (8 * nextImageProgress);
            const nextOpacity = 0.7 + (0.3 * nextImageProgress);

            nextImageRef.current.style.transform = `scale(${nextScale}) translateY(${nextTranslateY}px)`;
            nextImageRef.current.style.opacity = nextOpacity.toString();
            nextImageRef.current.style.transition = 'none';
            nextImageRef.current.style.zIndex = '5';
       });

    } catch (error) { console.error("Erreur calculateSwipeAnimation:", error); }
  }, [isSwiping]);


  // --- Touch Handlers for Swipe ---
  const minSwipeDistance = 80;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (panelRef.current?.contains(e.target as Node) || allVisuals.length <= 1 || isDraggingPanel) return;
    try {
        setTouchEnd(null);
        const startX = e.targetTouches[0].clientX;
        setTouchStart(startX);
        setCurrentTouchX(startX);
        setIsSwiping(true);
        if (imageRef.current) imageRef.current.style.transition = 'none';
        if (nextImageRef.current) nextImageRef.current.style.transition = 'none';
    } catch (error) { console.error("Erreur onTouchStart:", error); setIsSwiping(false); }
  }, [allVisuals.length, isDraggingPanel]);


  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart === null || !isSwiping || isDraggingPanel) return;
    try {
      const currentX = e.targetTouches[0].clientX;
      const currentY = e.targetTouches[0].clientY; // Get Y for scroll prevention logic
      const deltaX = Math.abs(currentX - (currentTouchX ?? currentX));
      const startY = (e.targetTouches[0] as any).startY ?? currentY; // Approximate start Y if needed
       const deltaY = Math.abs(currentY - startY);

       setCurrentTouchX(currentX); // Update touch X

      // Prevent vertical scroll only if horizontal movement is dominant
       if (deltaX > deltaY && deltaX > 5 && e.cancelable) {
         e.preventDefault();
       }

      setTouchEnd(currentX);
      calculateSwipeAnimation(currentX, touchStart);
    } catch (error) { console.error("Erreur onTouchMove:", error); resetSwipeState(); }
  }, [touchStart, isSwiping, currentTouchX, calculateSwipeAnimation, resetSwipeState, isDraggingPanel]);


 const onTouchEnd = useCallback(() => {
    if (!touchStart || !isSwiping) {
        if (!isSwiping) resetSwipeState(); // Ensure reset if touch ends without swipe logic running
        return;
    }

    const finalDistance = (touchEnd ?? touchStart) - touchStart;
    const isLeftSwipe = finalDistance < -minSwipeDistance;
    const isRightSwipe = finalDistance > minSwipeDistance;

    setIsSwiping(false); // Set immediately

    try {
        const swipeAnimDuration = 350;
        const transitionCurve = 'cubic-bezier(0.175, 0.885, 0.32, 1.175)';
        const transitionStyle = `transform ${swipeAnimDuration}ms ${transitionCurve}, opacity ${swipeAnimDuration}ms ease-out`;

        // Apply transition safely
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
                 nextImageRef.current.style.zIndex = '15';
            }
            setTimeout(() => { handleNext(); resetSwipeState(); }, swipeAnimDuration);

        } else if (isRightSwipe) {
            if(imageRef.current) {
                const finalRotation = Math.max(15, Math.abs(swipeRotation * 1.2));
                imageRef.current.style.transform = `translateX(120%) rotate(${finalRotation}deg) scale(0.9)`;
                imageRef.current.style.opacity = '0';
            }
            if(nextImageRef.current) { // Reset next image on right swipe
                 nextImageRef.current.style.transform = 'scale(0.95) translateY(8px)';
                 nextImageRef.current.style.opacity = '0.7';
            }
            setTimeout(() => { handlePrevious(); resetSwipeState(); }, swipeAnimDuration);

        } else { // Not enough swipe
            resetSwipeState();
        }
    } catch (error) {
        console.error("Erreur onTouchEnd:", error);
        resetSwipeState(); // Ensure reset on error
    } finally {
       // Reset touch tracking states after logic/animations handled
        setTouchStart(null);
        setTouchEnd(null);
        setCurrentTouchX(null);
    }
  }, [touchStart, touchEnd, isSwiping, swipeRotation, minSwipeDistance, handleNext, handlePrevious, resetSwipeState]);


  // --- Panel Drag Calculation & Content Visibility ---
  const calculatePanelY = useCallback((deltaY: number): number => {
    const initialPos = panelInitialY.current;
    let newY = initialPos + deltaY;
    try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const collapsedY = expandedHeightPx - gripHeightPx;
        const expandedY = 0;
        const minY = expandedY - 50;
        const maxY = collapsedY + 50;
        return Math.max(minY, Math.min(maxY, newY));
    } catch (error) {
         console.error("Error calculating panel Y:", error);
         return initialPos; // Return initial position on error
    }
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

        contentElement.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
         if (opacity > 0) contentElement.style.display = 'block';

     } catch(error) { console.error("Error updating content visibility", error)}
  }, []);


  // --- Panel Touch Handlers ---
  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    if (!(gripRef.current?.contains(e.target as Node)) || isSwiping) return;
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
                 const vh = window.innerHeight;
                 const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
                 const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
                 currentY = isInfoVisible ? 0 : expandedHeightPx - gripHeightPx;
            }
            panelInitialY.current = currentY;
            setPanelTranslateY(currentY);
            if (!isInfoVisible) {
                 const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
                 if (contentElement) contentElement.style.display = 'block';
            }
        }
    } catch (error) { console.error("Erreur handlePanelTouchStart:", error); setIsDraggingPanel(false); }
  }, [isInfoVisible, isSwiping]);


  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY === null || !isDraggingPanel || !panelRef.current) return;
    try {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - dragStartY;
        const targetY = calculatePanelY(deltaY);

         // Use requestAnimationFrame for smoother transform updates
         requestAnimationFrame(() => {
             if (!panelRef.current) return;
             panelRef.current.style.transform = `translateY(${targetY}px)`;
             updateContentVisibility(targetY); // Update opacity in sync
         });
        setPanelTranslateY(targetY); // Update state (might lag slightly behind rAF visually)

    } catch (error) { console.error("Erreur handlePanelTouchMove:", error); setIsDraggingPanel(false); }
  }, [dragStartY, isDraggingPanel, calculatePanelY, updateContentVisibility]);


  const handlePanelTouchEnd = useCallback(() => {
    if (dragStartY === null || !isDraggingPanel || panelTranslateY === null || !panelRef.current) return;

    setIsDraggingPanel(false);
    const deltaY = panelTranslateY - panelInitialY.current;
    const threshold = 60;

    try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(GRIP_HEIGHT_EXPANDED) / 100;
        const collapsedY = expandedHeightPx - gripHeightPx;
        const expandedY = 0;

        let targetY: number;
        let shouldBeVisible: boolean;

        if (isInfoVisible) { // Currently open
            shouldBeVisible = deltaY <= threshold;
        } else { // Currently closed
            shouldBeVisible = deltaY < -threshold;
        }
        targetY = shouldBeVisible ? expandedY : collapsedY;

        // Animate panel
        panelRef.current.style.transition = `transform ${PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        panelRef.current.style.transform = `translateY(${targetY}px)`;
        setPanelTranslateY(targetY);
        setIsInfoVisible(shouldBeVisible); // Update state

        // Animate content
        const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
        if (contentElement) {
            contentElement.style.transition = `opacity ${CONTENT_FADE_DURATION}ms ease-out`;
            if (shouldBeVisible) {
                contentElement.style.display = 'block';
                requestAnimationFrame(() => { contentElement.style.opacity = '1'; });
            } else {
                contentElement.style.opacity = '0';
                 setTimeout(() => {
                     if (!isInfoVisible) contentElement.style.display = 'none';
                 }, CONTENT_FADE_DURATION + 50);
            }
        }

    } catch (error) { console.error("Erreur handlePanelTouchEnd:", error); }
    finally {
        setDragStartY(null);
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
                            // Add onLoad/onError to track actual image load? Might be overkill if preloading works
                            // onLoad={() => console.log(`Next image loaded: ${nextImageIndex}`)}
                            // onError={() => console.log(`Next image FAILED: ${nextImageIndex}`)}
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
                        priority={true} // Prioritize current image
                        // onLoad={() => console.log(`Current image loaded: ${currentImageIndex}`)}
                        // onError={() => console.log(`Current image FAILED: ${currentImageIndex}`)}
                     />
                 )}
             </div>
         </div>


        {/* --- Navigation Buttons --- */}
        {allVisuals.length > 1 && !isSwiping && !isDraggingPanel && (
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
            className={`absolute left-0 right-0 flex justify-center space-x-2 transition-opacity duration-300 z-10 ${isInfoVisible || isSwiping || isDraggingPanel ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
             style={{ bottom: `calc(${GRIP_HEIGHT_COLLAPSED} + 15px)` }}
            aria-label="Indicateurs d'images"
            aria-hidden={isInfoVisible || isSwiping || isDraggingPanel}
          >
             <div className="px-3 py-1.5 bg-black/20 backdrop-blur-sm rounded-full">
               {allVisuals.map((_, idx) => (
                 <button
                  key={idx}
                  onClick={() => { setCurrentImageIndex(idx); setNextImageIndex((idx + 1) % allVisuals.length); resetSwipeState(); }} // Update both indices and reset
                  className={`w-2 h-2 mx-1 rounded-full transition-colors ${currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Aller à l'image ${idx + 1}`}
                  aria-current={currentImageIndex === idx ? "step" : undefined}
                />
               ))}
            </div>
          </div>
        )}


        {/* --- Information Panel --- */}
        <div
          ref={panelRef}
          className={`absolute left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-2xl transform will-change-transform`}
          style={{
            height: GRIP_HEIGHT_EXPANDED,
            maxHeight: GRIP_HEIGHT_EXPANDED,
            transform: panelTranslateY !== null ? `translateY(${panelTranslateY}px)` : `translateY(calc(100% - ${GRIP_HEIGHT_COLLAPSED}))`,
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
             {/* Conditional Title/Text */}
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
               height: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`,
               maxHeight: `calc(${GRIP_HEIGHT_EXPANDED} - ${GRIP_HEIGHT_COLLAPSED})`,
               display: isInfoVisible ? 'block' : 'none',
               opacity: isInfoVisible ? 1 : 0,
               // Ensure smooth scrolling on iOS
               WebkitOverflowScrolling: 'touch',
            }}
           >
             <div className="space-y-4">
              {Array.isArray(project.description) ? (
                project.description.map((paragraph, idx) => (
                  <p key={idx} className="font-poppins text-gray-700 text-sm leading-relaxed">{paragraph}</p>
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
                Visiter le site du projet
              </a>
             )}
             {/* Add safe area padding at the bottom */}
              <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div>
          </div>
        </div>

      </div> // End Mobile Wrapper
    );
  } else {
    // --- DESKTOP VERSION ---
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 transition-opacity duration-300"
            style={{ opacity: isAnimating ? 1 : 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${project.id}`}
        >
            <div
              ref={modalRef}
              className="bg-white w-full max-w-5xl flex flex-col md:flex-row relative transition-transform duration-300 shadow-xl"
              style={{
                transform: isAnimating ? 'scale(1)' : 'scale(0.95)',
                opacity: isAnimating ? 1 : 0
              }}
            >
              {/* Left Column: Image Slider */}
              <div className="w-full md:w-1/2 relative" ref={imageColumnRef}>
                <div className="relative" style={{ aspectRatio: '4/5' }}>
                  {allVisuals[currentImageIndex] && ( // Check if image exists
                    <Image
                        src={allVisuals[currentImageIndex]}
                        alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={currentImageIndex === 0}
                        key={allVisuals[currentImageIndex]}
                    />
                  )}

                  {/* Navigation Buttons */}
                  {allVisuals.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow"
                        aria-label="Image précédente"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white/70 hover:bg-white/90 transition-colors shadow"
                        aria-label="Image suivante"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  {/* Pagination Dots */}
                  {allVisuals.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center" aria-label="Indicateurs d'images">
                      <div className="flex space-x-2 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                        {allVisuals.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)} // Just set index for desktop
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentImageIndex === index ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'}`}
                            aria-label={`Aller à l'image ${index + 1}`}
                            aria-current={currentImageIndex === index ? "step" : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Content */}
              <div
                className="w-full md:w-1/2 p-8 overflow-y-auto"
                ref={descriptionColumnRef} // Ref is present
               >
                <h2
                  id={`modal-title-${project.id}`}
                  className="font-great-vibes text-2xl md:text-3xl font-medium mb-4"
                >
                  {project.title}
                </h2>
                <div className="font-poppins text-base text-gray-700 leading-relaxed">
                  {Array.isArray(project.description) ? (
                    project.description.map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                    ))
                  ) : (
                    <p>{project.description}</p>
                  )}
                </div>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-poppins block mt-6 text-primary-blue hover:underline"
                  >
                    Visiter le site du projet
                  </a>
                )}
              </div>

              {/* Close Button */}
              <button
                className="absolute -top-5 -right-5 z-20 bg-primary-orange text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary-orange/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange"
                onClick={onClose}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>
        </div>
     );
  }
}