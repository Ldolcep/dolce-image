// ===============================
// config/modal.ts - ULTRA SMOOTH CONFIGURATION
// ===============================
export const MODAL_CONFIG = {
  // Animation - Durées optimisées
  PANEL_ANIMATION_DURATION: 350, // Plus rapide
  CONTENT_FADE_DURATION: 250,    // Plus fluide
  
  // Panel
  GRIP_HEIGHT_COLLAPSED: '8vh',
  GRIP_HEIGHT_EXPANDED: '75vh',
  PANEL_DRAG_THRESHOLD: 50, // Plus sensible
  
  // 🔧 CORRECTION: Swipe ultra-réactif
  SWIPE_TRIGGER_DISTANCE_RATIO: 2.8, // Plus sensible
  SWIPE_TRIGGER_VELOCITY: 0.12,      // Plus sensible
  SWIPE_DAMPING_FACTOR: 0.06,        // Plus fluide
  
  // 🎨 AESTHETIC: Spring configurations ultra-fluides
  SPRING_CONFIG: {
    // Configuration de base - Fluide et naturelle
    BASE: { 
      tension: 280,  // Réactivité modérée
      friction: 38,  // Amortissement doux
      mass: 1,       // Poids naturel
      precision: 0.01 // Précision fine
    },
    
    // Configuration pendant interaction - Très réactive
    ACTIVE: { 
      tension: 450,   // Très réactif au touch
      friction: 45,   // Contrôle précis
      mass: 0.8,      // Plus léger
      immediate: false, // Toujours animé
      precision: 0.005  // Très précis
    },
    
    // Configuration de sortie - Élégante et rapide
    SWIPE_OUT: { 
      tension: 220,   // Sortie élégante
      friction: 28,   // Fluide
      mass: 1.2,      // Légèrement plus lourd pour l'élan
      precision: 0.02 // Moins précis car on sort
    },
    
    // 🆕 NOUVEAU: Configuration pour reset
    RESET: {
      tension: 300,
      friction: 35,
      mass: 1,
      precision: 0.01
    },
    
    // 🆕 NOUVEAU: Configuration pour navigation directe (dots)
    NAVIGATION: {
      tension: 320,
      friction: 40,
      mass: 0.9,
      precision: 0.01
    }
  }
} as const;

// Helper functions optimisées
export const getSwipeTriggerDistance = (): number => {
const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 300;
const distance = Math.max(
  40, // Distance minimum
  Math.min(
    windowWidth / MODAL_CONFIG.SWIPE_TRIGGER_DISTANCE_RATIO,
    120 // Distance maximum
  )
);

console.log('📏 SwipeConfig: Optimized trigger distance', {
  windowWidth,
  distance,
  velocity: MODAL_CONFIG.SWIPE_TRIGGER_VELOCITY
});

return distance;
};

// 🆕 NOUVEAU: Helper pour transition élastique aux limites
export const getElasticResistance = (movement: number, isAtLimit: boolean): number => {
if (!isAtLimit) return movement;

// Résistance élastique progressive
const resistance = Math.abs(movement) < 20 ? 0.5 : 
                  Math.abs(movement) < 50 ? 0.3 : 
                  Math.abs(movement) < 100 ? 0.15 : 0.05;

return movement * resistance;
};

// 🆕 NOUVEAU: Helper pour calculer l'opacity des cartes arrière
export const calculateBackgroundCardOpacity = (
cardIndex: number, 
activeIndex: number, 
dragProgress: number = 0
): number => {
const distance = Math.abs(cardIndex - activeIndex);

if (distance === 0) return 1; // Carte active
if (distance === 1) {
  // Carte adjacente avec progression du drag
  return Math.max(0.1, Math.min(0.6, 0.3 + (dragProgress * 0.3)));
}

return 0; // Autres cartes invisibles
};

// 🆕 NOUVEAU: Helper pour calculer le scale des cartes
export const calculateCardScale = (
cardIndex: number,
activeIndex: number,
dragProgress: number = 0
): number => {
const distance = Math.abs(cardIndex - activeIndex);

if (distance === 0) return 1; // Carte active
if (distance === 1) {
  // Carte adjacente qui grandit pendant le drag
  return Math.max(0.88, Math.min(0.96, 0.90 + (dragProgress * 0.06)));
}

return 0.85; // Autres cartes
};

// Debug et monitoring
export const logPerformanceMetrics = () => {
if (typeof window !== 'undefined' && window.performance) {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  console.log('📊 Performance Metrics:', {
    loadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    springConfig: MODAL_CONFIG.SPRING_CONFIG
  });
}
};
// Appel de la fonction de log