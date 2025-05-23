// ===============================
// config/modal.ts - VERSION PROPRE SANS LOGS
// ===============================
export const MODAL_CONFIG = {
  // Animation - Durées optimisées
  PANEL_ANIMATION_DURATION: 300,
  CONTENT_FADE_DURATION: 200,
  
  // Panel
  GRIP_HEIGHT_COLLAPSED: '8vh',
  GRIP_HEIGHT_EXPANDED: '75vh',
  PANEL_DRAG_THRESHOLD: 50,
  
  // 🔧 CORRECTION: Swipe simplifié
  SWIPE_TRIGGER_DISTANCE_RATIO: 4.0, // Moins sensible pour éviter les faux positifs
  SWIPE_TRIGGER_VELOCITY: 0.2,       // Seuil raisonnable
  SWIPE_DAMPING_FACTOR: 0.06,
  
  // 🔧 CORRECTION: Spring configurations ultra-simples
  SPRING_CONFIG: {
    // Configuration de base - Très simple
    BASE: { 
      tension: 200,
      friction: 25
    },
    
    // Configuration pendant interaction - Instantané
    ACTIVE: { 
      tension: 0,    // Pas de spring pendant le drag
      friction: 0,   // Pas de resistance
      immediate: true // Suit exactement le doigt
    },
    
    // Configuration de sortie - Rapide et fluide
    SWIPE_OUT: { 
      tension: 180,
      friction: 20
    }
  }
} as const;

// 🔧 CORRECTION: Helper simplifié SANS logs
export const getSwipeTriggerDistance = (): number => {
const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 300;
return Math.min(windowWidth / MODAL_CONFIG.SWIPE_TRIGGER_DISTANCE_RATIO, 100);
};
// 🔧 CORRECTION: Helper simplifié SANS logs