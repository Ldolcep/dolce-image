// ========================================================================
// === HOOK SWIPE GESTURE - ARCHITECTURE SIMPLIFIÉE ET PERFORMANTE ===
// ========================================================================

// ===============================
// hooks/useSwipeGesture.ts - VERSION SIMPLIFIÉE
// ===============================
import { useCallback, useRef, useMemo } from 'react';
import { useDrag } from '@use-gesture/react';

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
  
  // 🔧 CORRECTION: Calculs mis en cache pour éviter les re-calculs
  const config = useMemo(() => {
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 300;
    return {
      windowWidth,
      triggerDistance: Math.min(windowWidth * 0.25, 80), // 25% de l'écran ou 80px max
      triggerVelocity: 0.3, // Plus permissif
      maxDrag: windowWidth * 0.4 // Limite le drag à 40% de l'écran
    };
  }, []); // Pas de dépendances, calculé une seule fois

  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, time: 0 });

  const bind = useDrag(({ 
    args: [index], 
    active, 
    movement: [mx], 
    velocity: [vx], 
    first, 
    last,
    cancel 
  }) => {
    // Early returns simplifiés
    if (!isMounted || isDraggingPanel || index !== currentImageIndex) {
      if (cancel && active) cancel();
      return;
    }

    // 🔧 CORRECTION: Gestion d'état simplifiée
    if (first) {
      isDragging.current = true;
      startPosition.current = { x: mx, time: Date.now() };
      onImageDragStart();
    }
    
    if (last) {
      isDragging.current = false;
      onImageDragEnd();
    }

    // 🔧 CORRECTION: Limites strictes avec résistance
    const canGoNext = currentImageIndex < allVisuals.length - 1;
    const canGoPrev = currentImageIndex > 0;
    
    let constrainedMx = mx;
    
    if (mx < 0 && !canGoNext) {
      // Swipe vers la gauche mais pas d'image suivante
      constrainedMx = Math.max(-30, mx * 0.2); // Résistance forte
    } else if (mx > 0 && !canGoPrev) {
      // Swipe vers la droite mais pas d'image précédente  
      constrainedMx = Math.min(30, mx * 0.2); // Résistance forte
    } else {
      // Mouvement normal mais limité
      constrainedMx = Math.max(-config.maxDrag, Math.min(config.maxDrag, mx));
    }

    if (!active) {
      // 🔧 CORRECTION: Logique de swipe simplifiée
      const deltaTime = Date.now() - startPosition.current.time;
      const deltaDistance = Math.abs(mx - startPosition.current.x);
      const avgVelocity = deltaDistance / Math.max(deltaTime, 1);
      
      const shouldSwipe = Math.abs(mx) > config.triggerDistance || avgVelocity > config.triggerVelocity;
      
      if (shouldSwipe) {
        if (mx < -10 && canGoNext) {
          // Swipe vers la gauche = image suivante
          setTimeout(() => onSwipeNext(), 0);
          return;
        } else if (mx > 10 && canGoPrev) {
          // Swipe vers la droite = image précédente
          setTimeout(() => onSwipePrevious(), 0);
          return;
        }
      }
      
      // 🔧 CORRECTION: Reset simple et rapide
      if (springApi) {
        springApi.start(i => {
          if (i === index) {
            return {
              x: 0,
              y: 0,
              rot: 0,
              scale: 1,
              opacity: 1,
              config: { tension: 300, friction: 30 }
            };
          }
          return undefined;
        });
      }
      return;
    }

    // 🔧 CORRECTION: Animation pendant le drag - Très simplifiée
    if (springApi && active) {
      const rotation = constrainedMx / 50; // Rotation plus subtile
      const scale = 1 + Math.abs(constrainedMx) / 1000; // Scale très subtil
      
      springApi.start(i => {
        if (i === index) {
          return {
            x: constrainedMx,
            rot: rotation,
            scale: Math.min(scale, 1.05), // Limite le scale
            opacity: 1,
            config: { tension: 0, friction: 0 }, // Pas de spring pendant le drag
            immediate: true // Suit exactement le doigt
          };
        }
        return undefined;
      });
    }
  }, { 
    axis: 'x',
    filterTaps: true,
    threshold: 5,
    preventScroll: true
  });

  // 🔧 CORRECTION: Navigation par boutons ultra-simplifiée
  const handleNavNext = useCallback(() => {
    if (currentImageIndex < allVisuals.length - 1 && !isDragging.current) {
      onSwipeNext();
    }
  }, [currentImageIndex, allVisuals.length, onSwipeNext]);

  const handleNavPrevious = useCallback(() => {
    if (currentImageIndex > 0 && !isDragging.current) {
      onSwipePrevious();
    }
  }, [currentImageIndex, onSwipePrevious]);

  const handleGoToImage = useCallback((targetIndex: number) => {
    if (targetIndex !== currentImageIndex && !isDragging.current) {
      // Navigation directe sans animation complexe
      // L'index sera mis à jour par le parent
    }
  }, [currentImageIndex]);

  // 🔧 CORRECTION: Reset simplifié
  const resetGoneSet = useCallback(() => {
    // Plus de "gone set" complexe, juste un reset simple
    isDragging.current = false;
  }, []);

  const updateWindowWidth = useCallback(() => {
    // Plus de recalcul constant - fait une seule fois au mount
  }, []);

  return {
    bind,
    handleNavNext,
    handleNavPrevious,
    handleGoToImage,
    resetGoneSet,
    updateWindowWidth,
    gone: new Set() // Toujours vide - pas de logique complexe
  };
};
// Fin du code
// ========================================================================