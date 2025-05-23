// ===============================
// hooks/useImagePreloader.ts
// ===============================
import { useEffect } from 'react';
import { preloadImages } from '../utils/preloader';

export const useImagePreloader = (
  isOpen: boolean,
  allVisuals: string[],
  currentImageIndex: number,
  isMounted: boolean,
  onImageLoaded: (src: string, loaded: boolean) => void
) => {
  useEffect(() => {
    if (!isMounted || !isOpen || !allVisuals?.length) return;
    
    const currentNextForPreload = allVisuals.length > 0 
      ? (currentImageIndex + 1) % allVisuals.length 
      : 0;
    const currentPrevForPreload = allVisuals.length > 0 
      ? (currentImageIndex - 1 + allVisuals.length) % allVisuals.length 
      : 0;

    const preloadWithCallback = async (src: string): Promise<void> => {
      try {
        await preloadImages([src]);
        onImageLoaded(src, true);
      } catch (error) {
        console.error(`Preload error: ${src}`, error);
      }
    };

    const preloadAllImages = async () => {
      try {
        const priorityIndices = [...new Set([
          currentImageIndex, 
          currentNextForPreload, 
          currentPrevForPreload
        ])];
        
        // Preload priority images with callback
        await Promise.all(
          priorityIndices.map(idx => 
            allVisuals[idx] ? preloadWithCallback(allVisuals[idx]) : Promise.resolve()
          )
        );
        
        // Preload other images in background
        const otherImages = allVisuals.filter((_, i) => !priorityIndices.includes(i));
        Promise.all(otherImages.map(src => src ? preloadWithCallback(src) : Promise.resolve()));
      } catch (error) {
        console.error("Preload error:", error);
      }
    };

    preloadAllImages();
  }, [isOpen, allVisuals, currentImageIndex, isMounted, onImageLoaded]);
};
