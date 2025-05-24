// ========================================================================
// === COMPOSANT PRINCIPAL - STYLE TINDER ===
// ========================================================================

"use client";

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useSprings } from '@react-spring/web';

// Types & Config
import { Project } from './types/modal';
import { calculateInitialCollapsedY } from './utils/modal';

// Hooks
import { useModalReducer } from './hooks/useModalReducer';
import { useImagePreloader } from './hooks/useImagePreloader';
import { usePanelDrag } from './hooks/usePanelDrag';

// Components
import { ModalHeader } from './Mobile/ModalHeader';
import { NavigationControls } from './Mobile/NavigationControls';
import { InfoPanel } from './Mobile/InfoPanel';

// 🔧 CORRECTION: Config intégré pour éviter les imports
const MODAL_CONFIG = {
  PANEL_ANIMATION_DURATION: 300,
  CONTENT_FADE_DURATION: 200,
  GRIP_HEIGHT_COLLAPSED: '8vh',
  GRIP_HEIGHT_EXPANDED: '75vh',
  PANEL_DRAG_THRESHOLD: 50,
} as const;

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
  // 🔧 TINDER STYLE: SPRING CONFIGURATION
  // ===============================
  const getCardStyle = useCallback((
    i: number, 
    activeIndex: number = state.currentImageIndex,
    dragX: number = 0,
    isDragging: boolean = false
  ) => {
    const isActive = i === activeIndex;
    const isNext = i === activeIndex + 1;
    const isPrev = i === activeIndex - 1;

    if (isActive) {
      // 🎯 CARTE ACTIVE: Style Tinder
      return {
        x: dragX,
        y: 0,
        rot: dragX / 20, // Rotation pendant le drag
        scale: isDragging ? 1.05 : 1,
        opacity: 1,
        display: 'block',
        zIndex: 10,
        config: isDragging 
          ? { tension: 0, friction: 0 } // Suit le doigt
          : { tension: 300, friction: 30 } // Animation de retour
      };
    } else if (isNext && Math.abs(dragX) > 20) {
      // 🎯 CARTE SUIVANTE: Révélée par le drag (comme Tinder)
      const progress = Math.min(1, Math.abs(dragX) / 150);
      return {
        x: 0,
        y: 0,
        rot: 0,
        scale: 0.95 + (progress * 0.05), // Grandit pendant la révélation
        opacity: 0.7 + (progress * 0.3),
        display: 'block',
        zIndex: 9,
        config: { tension: 300, friction: 30 }
      };
    } else if (isPrev && dragX > 20) {
      // 🎯 CARTE PRÉCÉDENTE: Révélée par le drag vers la droite
      const progress = Math.min(1, dragX / 150);
      return {
        x: 0,
        y: 0,
        rot: 0,
        scale: 0.95 + (progress * 0.05),
        opacity: 0.7 + (progress * 0.3),
        display: 'block',
        zIndex: 9,
        config: { tension: 300, friction: 30 }
      };
    } else {
      // 🎯 AUTRES CARTES: Masquées
      return {
        x: 0,
        y: 0,
        rot: 0,
        scale: 0.9,
        opacity: 0,
        display: 'none',
        zIndex: 0,
        config: { tension: 300, friction: 30 }
      };
    }
  }, [state.currentImageIndex]);

  // ===============================
  // 🔧 TINDER STYLE: SPRINGS
  // ===============================
  const [springProps, api] = useSprings(
    allVisuals.length, 
    i => getCardStyle(i, 0), 
    [allVisuals.length]
  );

  // ===============================
  // 🔧 TINDER STYLE: NAVIGATION HANDLERS
  // ===============================
  const handleSwipeNext = useCallback(() => {
    if (state.currentImageIndex < allVisuals.length - 1) {
      const currentIndex = state.currentImageIndex;
      const nextIndex = currentIndex + 1;
      
      // Animation de sortie style Tinder
      api.start(i => {
        if (i === currentIndex) {
          return {
            x: -400, // Sort vers la gauche
            rot: -30,
            scale: 0.8,
            opacity: 0,
            config: { tension: 200, friction: 25 }
          };
        } else if (i === nextIndex) {
          return getCardStyle(i, nextIndex);
        }
        return undefined;
      });
      
      // Mise à jour de l'état après animation
      setTimeout(() => {
        actions.setCurrentImage(nextIndex);
        // Reset la carte qui vient de sortir
        api.start(i => i === currentIndex ? { display: 'none' } : undefined);
      }, 150);
    }
  }, [state.currentImageIndex, allVisuals.length, actions, api, getCardStyle]);

  const handleSwipePrevious = useCallback(() => {
    if (state.currentImageIndex > 0) {
      const currentIndex = state.currentImageIndex;
      const prevIndex = currentIndex - 1;
      
      // Animation de sortie style Tinder
      api.start(i => {
        if (i === currentIndex) {
          return {
            x: 400, // Sort vers la droite
            rot: 30,
            scale: 0.8,
            opacity: 0,
            config: { tension: 200, friction: 25 }
          };
        } else if (i === prevIndex) {
          return getCardStyle(i, prevIndex);
        }
        return undefined;
      });
      
      // Mise à jour de l'état après animation
      setTimeout(() => {
        actions.setCurrentImage(prevIndex);
        // Reset la carte qui vient de sortir
        api.start(i => i === currentIndex ? { display: 'none' } : undefined);
      }, 150);
    }
  }, [state.currentImageIndex, actions, api, getCardStyle]);

  const handleGoToImage = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < allVisuals.length && targetIndex !== state.currentImageIndex) {
      // Navigation directe sans animation Tinder
      actions.setCurrentImage(targetIndex);
    }
  }, [state.currentImageIndex, allVisuals.length, actions]);

  // ===============================
  // 🔧 TINDER STYLE: DRAG LOGIC
  // ===============================
  const dragState = useRef({ isDragging: false, startX: 0 });

  const handleDragStart = useCallback(() => {
    dragState.current.isDragging = true;
    actions.setImageDragging(true);
  }, [actions]);

  const handleDragMove = useCallback((deltaX: number) => {
    if (!dragState.current.isDragging) return;
    
    const currentIndex = state.currentImageIndex;
    const canGoNext = currentIndex < allVisuals.length - 1;
    const canGoPrev = currentIndex > 0;
    
    // Limiter le mouvement selon les limites
    let constrainedX = deltaX;
    if (deltaX < 0 && !canGoNext) {
      constrainedX = Math.max(-50, deltaX * 0.3); // Résistance
    } else if (deltaX > 0 && !canGoPrev) {
      constrainedX = Math.min(50, deltaX * 0.3); // Résistance
    }
    
    // Mettre à jour l'animation
    api.start(i => {
      if (i === currentIndex) {
        return getCardStyle(i, currentIndex, constrainedX, true);
      } else if ((i === currentIndex + 1 && deltaX < -20) || (i === currentIndex - 1 && deltaX > 20)) {
        return getCardStyle(i, currentIndex, constrainedX, false);
      }
      return undefined;
    });
  }, [state.currentImageIndex, allVisuals.length, api, getCardStyle]);

  const handleDragEnd = useCallback((deltaX: number, velocity: number) => {
    dragState.current.isDragging = false;
    actions.setImageDragging(false);
    
    const shouldSwipe = Math.abs(deltaX) > 100 || Math.abs(velocity) > 0.5;
    
    if (shouldSwipe) {
      if (deltaX < -50) {
        handleSwipeNext();
      } else if (deltaX > 50) {
        handleSwipePrevious();
      } else {
        // Reset position
        api.start(i => i === state.currentImageIndex ? getCardStyle(i, state.currentImageIndex) : undefined);
      }
    } else {
      // Reset position
      api.start(i => i === state.currentImageIndex ? getCardStyle(i, state.currentImageIndex) : undefined);
    }
  }, [actions, handleSwipeNext, handleSwipePrevious, api, getCardStyle, state.currentImageIndex]);

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

  // ===============================
  // EFFECTS
  // ===============================
  
  // Mount effect
  useEffect(() => {
    actions.setMounted(true);
    return () => actions.setMounted(false);
  }, [actions]);

  // Reset state
  useEffect(() => {
    if (isOpen && initialCollapsedY !== null) {
      actions.resetState(initialCollapsedY);
      
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${initialCollapsedY}px)`;
        panelRef.current.style.visibility = 'visible';
      }
      
      if (api && allVisuals.length > 0) {
        api.start(i => getCardStyle(i, 0));
      }
    }
  }, [project, isOpen, initialCollapsedY, allVisuals.length, api, getCardStyle, actions]);

  // Update animations
  useEffect(() => {
    if (state.isMounted && api && allVisuals.length > 0) {
      api.start(i => getCardStyle(i, state.currentImageIndex));
    }
  }, [state.currentImageIndex, api, state.isMounted, allVisuals.length, getCardStyle]);

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
        {/* 🔧 TINDER STYLE: Image Stack */}
        <TinderImageStack
          project={project}
          allVisuals={allVisuals}
          currentImageIndex={state.currentImageIndex}
          springProps={springProps}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        />

        {/* Navigation Controls */}
        <NavigationControls
          allVisuals={allVisuals}
          currentImageIndex={state.currentImageIndex}
          isImageDragging={state.isImageDragging}
          isDraggingPanel={state.isDraggingPanel}
          onPrevious={handleSwipePrevious}
          onNext={handleSwipeNext}
          onGoToImage={handleGoToImage}
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
// 🔧 TINDER STYLE: IMAGE STACK COMPONENT
// ===============================
import { animated } from '@react-spring/web';
import { to as interpolate } from '@react-spring/web';
import Image from 'next/image';

interface TinderImageStackProps {
  project: Project;
  allVisuals: string[];
  currentImageIndex: number;
  springProps: any[];
  onDragStart: () => void;
  onDragMove: (deltaX: number) => void;
  onDragEnd: (deltaX: number, velocity: number) => void;
}

const TinderImageStack: React.FC<TinderImageStackProps> = ({
  project,
  allVisuals,
  currentImageIndex,
  springProps,
  onDragStart,
  onDragMove,
  onDragEnd
}) => {
  const dragState = useRef({ startX: 0, startTime: 0 });

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (index !== currentImageIndex) return;
    dragState.current.startX = e.touches[0].clientX;
    dragState.current.startTime = Date.now();
    onDragStart();
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (index !== currentImageIndex) return;
    const deltaX = e.touches[0].clientX - dragState.current.startX;
    onDragMove(deltaX);
  };

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (index !== currentImageIndex) return;
    const deltaX = e.changedTouches[0].clientX - dragState.current.startX;
    const deltaTime = Date.now() - dragState.current.startTime;
    const velocity = Math.abs(deltaX) / Math.max(deltaTime, 1);
    onDragEnd(deltaX, velocity);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* Container FIXE 4:5 */}
      <div className="relative w-full max-w-sm aspect-[4/5] max-h-[65vh]">
        {springProps.map(({ x, y, rot, scale, opacity, display, zIndex }, i) => (
          <animated.div
            key={allVisuals[i] ? allVisuals[i] : `card-${i}`}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              display,
              opacity,
              transform: interpolate([x, y, rot, scale], (xVal, yVal, rVal, sVal) =>
                `perspective(1200px) translateX(${xVal}px) translateY(${yVal}px) rotateZ(${rVal}deg) scale(${sVal})`
              ),
              touchAction: 'none',
              zIndex,
            }}
            onTouchStart={(e) => handleTouchStart(e, i)}
            onTouchMove={(e) => handleTouchMove(e, i)}
            onTouchEnd={(e) => handleTouchEnd(e, i)}
          >
            {/* Container uniforme SANS coins arrondis */}
            <div className="relative w-full h-full overflow-hidden bg-white shadow-xl">
              {allVisuals[i] && (
                <>
                  <Image
                    src={allVisuals[i]}
                    alt={`Image ${i + 1} du projet ${project.title}`}
                    fill
                    className="pointer-events-none"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    sizes="(max-width: 768px) 85vw, 400px"
                    priority={i === currentImageIndex}
                    draggable="false"
                  />
                  
                  {/* Frame pour la carte active */}
                  {i === currentImageIndex && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 0 2px rgba(247,165,32,0.3)',
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </animated.div>
        ))}
      </div>
    </div>
  );
};
// ===============================
// 🔧 TINDER STYLE: END OF IMAGE STACK COMPONENT