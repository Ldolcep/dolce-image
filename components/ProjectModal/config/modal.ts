// ===============================
// config/modal.ts YO
// ===============================
export const MODAL_CONFIG = {
    // Animation
    PANEL_ANIMATION_DURATION: 400,
    CONTENT_FADE_DURATION: 300,
    
    // Panel
    GRIP_HEIGHT_COLLAPSED: '8vh',
    GRIP_HEIGHT_EXPANDED: '75vh',
    PANEL_DRAG_THRESHOLD: 60,
    
    // Swipe
    SWIPE_TRIGGER_DISTANCE_RATIO: 3.5, // windowWidth / 3.5
    SWIPE_TRIGGER_VELOCITY: 0.18,
    SWIPE_DAMPING_FACTOR: 0.08,
    
    // Spring animations
    SPRING_CONFIG: {
      BASE: { tension: 400, friction: 40 },
      ACTIVE: { tension: 800, friction: 50, immediate: true },
      SWIPE_OUT: { tension: 300, friction: 26 }
    }
  } as const;
  