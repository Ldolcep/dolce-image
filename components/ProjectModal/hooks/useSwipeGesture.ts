// ========================================================================
// === HOOK SWIPE GESTURE ===
// ========================================================================

// ===============================
// hooks/useSwipeGesture.ts
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
    if (first) onImageDragStart();
    if (last) setTimeout(() => onImageDragEnd(), 50);

    // Track currently dragged index
    indexBeingDragged.current = active ? index : null;

    const triggerDistance = getSwipeTriggerDistance();
    const triggerVelocity = MODAL_CONFIG.SWIPE_TRIGGER_VELOCITY;

    // Handle drag end - check for swipe
    if (!active) {
      let swiped = false;
      
      if (Math.abs(mx) > triggerDistance || Math.abs(vx) > triggerVelocity) {
        const dir = xDir < 0 ? -1 : 1;
        
        // Swipe left (next image)
        if (dir === -1 && currentImageIndex < allVisuals.length - 1) {
          gone.current.add(index);
          springApi.start(i => 
            i === index ? springTo(i, currentImageIndex, true, dir) : undefined
          );
          setTimeout(() => onSwipeNext(), 50);
          swiped = true;
        } 
        // Swipe right (previous image)
        else if (dir === 1 && currentImageIndex > 0) {
          gone.current.add(index);
          springApi.start(i => 
            i === index ? springTo(i, currentImageIndex, true, dir) : undefined
          );
          setTimeout(() => onSwipePrevious(), 50);
          swiped = true;
        }
      }
      
      // Reset if no swipe occurred
      if (!swiped) {
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

  // Navigation handlers
  const handleNavNext = useCallback(() => {
    if (currentImageIndex < allVisuals.length - 1 && springApi) {
      gone.current.add(currentImageIndex);
      springApi.start(i => 
        i === currentImageIndex ? springTo(i, currentImageIndex, true, -1) : undefined
      );
      setTimeout(() => onSwipeNext(), 50);
    }
  }, [currentImageIndex, allVisuals.length, springApi, springTo, onSwipeNext]);

  const handleNavPrevious = useCallback(() => {
    if (currentImageIndex > 0 && springApi) {
      const targetPrevIndex = currentImageIndex - 1;
      gone.current.delete(targetPrevIndex);
      
      springApi.start(i => 
        i === currentImageIndex ? { 
          ...springTo(i, currentImageIndex, true, 1), 
          onRest: () => onSwipePrevious()
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
    }
  }, [currentImageIndex, springApi, springTo, onSwipePrevious]);

  const handleGoToImage = useCallback((targetIndex: number) => {
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

    // Update the current image index through the parent callback
    // This will be handled in the parent component
  }, [currentImageIndex, springApi]);

  const resetGoneSet = useCallback(() => {
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
// This hook handles swipe gestures for navigating through images in a gallery.
// It uses the `useDrag` hook from `@use-gesture/react` to manage drag events and animations.