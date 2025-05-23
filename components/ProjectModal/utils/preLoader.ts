// ===============================
// utils/preloader.ts
// ===============================
export const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || typeof window.Image === 'undefined') {
        resolve();
        return;
      }
      
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => {
        console.error(`Preload error: ${src}`);
        resolve();
      };
      img.src = src;
    });
  };
  
  export const preloadImages = async (
    images: string[], 
    priorityIndices: number[] = []
  ): Promise<void> => {
    try {
      // Preload priority images first
      const priorityImages = priorityIndices
        .map(idx => images[idx])
        .filter(Boolean);
      
      await Promise.all(priorityImages.map(preloadImage));
      
      // Preload remaining images
      const otherImages = images.filter((_, i) => !priorityIndices.includes(i));
      Promise.all(otherImages.map(preloadImage));
    } catch (error) {
      console.error("Preload error:", error);
    }
  };
  