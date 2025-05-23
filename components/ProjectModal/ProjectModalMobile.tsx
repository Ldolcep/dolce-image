// ========================================================================
// === COMPOSANT PRINCIPAL - VERSION ULTRA-SIMPLIFIÉE ===
// ========================================================================

// ===============================
// ProjectModalMobile.tsx - APPROCHE SIMPLIFIÉE
// ===============================
"use client";

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useSprings } from '@react-spring/web';

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
  // 🔧 CORRECTION: FONCTION SPRINGTO ULTRA-SIMPLIFIÉE
  // ===============================
  const springTo = useCallback((
    i: number, 
    activeIndex: number = state.currentImageIndex, 
    forSwipeOut: boolean = false, 
    swipeDir: number = 0
  ) => {
    // 🔧 CORRECTION: Animation de sortie très simple
    if (forSwipeOut) {
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 300;
      return { 
        x: swipeDir * windowWidth * 1.2,
        rot: swipeDir * 15,
        scale: 0.8,
        opacity: 0,
        config: { tension: 200, friction: 25 }
      };
    }

    // 🔧 CORRECTION: Logique ultra-simple pour les cartes
    if (i === activeIndex) {
      // Carte active
      return {
        x: 0,
        y: 0,
        rot: 0,
        scale: 1,
        opacity: 1,
        display: 'block',
        zIndex: 10,
        config: { tension: 250, friction: 30 }
      };
    } else {
      // Toutes les autres cartes masquées
      return {
        x: 0,
        y: 0,
        rot: 0,
        scale: 0.9,
        opacity: 0,
        display: 'none',
        zIndex: 0,
        config: { tension: 250, friction: 30 }
      };
    }
  }, [state.currentImageIndex]);

  // ===============================
  // 🔧 CORRECTION: SPRINGS SIMPLIFIÉS
  // ===============================
  const [springProps, api] = useSprings(
    allVisuals.length, 
    i => springTo(i, 0), // Toujours commencer par la première image
    [allVisuals.length]
  );

  // ===============================
  // 🔧 CORRECTION: NAVIGATION ULTRA-SIMPLIFIÉE
  // ===============================
  const handleSwipeNext = useCallback(() => {
    if (state.currentImageIndex < allVisuals.length - 1) {
      const newIndex = state.currentImageIndex + 1;
      
      // Animation de sortie de l'image actuelle
      if (api) {
        api.start(i => {
          if (i === state.currentImageIndex) {
            return springTo(i, state.currentImageIndex, true, -1);
          } else if (i === newIndex) {
            return springTo(i, newIndex);
          }
          return undefined;
        });
      }
      
      // Mise à jour de l'état avec délai
      setTimeout(() => {
        actions.setCurrentImage(newIndex);
      }, 100);
    }
  }, [state.currentImageIndex, allVisuals.length, actions, api, springTo]);

  const handleSwipePrevious = useCallback(() => {
    if (state.currentImageIndex > 0) {
      const newIndex = state.currentImageIndex - 1;
      
      // Animation de sortie de l'image actuelle
      if (api) {
        api.start(i => {
          if (i === state.currentImageIndex) {
            return springTo(i, state.currentImageIndex, true, 1);
          } else if (i === newIndex) {
            return springTo(i, newIndex);
          }
          return undefined;
        });
      }
      
      // Mise à jour de l'état avec délai
      setTimeout(() => {
        actions.setCurrentImage(newIndex);
      }, 100);
    }
  }, [state.currentImageIndex, actions, api, springTo]);

  const handleGoToImage = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < allVisuals.length && targetIndex !== state.currentImageIndex) {
      // Navigation directe sans animation complexe
      actions.setCurrentImage(targetIndex);
    }
  }, [state.currentImageIndex, allVisuals.length, actions]);

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

  // 🔧 CORRECTION: Swipe gesture simplifié
  const {
    bind,
    handleNavNext,
    handleNavPrevious,
    resetGoneSet
  } = useSwipeGesture({
    allVisuals,
    currentImageIndex: state.currentImageIndex,
    isDraggingPanel: state.isDraggingPanel,
    isMounted: state.isMounted,
    onImageDragStart: () => actions.setImageDragging(true),
    onImageDragEnd: () => setTimeout(() => actions.setImageDragging(false), 50),
    onSwipeNext: handleSwipeNext,
    onSwipePrevious: handleSwipePrevious,
    springApi: api,
    springTo
  });

  // Navigation unifiée
  const unifiedHandleNext = useCallback(() => {
    handleNavNext();
  }, [handleNavNext]);

  const unifiedHandlePrevious = useCallback(() => {
    handleNavPrevious();
  }, [handleNavPrevious]);

  const unifiedHandleGoToImage = useCallback((targetIndex: number) => {
    handleGoToImage(targetIndex);
  }, [handleGoToImage]);

  // ===============================
  // EFFECTS SIMPLIFIÉS
  // ===============================
  
  // Mount effect
  useEffect(() => {
    actions.setMounted(true);
    return () => actions.setMounted(false);
  }, [actions]);

  // Reset state simplifié
  useEffect(() => {
    if (isOpen && initialCollapsedY !== null) {
      resetGoneSet();
      actions.resetState(initialCollapsedY);
      
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
        panelRef.current.style.visibility = 'visible';
      }
      
      // 🔧 CORRECTION: Reset springs simple
      if (api && allVisuals.length > 0) {
        api.start(i => springTo(i, 0));
      }
    }
  }, [project, isOpen, initialCollapsedY, allVisuals.length, api, springTo, resetGoneSet, actions]);

  // 🔧 CORRECTION: Update animations simplifiées
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
          onPrevious={unifiedHandlePrevious}
          onNext={unifiedHandleNext}
          onGoToImage={unifiedHandleGoToImage}
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
// === FIN DU COMPOSANT SIMPLIFIÉ ===