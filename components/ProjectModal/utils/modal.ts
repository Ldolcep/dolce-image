// ===============================
// utils/modal.ts - IMPORT CORRIGÉ
// ===============================

// 🔧 CORRECTION CRITIQUE: Import du config
const MODAL_CONFIG = {
  GRIP_HEIGHT_COLLAPSED: '8vh',
  GRIP_HEIGHT_EXPANDED: '75vh',
  PANEL_DRAG_THRESHOLD: 50,
} as const;

export const calculateInitialCollapsedY = (isMounted: boolean): number | null => {
    if (typeof window !== 'undefined' && isMounted) {
      try {
        const vh = window.innerHeight;
        const gripHeightPx = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED) / 100;
        const expandedHeightPx = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_EXPANDED) / 100;
        return expandedHeightPx - gripHeightPx;
      } catch (e) {
        console.error("Error calculating initialCollapsedY", e);
        return null;
      }
    }
    return null;
  };
  
  export const calculatePanelY = (
    deltaY: number, 
    initialY: number, 
    isMounted: boolean
  ): number => {
    if (!isMounted) return 0;
    
    try {
      const newY = initialY + deltaY;
      const vh = window.innerHeight;
      const gripH = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED) / 100;
      const expandedH = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_EXPANDED) / 100;
      
      const collapsedY = expandedH - gripH;
      const expandedY = 0;
      const minY = expandedY - 50;
      const maxY = collapsedY + 50;
      
      return Math.max(minY, Math.min(maxY, newY));
    } catch (error) {
      console.error("Panel Y calc error:", error);
      return initialY;
    }
  };
  
  export const shouldPanelBeVisible = (
    deltaY: number, 
    isCurrentlyVisible: boolean, 
    threshold: number = MODAL_CONFIG.PANEL_DRAG_THRESHOLD
  ): boolean => {
    return isCurrentlyVisible ? deltaY <= threshold : deltaY < -threshold;
  };
