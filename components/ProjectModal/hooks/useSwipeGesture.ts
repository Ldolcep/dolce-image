// ========================================================================
// === HOOK SWIPE GESTURE - CORRECTIONS ANIMATIONS & LIMITES ===
// ========================================================================

// ===============================
// hooks/useSwipeGesture.ts - VERSION CORRIGÉE
// ===============================
import { useCallback, useRef } from 'react';
import { useDrag } from '@use-gesture/react';
import { MODAL_CONFIG, getSwipeTriggerDistance } from '../config/modal';

interface UseSwipeGestureProps {
  allVisuals: string[];
  currentImageIndex: number;
  isDraggingPanel: boolean;
  isMounted: boolean;
  onImageDragStart: () => void;
  onImageDragEnd: () => void;
  onSwipeNext: () => void;
  onSwipePrevious: () => void;
  springApi: any;
  springTo: (i: number, activeIndex?: number, forSwipeOut?: boolean, swipeDir?: number) => any;
}

export const useSwipeGesture = ({
  allVisuals,
  currentImageIndex,
  isDraggingPanel,
  isMounted,
  onImageDragStart,
  onImageDragEnd,
  onSwipeNext,
  onSwipePrevious,
  springApi,
  springTo
}: UseSwipeGestureProps) => {
  const windowWidth = useRef(typeof window !== 'undefined' ? window.innerWidth : 300);
  const gone = useRef(new Set<number>());
  const indexBeingDragged = useRef<number | null>(null);

  // Update window width on resize
  const updateWindowWidth = useCallback(() => {
    if (typeof window !== 'undefined') {
      windowWidth.current = window.innerWidth;
    }
  }, []);

  const bind = useDrag(({ 
    args: [index], 
    active, 
    movement: [mx], 
    direction: [xDir], 
    velocity: [vx], 
    first, 
    last,
    cancel 
  }) => {
    // Early returns for invalid states
    if (!isMounted || isDraggingPanel || index !== currentImageIndex) {
      if (cancel && active) cancel();
      return;
    }

    // Handle drag start/end
    if (first) {
      console.log('🎬 SwipeGesture: Drag START');
      onImageDragStart();
    }
    if (last) {
      console.log('🎬 SwipeGesture: Drag END');
      setTimeout(() => onImageDragEnd(), 50);
    }

    // Track currently dragged index
    indexBeingDragged.current = active ? index : null;

    const triggerDistance = getSwipeTriggerDistance();
    const triggerVelocity = MODAL_CONFIG.SWIPE_TRIGGER_VELOCITY;

    // 🔧 CORRECTION: Vérifier les limites avant même de permettre le drag
    const canGoNext = currentImageIndex < allVisuals.length - 1;
    const canGoPrev = currentImageIndex > 0;

    // Handle drag end - check for swipe
    if (!active) {
      let swiped = false;
      
      if (Math.abs(mx) > triggerDistance || Math.abs(vx) > triggerVelocity) {
        const dir = xDir < 0 ? -1 : 1;
        
        // 🔧 CORRECTION: Swipe avec vérification stricte des limites
        if (dir === -1 && canGoNext) {
          console.log('➡️ SwipeGesture: Going to NEXT image');
          gone.current.add(index);
          springApi.start(i => 
            i === index ? springTo(i, currentImageIndex, true, dir) : undefined
          );
          setTimeout(() => onSwipeNext(), 50);
          swiped = true;
        } 
        else if (dir === 1 && canGoPrev) {
          console.log('⬅️ SwipeGesture: Going to PREVIOUS image');
          gone.current.add(index);
          springApi.start(i => 
            i === index ? springTo(i, currentImageIndex, true, dir) : undefined
          );
          setTimeout(() => onSwipePrevious(), 50);
          swiped = true;
        } else {
          console.log('🚫 SwipeGesture: Swipe blocked by boundaries');
        }
      }
      
      // 🔧 CORRECTION: Reset toujours à la position correcte
      if (!swiped) {
        console.log('🔄 SwipeGesture: Resetting to current position');
        springApi.start(i => springTo(i, currentImageIndex));
      }
      
      indexBeingDragged.current = null;
      return;
    }

    // 🔧 CORRECTION: Limiter le mouvement selon les limites
    let constrainedMx = mx;
    
    // Si on essaie d'aller à droite mais qu'on est à la première image
    if (mx > 0 && !canGoPrev) {
      constrainedMx = Math.max(0, mx * 0.1); // Résistance élastique
    }
    
    // Si on essaie d'aller à gauche mais qu'on est à la dernière image
    if (mx < 0 && !canGoNext) {
      constrainedMx = Math.min(0, mx * 0.1); // Résistance élastique
    }

    // Handle active drag avec mouvement contraint
    const x = constrainedMx;
    const rot = constrainedMx / 12;
    const scale = 1.05;
    const config = MODAL_CONFIG.SPRING_CONFIG.ACTIVE;

    // 🔧 CORRECTION: Afficher la carte suivante seulement si elle existe ET si le mouvement va dans le bon sens
    if (currentImageIndex + 1 < allVisuals.length && mx < -20 && canGoNext) {
      const nextCardIndex = currentImageIndex + 1;
      const progress = Math.min(1, Math.abs(mx) / (windowWidth.current * 0.5));
      const nextScale = 0.95 + (0.05 * progress);
      const nextOpacity = 0.7 + (0.3 * progress);
      const nextY = 8 - (8 * progress);
      
      springApi.start(i => 
        i === nextCardIndex ? { 
          scale: nextScale, 
          opacity: nextOpacity, 
          y: nextY, 
          display: 'block', 
          config 
        } : undefined
      );
    }
    
    // 🔧 CORRECTION: Afficher la carte précédente seulement si elle existe ET si le mouvement va dans le bon sens
    if (currentImageIndex - 1 >= 0 && mx > 20 && canGoPrev) {
      const prevCardIndex = currentImageIndex - 1;
      const progress = Math.min(1, mx / (windowWidth.current * 0.5));
      const prevScale = 0.95 + (0.05 * progress);
      const prevOpacity = 0.7 + (0.3 * progress);
      const prevY = 8 - (8 * progress);
      
      springApi.start(i => 
        i === prevCardIndex ? {
          scale: prevScale, 
          opacity: prevOpacity, 
          y: prevY, 
          display: 'block', 
          config
        } : undefined
      );
    }

    // Update current card
    springApi.start(i => {
      if (i === index) {
        return { 
          x, 
          rot, 
          scale, 
          opacity: 1, 
          display: 'block', 
          config, 
          immediate: false // 🔧 CORRECTION: Jamais immediate pour fluidité
        };
      } else if (i !== currentImageIndex + 1 && i !== currentImageIndex - 1) {
        // 🔧 CORRECTION: Masquer complètement les autres cartes
        return { 
          display: 'none', 
          opacity: 0, 
          immediate: true 
        };
      }
      return undefined;
    });
  }, { 
    filterTaps: true, 
    threshold: 10,
    // 🔧 AJOUT: Configuration pour limiter les faux positifs
    axis: 'x', // Seulement horizontal
    preventScroll: true
  });

  // Navigation handlers améliorés
  const handleNavNext = useCallback(() => {
    const canGoNext = currentImageIndex < allVisuals.length - 1;
    console.log('🔘 NavButton: NEXT clicked', { canGoNext });

    if (canGoNext && springApi) {
      gone.current.add(currentImageIndex);
      
      // 🔧 CORRECTION: Animation plus fluide
      springApi.start(i => {
        if (i === currentImageIndex) {
          return springTo(i, currentImageIndex, true, -1);
        } else {
          // Masquer immédiatement les autres
          return { display: 'none', opacity: 0, immediate: true };
        }
      });
      
      setTimeout(() => onSwipeNext(), 50);
    }
  }, [currentImageIndex, allVisuals.length, springApi, springTo, onSwipeNext]);

  const handleNavPrevious = useCallback(() => {
    const canGoPrev = currentImageIndex > 0;
    console.log('🔘 NavButton: PREVIOUS clicked', { canGoPrev });

    if (canGoPrev && springApi) {
      const targetPrevIndex = currentImageIndex - 1;
      gone.current.delete(targetPrevIndex);
      
      // 🔧 CORRECTION: Animation plus fluide pour le retour
      springApi.start(i => {
        if (i === currentImageIndex) {
          return { 
            ...springTo(i, currentImageIndex, true, 1), 
            onRest: () => onSwipePrevious()
          };
        } else if (i === targetPrevIndex) {
          return { 
            ...springTo(i, targetPrevIndex), 
            x: 0, 
            y: 0, 
            rot: 0, 
            scale: 1, 
            opacity: 1, 
            display: 'block', 
            delay: 50, 
            config: MODAL_CONFIG.SPRING_CONFIG.BASE 
          };
        } else {
          // Masquer toutes les autres
          return { display: 'none', opacity: 0, immediate: true };
        }
      });
    }
  }, [currentImageIndex, springApi, springTo, onSwipePrevious]);

  const handleGoToImage = useCallback((targetIndex: number) => {
    if (targetIndex === currentImageIndex || !springApi) return;

    console.log('🎯 Pagination: Going to image', { from: currentImageIndex, to: targetIndex });

    // 🔧 CORRECTION: Reset complet avant navigation
    gone.current.clear();
    
    // Masquer toutes les cartes d'abord
    springApi.start(i => ({
      display: 'none',
      opacity: 0,
      x: 0,
      y: 0,
      rot: 0,
      scale: 0.95,
      immediate: true
    }));

    // Puis afficher la carte cible avec délai
    setTimeout(() => {
      springApi.start(i => {
        if (i === targetIndex) {
          return {
            ...springTo(i, targetIndex),
            opacity: 1,
            display: 'block',
            config: MODAL_CONFIG.SPRING_CONFIG.BASE
          };
        }
        return undefined;
      });
    }, 50);

  }, [currentImageIndex, springApi, springTo]);

  const resetGoneSet = useCallback(() => {
    console.log('🔄 SwipeGesture: Resetting gone set');
    gone.current = new Set();
  }, []);

  return {
    bind,
    handleNavNext,
    handleNavPrevious,
    handleGoToImage,
    resetGoneSet,
    updateWindowWidth,
    gone: gone.current
  };
};
// ===============================
// Fin du fichier useSwipeGesture.ts