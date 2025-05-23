// ===============================
// hooks/useModalReducer.ts
// ===============================
import { useReducer, useMemo } from 'react';
import { ModalState, ModalAction } from '../types/modal';
import { MODAL_CONFIG } from '../config/modal';

const initialState: ModalState = {
  currentImageIndex: 0,
  isInfoVisible: false,
  imagesLoaded: {},
  isDraggingPanel: false,
  isImageDragging: false,
  panelTranslateY: null,
  dragStartY: null,
  isAnimating: false,
  isMounted: false,
};

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'SET_MOUNTED':
      return { ...state, isMounted: action.payload };
      
    case 'SET_CURRENT_IMAGE':
      return { ...state, currentImageIndex: action.payload };
      
    case 'TOGGLE_INFO_PANEL':
      return { 
        ...state, 
        isInfoVisible: action.payload ?? !state.isInfoVisible 
      };
      
    case 'SET_IMAGE_LOADED':
      return {
        ...state,
        imagesLoaded: {
          ...state.imagesLoaded,
          [action.payload.src]: action.payload.loaded
        }
      };
      
    case 'START_PANEL_DRAG':
      return {
        ...state,
        isDraggingPanel: true,
        dragStartY: action.payload.startY,
        panelTranslateY: action.payload.initialY
      };
      
    case 'UPDATE_PANEL_DRAG':
      return { ...state, panelTranslateY: action.payload };
      
    case 'END_PANEL_DRAG':
      return {
        ...state,
        isDraggingPanel: false,
        dragStartY: null,
        panelTranslateY: action.payload.finalY,
        isInfoVisible: action.payload.shouldBeVisible
      };
      
    case 'SET_IMAGE_DRAGGING':
      return { ...state, isImageDragging: action.payload };
      
    case 'SET_ANIMATING':
      return { ...state, isAnimating: action.payload };
      
    case 'RESET_STATE':
      return {
        ...initialState,
        isMounted: true,
        panelTranslateY: action.payload.initialPanelY
      };
      
    default:
      return state;
  }
};

export const useModalReducer = () => {
  const [state, dispatch] = useReducer(modalReducer, initialState);
  
  const actions = useMemo(() => ({
    setMounted: (mounted: boolean) => 
      dispatch({ type: 'SET_MOUNTED', payload: mounted }),
      
    setCurrentImage: (index: number) => 
      dispatch({ type: 'SET_CURRENT_IMAGE', payload: index }),
      
    toggleInfoPanel: (visible?: boolean) => 
      dispatch({ type: 'TOGGLE_INFO_PANEL', payload: visible }),
      
    setImageLoaded: (src: string, loaded: boolean) => 
      dispatch({ type: 'SET_IMAGE_LOADED', payload: { src, loaded } }),
      
    startPanelDrag: (startY: number, initialY: number) => 
      dispatch({ type: 'START_PANEL_DRAG', payload: { startY, initialY } }),
      
    updatePanelDrag: (y: number) => 
      dispatch({ type: 'UPDATE_PANEL_DRAG', payload: y }),
      
    endPanelDrag: (finalY: number, shouldBeVisible: boolean) => 
      dispatch({ type: 'END_PANEL_DRAG', payload: { finalY, shouldBeVisible } }),
      
    setImageDragging: (dragging: boolean) => 
      dispatch({ type: 'SET_IMAGE_DRAGGING', payload: dragging }),
      
    setAnimating: (animating: boolean) => 
      dispatch({ type: 'SET_ANIMATING', payload: animating }),
      
    resetState: (initialPanelY: number) => 
      dispatch({ type: 'RESET_STATE', payload: { initialPanelY } })
  }), []);
  
  return { state, actions };
};
