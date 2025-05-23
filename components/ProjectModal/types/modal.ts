// ===============================
// types/modal.ts
// ===============================
export interface Project {
    id: string;
    title: string;
    mainVisual: string;
    additionalVisuals: string[];
    description: string | string[];
    link: string;
  }
  
  export interface ModalState {
    currentImageIndex: number;
    isInfoVisible: boolean;
    imagesLoaded: Record<string, boolean>;
    isDraggingPanel: boolean;
    isImageDragging: boolean;
    panelTranslateY: number | null;
    dragStartY: number | null;
    isAnimating: boolean;
    isMounted: boolean;
  }
  
  export type ModalAction =
    | { type: 'SET_MOUNTED'; payload: boolean }
    | { type: 'SET_CURRENT_IMAGE'; payload: number }
    | { type: 'TOGGLE_INFO_PANEL'; payload?: boolean }
    | { type: 'SET_IMAGE_LOADED'; payload: { src: string; loaded: boolean } }
    | { type: 'START_PANEL_DRAG'; payload: { startY: number; initialY: number } }
    | { type: 'UPDATE_PANEL_DRAG'; payload: number }
    | { type: 'END_PANEL_DRAG'; payload: { finalY: number; shouldBeVisible: boolean } }
    | { type: 'SET_IMAGE_DRAGGING'; payload: boolean }
    | { type: 'SET_ANIMATING'; payload: boolean }
    | { type: 'RESET_STATE'; payload: { initialPanelY: number } };
  
  export interface SwipeGestureConfig {
    triggerDistance: number;
    triggerVelocity: number;
    dampingFactor: number;
  }
  
  export interface PanelDragConfig {
    animationDuration: number;
    contentFadeDuration: number;
    threshold: number;
    gripHeight: string;
    expandedHeight: string;
  }
  