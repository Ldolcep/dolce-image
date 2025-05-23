// ========================================================================
// === COMPOSANT PRINCIPAL REFACTORISÉ ===
// ========================================================================

// ===============================
// ProjectModalMobile.tsx (Refactorisé)
// ===============================
"use client";

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useSprings, SpringConfig } from '@react-spring/web';

// Types & Config
import { Project } from './types/modal';
import { MODAL_CONFIG } from './config/modal';
import { calculateInitialCollapsedY } from './utils/modal';

// Hooks
import { useModalReducer } from './hooks/useModalReducer';
import { useImagePreloader } from './hooks/useImagePreloader';
import { usePanelDrag } from './hooks/usePanelDrag';
import { useSwipeGesture } from './hooks/useSwipeGesture';

// Components
import { ModalHeader } from './Mobile/ModalHeader';
import { ImageStack } from './Mobile/ImageStack';
import { NavigationControls } from './Mobile/NavigationControls';
import { InfoPanel } from './Mobile/InfoPanel';

interface ProjectModalMobileProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModalMobile({ 
  project, 
  isOpen, 
  onClose 
}: ProjectModalMobileProps) {
  // ===============================
  // STATE & REFS
  // ===============================
  const { state, actions } = useModalReducer();
  const allVisuals = useMemo(() => 
    [project.mainVisual, ...project.additionalVisuals].filter(Boolean), 
    [project]
  );

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);

  // Calculate initial panel position
  const initialCollapsedY = useMemo(() => 
    calculateInitialCollapsedY(state.isMounted), 
    [state.isMounted]
  );

  // ===============================
  // SPRING ANIMATIONS
  // ===============================
  const springTo = useCallback((
    i: number, 
    activeIndex: number = state.currentImageIndex, 
    forSwipeOut: boolean = false, 
    swipeDir: number = 0
  ) => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 300;

    if (forSwipeOut) {
      return { 
        x: swipeDir * (windowWidth + 200), 
        rot: swipeDir * 30, 
        scale: 0.8, 
        opacity: 0, 
        display: 'block', 
        config: MODAL_CONFIG.SPRING_CONFIG.SWIPE_OUT,
        onRest: ({ finished }: any) => {
          if (finished && api) {
            api.start(j => (j === i ? { 
              display: 'none', 
              immediate: true 
            } : undefined));
          }
        }
      };
    }

    const x = 0;
    const y = i === activeIndex + 1 ? 8 : 0;
    let scale = 1;
    let opacity = 0;
    let display = 'none';
    let zIndex = 0;

    if (i === activeIndex) {
      scale = 1; 
      opacity = 1; 
      display = 'block'; 
      zIndex = allVisuals.length;
    } else if (i === activeIndex + 1 && allVisuals.length > 1) {
      scale = 0.95; 
      opacity = 0.7; 
      display = 'block'; 
      zIndex = allVisuals.length - 1;
    } else {
      scale = 0.85; 
      opacity = 0; 
      display = 'none'; 
      zIndex = allVisuals.length - Math.abs(i - activeIndex);
    }

    return { 
      x, 
      y, 
      scale, 
      rot: 0, 
      opacity, 
      display, 
      zIndex, 
      config: MODAL_CONFIG.SPRING_CONFIG.BASE, 
      delay: i === activeIndex ? 50 : 0 
    };
  }, [state.currentImageIndex, allVisuals.length]);

  const [springProps, api] = useSprings(
    allVisuals.length, 
    i => ({ ...springTo(i) }), 
    [allVisuals.length, springTo]
  );

  // ===============================
  // CUSTOM HOOKS
  // ===============================
  
  // Panel drag functionality
  const {
    handlePanelTouchStart,
    handlePanelTouchMove,
    handlePanelTouchEnd
  } = usePanelDrag(panelRef, state, actions);

  // Image preloader
  useImagePreloader(
    isOpen,
    allVisuals,
    state.currentImageIndex,
    state.isMounted,
    actions.setImageLoaded
  );

  // Swipe gesture handling
  const {
    bind,
    handleNavNext,
    handleNavPrevious,
    handleGoToImage,
    resetGoneSet
  } = useSwipeGesture({
    allVisuals,
    currentImageIndex: state.currentImageIndex,
    isDraggingPanel: state.isDraggingPanel,
    isMounted: state.isMounted,
    onImageDragStart: () => actions.setImageDragging(true),
    onImageDragEnd: () => setTimeout(() => actions.setImageDragging(false), 50),
    onSwipeNext: () => actions.setCurrentImage(state.currentImageIndex + 1),
    onSwipePrevious: () => actions.setCurrentImage(state.currentImageIndex - 1),
    springApi: api,
    springTo
  });

  // ===============================
  // NAVIGATION HANDLERS
  // ===============================
  const handleGoToImageWithUpdate = useCallback((targetIndex: number) => {
    handleGoToImage(targetIndex);
    actions.setCurrentImage(targetIndex);
  }, [handleGoToImage, actions]);

  // ===============================
  // EFFECTS
  // ===============================
  
  // Mount effect
  useEffect(() => {
    actions.setMounted(true);
    return () => actions.setMounted(false);
  }, [actions]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && initialCollapsedY !== null) {
      console.log("ProjectModalMobile: Resetting for new project - ID:", project.id);
      resetGoneSet();
      actions.resetState(initialCollapsedY);
      
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
        panelRef.current.style.visibility = 'visible';
      }
      
      if (api && allVisuals.length > 0) {
        api.start(i => springTo(i, 0));
      }
    }
  }, [project, isOpen, initialCollapsedY, allVisuals.length, api, springTo, resetGoneSet, actions]);

  // Update spring animations when current image changes
  useEffect(() => {
    if (state.isMounted && api && allVisuals.length > 0) {
      api.start(i => springTo(i, state.currentImageIndex));
    }
  }, [state.currentImageIndex, api, state.isMounted, allVisuals.length, springTo]);

  // Panel position initialization
  useEffect(() => {
    if (isOpen && state.isMounted && initialCollapsedY !== null) {
      actions.updatePanelDrag(initialCollapsedY);
      
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
        panelRef.current.style.visibility = 'visible';
        requestAnimationFrame(() => {
          if (panelRef.current) {
            panelRef.current.style.transition = `transform ${MODAL_CONFIG.PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
          }
        });
      }
    } else if (!isOpen) {
      actions.toggleInfoPanel(false);
      if (panelRef.current) panelRef.current.style.transition = 'none';
    }
  }, [isOpen, state.isMounted, initialCollapsedY, actions]);

  // Prevent document scroll
  useEffect(() => {
    if (!state.isMounted || !isOpen) return;
    
    const preventDocumentScroll = (e: TouchEvent) => {
      try {
        const target = e.target as Node;
        const panelContent = panelRef.current?.querySelector('.panel-content');
        
        if (state.isInfoVisible && 
            panelContent?.contains(target) && 
            panelContent.scrollHeight > panelContent.clientHeight) {
          return true;
        }
        
        if (e.cancelable) e.preventDefault();
      } catch (error) {
        console.error("Scroll prevention error:", error);
      }
    };

    document.addEventListener('touchmove', preventDocumentScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventDocumentScroll);
  }, [isOpen, state.isInfoVisible, state.isMounted]);

  // ===============================
  // RENDER
  // ===============================
  
  // Loading fallback
  if (!state.isMounted) {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>;
  }
  
  if (!isOpen) return null;

  const collapsedGripVisibleHeight = `calc(${MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED} + 0px)`;

  return (
    <div 
      className="fixed inset-0 bg-white z-50 overflow-hidden select-none" 
      ref={modalRef} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby={state.isInfoVisible ? undefined : `modal-title-${project.id}`}
    >
      {/* Header */}
      <ModalHeader
        projectTitle={project.title}
        projectId={project.id}
        isInfoVisible={state.isInfoVisible}
        onClose={onClose}
      />

      {/* Main Content Area */}
      <div 
        className="absolute inset-0 pt-16 pb-[--grip-visible-height] overflow-hidden flex items-center justify-center"
        style={{ '--grip-visible-height': collapsedGripVisibleHeight } as React.CSSProperties}
      >
        {/* Image Stack */}
        <ImageStack
          project={project}
          allVisuals={allVisuals}
          currentImageIndex={state.currentImageIndex}
          springProps={springProps}
          bind={bind}
        />

        {/* Navigation Controls */}
        <NavigationControls
          allVisuals={allVisuals}
          currentImageIndex={state.currentImageIndex}
          isImageDragging={state.isImageDragging}
          isDraggingPanel={state.isDraggingPanel}
          onPrevious={handleNavPrevious}
          onNext={handleNavNext}
          onGoToImage={handleGoToImageWithUpdate}
        />
      </div>

      {/* Info Panel */}
      <InfoPanel
        project={project}
        isInfoVisible={state.isInfoVisible}
        panelTranslateY={state.panelTranslateY}
        initialCollapsedY={initialCollapsedY}
        isMounted={state.isMounted}
        panelRef={panelRef}
        gripRef={gripRef}
        onTouchStart={handlePanelTouchStart}
        onTouchMove={handlePanelTouchMove}
        onTouchEnd={handlePanelTouchEnd}
      />
    </div>
  );
}
// ===============================
// === FIN DU COMPOSANT REFACTORISÉ ===