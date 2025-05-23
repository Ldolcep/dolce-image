// ========================================================================
// === COMPOSANT PRINCIPAL - ANIMATIONS FLUIDES ===
// ========================================================================

// ===============================
// ProjectModalMobile.tsx - SPRINGTO OPTIMISÉ
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
  // 🔧 CORRECTION: FONCTION SPRINGTO OPTIMISÉE
  // ===============================
  const springTo = useCallback((
    i: number, 
    activeIndex: number = state.currentImageIndex, 
    forSwipeOut: boolean = false, 
    swipeDir: number = 0
  ) => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 300;

    // 🔧 CORRECTION: Animation de sortie plus fluide
    if (forSwipeOut) {
      return { 
        x: swipeDir * (windowWidth + 100), // Réduction de la distance
        rot: swipeDir * 20, // Réduction de la rotation
        scale: 0.9, // Scale moins drastique
        opacity: 0, 
        display: 'block', 
        config: {
          ...MODAL_CONFIG.SPRING_CONFIG.SWIPE_OUT,
          tension: 250, // Plus doux
          friction: 30   // Plus fluide
        },
        onRest: ({ finished }: any) => {
          if (finished && api) {
            // Délai plus court pour masquer
            setTimeout(() => {
              api.start(j => (j === i ? { 
                display: 'none', 
                immediate: true 
              } : undefined));
            }, 100);
          }
        }
      };
    }

    // 🔧 CORRECTION: Logique de visibilité stricte
    const isActive = i === activeIndex;
    const isNext = i === activeIndex + 1 && allVisuals.length > 1;
    const isPrev = i === activeIndex - 1 && activeIndex > 0;

    // Variables par défaut (carte masquée)
    let config = MODAL_CONFIG.SPRING_CONFIG.BASE;
    let display = 'none';
    let opacity = 0;
    let scale = 0.85;
    let x = 0;
    let y = 0;
    let rot = 0;
    let zIndex = 0;

    if (isActive) {
      // 🔧 CARTE ACTIVE: Pleinement visible
      display = 'block';
      opacity = 1;
      scale = 1;
      zIndex = allVisuals.length + 10; // Z-index le plus élevé
      config = {
        ...MODAL_CONFIG.SPRING_CONFIG.BASE,
        tension: 300,
        friction: 35
      };
    } else if (isNext && allVisuals.length > 1) {
      // 🔧 CARTE SUIVANTE: Légèrement visible derrière (mais pas aux limites)
      if (activeIndex < allVisuals.length - 1) {
        display = 'block';
        opacity = 0.3; // Moins visible
        scale = 0.92;
        y = 12;
        zIndex = allVisuals.length - 1;
      }
    } 
    // 🔧 CORRECTION CRITIQUE: Pas de carte précédente visible en permanence
    // Elle ne sera visible que pendant le drag

    return { 
      x, 
      y, 
      scale, 
      rot, 
      opacity, 
      display, 
      zIndex, 
      config,
      immediate: false // Toujours des transitions fluides
    };
  }, [state.currentImageIndex, allVisuals.length]);

  // ===============================
  // 🔧 CORRECTION: SPRINGS AVEC GESTION D'ERREUR
  // ===============================
  const [springProps, api] = useSprings(
    allVisuals.length, 
    i => ({ 
      ...springTo(i),
      // 🔧 AJOUT: Valeurs par défaut sûres
      x: 0,
      y: 0,
      rot: 0,
      scale: i === 0 ? 1 : 0.85,
      opacity: i === 0 ? 1 : 0,
      display: i === 0 ? 'block' : 'none',
      zIndex: i === 0 ? allVisuals.length : 0
    }), 
    [allVisuals.length, springTo]
  );

  // ===============================
  // NAVIGATION HANDLERS
  // ===============================
  const handleSwipeNext = useCallback(() => {
    if (state.currentImageIndex < allVisuals.length - 1) {
      const newIndex = state.currentImageIndex + 1;
      console.log('✅ ProjectModal: Setting new index to', newIndex);
      actions.setCurrentImage(newIndex);
    }
  }, [state.currentImageIndex, allVisuals.length, actions]);

  const handleSwipePrevious = useCallback(() => {
    if (state.currentImageIndex > 0) {
      const newIndex = state.currentImageIndex - 1;
      console.log('✅ ProjectModal: Setting new index to', newIndex);
      actions.setCurrentImage(newIndex);
    }
  }, [state.currentImageIndex, actions]);

  const handleGoToImage = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < allVisuals.length && targetIndex !== state.currentImageIndex) {
      console.log('✅ ProjectModal: Setting new index to', targetIndex);
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

  // Swipe gesture avec handlers corrigés
  const {
    bind,
    handleNavNext,
    handleNavPrevious,
    handleGoToImage: swipeHandleGoToImage,
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
    console.log('🔄 ProjectModal: Unified handleNext called');
    handleNavNext();
  }, [handleNavNext]);

  const unifiedHandlePrevious = useCallback(() => {
    console.log('🔄 ProjectModal: Unified handlePrevious called');
    handleNavPrevious();
  }, [handleNavPrevious]);

  const unifiedHandleGoToImage = useCallback((targetIndex: number) => {
    console.log('🔄 ProjectModal: Unified handleGoToImage called', { targetIndex });
    handleGoToImage(targetIndex);
  }, [handleGoToImage]);

  // ===============================
  // EFFECTS
  // ===============================
  
  // Mount effect
  useEffect(() => {
    actions.setMounted(true);
    return () => actions.setMounted(false);
  }, [actions]);

  // 🔧 CORRECTION: Reset state avec animations fluides
  useEffect(() => {
    if (isOpen && initialCollapsedY !== null) {
      console.log("ProjectModalMobile: Resetting for new project - ID:", project.id);
      resetGoneSet();
      actions.resetState(initialCollapsedY);
      
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
        panelRef.current.style.visibility = 'visible';
      }
      
      // 🔧 CORRECTION: Reset springs avec animation douce
      if (api && allVisuals.length > 0) {
        // D'abord masquer toutes les cartes
        api.start(i => ({
          display: 'none',
          opacity: 0,
          scale: 0.85,
          immediate: true
        }));
        
        // Puis afficher la première avec transition
        setTimeout(() => {
          api.start(i => springTo(i, 0));
        }, 50);
      }
    }
  }, [project, isOpen, initialCollapsedY, allVisuals.length, api, springTo, resetGoneSet, actions]);

  // 🔧 CORRECTION: Update animations avec debounce
  useEffect(() => {
    if (state.isMounted && api && allVisuals.length > 0) {
      console.log('🔄 ProjectModal: Updating animations for index', state.currentImageIndex);
      
      // Timeout pour éviter les animations conflictuelles
      const timeoutId = setTimeout(() => {
        api.start(i => springTo(i, state.currentImageIndex));
      }, 50);
      
      return () => clearTimeout(timeoutId);
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
// === FIN DU COMPOSANT OPTIMISÉ ===