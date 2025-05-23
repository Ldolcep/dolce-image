// ===============================
// config/modal.ts - CORRECTION PHASE 2
// ===============================
export const MODAL_CONFIG = {
  // Animation
  PANEL_ANIMATION_DURATION: 400,
  CONTENT_FADE_DURATION: 300,
  
  // Panel
  GRIP_HEIGHT_COLLAPSED: '8vh',
  GRIP_HEIGHT_EXPANDED: '75vh',
  PANEL_DRAG_THRESHOLD: 60,
  
  // 🔧 CORRECTION: Swipe - Valeurs optimisées pour meilleure réactivité
  SWIPE_TRIGGER_DISTANCE_RATIO: 3.0, // Plus sensible (était 3.5)
  SWIPE_TRIGGER_VELOCITY: 0.15,      // Plus sensible (était 0.18)
  SWIPE_DAMPING_FACTOR: 0.08,
  
  // Spring animations - Configurations optimisées
  SPRING_CONFIG: {
    BASE: { tension: 400, friction: 40 },
    ACTIVE: { tension: 800, friction: 50, immediate: false }, // 🔧 CORRECTION: immediate false pour smoother drag
    SWIPE_OUT: { tension: 300, friction: 26 }
  }
} as const;

// 🔧 NOUVELLE FONCTION: Helper pour calculer la distance de swipe
export const getSwipeTriggerDistance = (): number => {
const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 300;
const distance = windowWidth / MODAL_CONFIG.SWIPE_TRIGGER_DISTANCE_RATIO;

// Debug log pour vérifier les calculs
console.log('📏 SwipeConfig: Calculated trigger distance', {
  windowWidth,
  ratio: MODAL_CONFIG.SWIPE_TRIGGER_DISTANCE_RATIO,
  triggerDistance: distance,
  triggerVelocity: MODAL_CONFIG.SWIPE_TRIGGER_VELOCITY
});

return distance;
};

// 🔧 NOUVELLE FONCTION: Helper pour debug des seuils
export const logSwipeThresholds = () => {
if (typeof window !== 'undefined') {
  console.log('🎯 SwipeConfig: Current thresholds', {
    windowWidth: window.innerWidth,
    triggerDistance: getSwipeTriggerDistance(),
    triggerVelocity: MODAL_CONFIG.SWIPE_TRIGGER_VELOCITY,
    distanceRatio: MODAL_CONFIG.SWIPE_TRIGGER_DISTANCE_RATIO
  });
}
};