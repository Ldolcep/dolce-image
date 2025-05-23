// ===============================
// hooks/usePanelDrag.ts
// ===============================
import { useCallback } from 'react';
import { calculatePanelY, shouldPanelBeVisible } from '../utils/modal';
import { MODAL_CONFIG } from '../config/modal';

export const usePanelDrag = (
  panelRef: React.RefObject<HTMLDivElement>,
  state: ModalState,
  actions: ReturnType<typeof useModalReducer>['actions']
) => {
  const updateContentVisibility = useCallback((currentY: number | null) => {
    if (currentY === null || !panelRef.current) return;
    
    try {
      const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
      if (!contentElement) return;
      
      const vh = window.innerHeight;
      const gripH = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED) / 100;
      const expandedH = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_EXPANDED) / 100;
      const collapsedY = expandedH - gripH;
      const expandedY = 0;
      const totalTravel = collapsedY - expandedY;
      
      if (totalTravel <= 0) return;
      
      const progress = Math.max(0, Math.min(1, (currentY - expandedY) / totalTravel));
      const opacity = 1 - progress;
      
      contentElement.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
      contentElement.style.display = opacity > 0 ? 'block' : 'none';
    } catch (error) {
      console.error("Content visibility error", error);
    }
  }, [panelRef]);

  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    if (state.isImageDragging) {
      console.log("PanelTouchStart: Blocked by active image drag/swipe");
      return;
    }
    
    const target = e.target as Node;
    const panelContent = panelRef.current?.querySelector('.panel-content');
    const isTouchingScrollableContent = panelContent?.contains(target) && 
      state.isInfoVisible && 
      panelContent.scrollHeight > panelContent.clientHeight;
    
    if (isTouchingScrollableContent) {
      console.log("PanelTouchStart: Allowing default for scrollable content");
      return;
    }
    
    try {
      e.stopPropagation();
      
      if (panelRef.current) {
        panelRef.current.style.transition = 'none';
        const style = window.getComputedStyle(panelRef.current);
        const matrix = new DOMMatrix(style.transform === 'none' ? '' : style.transform);
        const initialY = matrix.m42;
        
        actions.startPanelDrag(e.touches[0].clientY, initialY);
        
        if (!state.isInfoVisible && panelContent) {
          (panelContent as HTMLElement).style.display = 'block';
        }
      }
    } catch (error) {
      console.error("PanelTouchStart error:", error);
    }
  }, [state.isImageDragging, state.isInfoVisible, panelRef, actions]);

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (state.dragStartY === null || !state.isDraggingPanel || !panelRef.current) return;
    
    try {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
      
      const initialY = state.panelTranslateY ?? 0;
      const targetY = calculatePanelY(
        e.touches[0].clientY - state.dragStartY, 
        initialY, 
        state.isMounted
      );
      
      requestAnimationFrame(() => {
        if (!panelRef.current) return;
        panelRef.current.style.transform = `translateY(${targetY}px)`;
        updateContentVisibility(targetY);
      });
      
      actions.updatePanelDrag(targetY);
    } catch (error) {
      console.error("PanelTouchMove error:", error);
    }
  }, [state.dragStartY, state.isDraggingPanel, state.panelTranslateY, state.isMounted, panelRef, actions, updateContentVisibility]);

  const handlePanelTouchEnd = useCallback(() => {
    if (state.dragStartY === null || !state.isDraggingPanel || state.panelTranslateY === null || !panelRef.current) return;
    
    const initialY = state.panelTranslateY;
    const deltaY = state.panelTranslateY - initialY;
    
    try {
      const vh = window.innerHeight;
      const gripH = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED) / 100;
      const expandedH = vh * parseFloat(MODAL_CONFIG.GRIP_HEIGHT_EXPANDED) / 100;
      const collapsedY = expandedH - gripH;
      const expandedY = 0;
      
      const shouldBeVisible = shouldPanelBeVisible(deltaY, state.isInfoVisible);
      const targetY = shouldBeVisible ? expandedY : collapsedY;
      
      panelRef.current.style.transition = `transform ${MODAL_CONFIG.PANEL_ANIMATION_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      panelRef.current.style.transform = `translateY(${targetY}px)`;
      
      actions.endPanelDrag(targetY, shouldBeVisible);
      
      const contentElement = panelRef.current.querySelector('.panel-content') as HTMLElement;
      if (contentElement) {
        contentElement.style.transition = `opacity ${MODAL_CONFIG.CONTENT_FADE_DURATION}ms ease-out`;
        if (shouldBeVisible) {
          contentElement.style.display = 'block';
          requestAnimationFrame(() => {
            contentElement.style.opacity = '1';
          });
        } else {
          contentElement.style.opacity = '0';
          setTimeout(() => {
            if (!state.isInfoVisible) contentElement.style.display = 'none';
          }, MODAL_CONFIG.CONTENT_FADE_DURATION + 50);
        }
      }
    } catch (error) {
      console.error("PanelTouchEnd error:", error);
    }
  }, [state, panelRef, actions]);

  return {
    handlePanelTouchStart,
    handlePanelTouchMove,
    handlePanelTouchEnd,
    updateContentVisibility
  };
};
// This code is a React hook that manages the drag-and-drop functionality of a panel in a modal component.
// It handles touch events to allow users to drag the panel up and down, revealing or hiding content.