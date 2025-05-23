// ========================================================================
// === HOOK SWIPE GESTURE - VERSION DEBUG PHASE 2 ===
// ========================================================================

// ===============================
// hooks/useSwipeGesture.ts - AVEC LOGS DEBUG
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
    // 🐛 DEBUG - Log de base
    console.log('🔍 SwipeGesture Debug:', {
      index,
      currentImageIndex,
      active,
      mx,
      xDir,
      vx,
      isDraggingPanel,
      isMounted
    });

    // Early returns for invalid states
    if (!isMounted || isDraggingPanel || index !== currentImageIndex) {
      console.log('❌ SwipeGesture: Early return', { 
        isMounted, 
        isDraggingPanel, 
        indexMatch: index === currentImageIndex 
      });
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

    console.log('📏 SwipeGesture: Thresholds', { triggerDistance, triggerVelocity });

    // Handle drag end - check for swipe
    if (!active) {
      let swiped = false;
      
      console.log('🎯 SwipeGesture: Checking swipe conditions', {
        absMovement: Math.abs(mx),
        triggerDistance,
        absVelocity: Math.abs(vx),
        triggerVelocity,
        direction: xDir
      });

      if (Math.abs(mx) > triggerDistance || Math.abs(vx) > triggerVelocity) {
        const dir = xDir < 0 ? -1 : 1;
        
        console.log('✅ SwipeGesture: Swipe detected!', {
          direction: dir,
          xDir,
          currentIndex: currentImageIndex,
          totalImages: allVisuals.length
        });
        
        // 🔄 CORRECTION: Swipe left (dir = -1) = NEXT image
        if (dir === -1 && currentImageIndex < allVisuals.length - 1) {
          console.log('➡️ SwipeGesture: Going to NEXT image', {
            from: currentImageIndex,
            to: currentImageIndex + 1
          });
          
          gone.current.add(index);
          springApi.start(i => 
            i === index ? springTo(i, currentImageIndex, true, dir) : undefined
          );
          setTimeout(() => {
            console.log('📞 SwipeGesture: Calling onSwipeNext');
            onSwipeNext();
          }, 50);
          swiped = true;
        } 
        // 🔄 CORRECTION: Swipe right (dir = 1) = PREVIOUS image
        else if (dir === 1 && currentImageIndex > 0) {
          console.log('⬅️ SwipeGesture: Going to PREVIOUS image', {
            from: currentImageIndex,
            to: currentImageIndex - 1
          });
          
          gone.current.add(index);
          springApi.start(i => 
            i === index ? springTo(i, currentImageIndex, true, dir) : undefined
          );
          setTimeout(() => {
            console.log('📞 SwipeGesture: Calling onSwipePrevious');
            onSwipePrevious();
          }, 50);
          swiped = true;
        } else {
          console.log('🚫 SwipeGesture: Swipe blocked by boundaries', {
            direction: dir,
            currentIndex: currentImageIndex,
            canGoNext: currentImageIndex < allVisuals.length - 1,
            canGoPrev: currentImageIndex > 0
          });
        }
      } else {
        console.log('🚫 SwipeGesture: Movement below threshold');
      }
      
      // Reset if no swipe occurred
      if (!swiped) {
        console.log('🔄 SwipeGesture: Resetting position');
        springApi.start(i => 
          i === index ? springTo(i, currentImageIndex) : undefined
        );
      }
      
      indexBeingDragged.current = null;
      return;
    }

    // Handle active drag
    const x = mx;
    const rot = mx / 12;
    const scale = 1.05;
    const config = MODAL_CONFIG.SPRING_CONFIG.ACTIVE;

    // Update next card visibility during drag
    if (currentImageIndex + 1 < allVisuals.length) {
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
    
    // Update previous card visibility during right swipe
    if (currentImageIndex - 1 >= 0 && mx > 10) {
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
          immediate: active 
        };
      } else if (i !== currentImageIndex + 1 && i !== currentImageIndex - 1) {
        return springTo(i, currentImageIndex);
      }
      return undefined;
    });
  }, { 
    filterTaps: true, 
    threshold: 10 
  });

  // 🔧 CORRECTION: Navigation handlers améliorés
  const handleNavNext = useCallback(() => {
    console.log('🔘 NavButton: NEXT clicked', {
      currentIndex: currentImageIndex,
      maxIndex: allVisuals.length - 1,
      canGo: currentImageIndex < allVisuals.length - 1
    });

    if (currentImageIndex < allVisuals.length - 1 && springApi) {
      gone.current.add(currentImageIndex);
      springApi.start(i => 
        i === currentImageIndex ? springTo(i, currentImageIndex, true, -1) : undefined
      );
      setTimeout(() => {
        console.log('📞 NavButton: Calling onSwipeNext');
        onSwipeNext();
      }, 50);
    } else {
      console.log('🚫 NavButton: NEXT blocked');
    }
  }, [currentImageIndex, allVisuals.length, springApi, springTo, onSwipeNext]);

  const handleNavPrevious = useCallback(() => {
    console.log('🔘 NavButton: PREVIOUS clicked', {
      currentIndex: currentImageIndex,
      minIndex: 0,
      canGo: currentImageIndex > 0
    });

    if (currentImageIndex > 0 && springApi) {
      const targetPrevIndex = currentImageIndex - 1;
      gone.current.delete(targetPrevIndex);
      
      springApi.start(i => 
        i === currentImageIndex ? { 
          ...springTo(i, currentImageIndex, true, 1), 
          onRest: () => {
            console.log('📞 NavButton: Calling onSwipePrevious');
            onSwipePrevious();
          }
        } : (i === targetPrevIndex ? { 
          ...springTo(i, targetPrevIndex), 
          x: 0, 
          y: 0, 
          rot: 0, 
          scale: 1, 
          opacity: 1, 
          display: 'block', 
          delay: 50, 
          config: MODAL_CONFIG.SPRING_CONFIG.BASE 
        } : undefined)
      );
    } else {
      console.log('🚫 NavButton: PREVIOUS blocked');
    }
  }, [currentImageIndex, springApi, springTo, onSwipePrevious]);

  const handleGoToImage = useCallback((targetIndex: number) => {
    console.log('🎯 Pagination: Going to image', {
      from: currentImageIndex,
      to: targetIndex,
      isValid: targetIndex !== currentImageIndex && springApi
    });

    if (targetIndex === currentImageIndex || !springApi) return;

    if (targetIndex > currentImageIndex) {
      // Going forward - mark intermediate images as gone
      for (let k = currentImageIndex; k < targetIndex; k++) {
        if (k !== currentImageIndex) gone.current.add(k);
      }
    } else {
      // Going backward - mark intermediate images as gone and restore target
      for (let k = targetIndex + 1; k <= currentImageIndex; k++) {
        gone.current.add(k);
      }
      gone.current.delete(targetIndex);
    }

    // Note: L'index sera mis à jour par le parent component
    console.log('📞 Pagination: Target index set, parent should update state');
  }, [currentImageIndex, springApi]);

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
// Note: Le hook utilise useCallback pour éviter de recréer les fonctions à chaque rendu.
// Il est important de gérer les dépendances correctement pour éviter les boucles infinies.