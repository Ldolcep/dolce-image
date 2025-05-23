// ===============================
// components/ProjectModal/Mobile/NavigationControls.tsx - DEBUG VERSION
// ===============================
"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavigationControlsProps {
  allVisuals: string[];
  currentImageIndex: number;
  isImageDragging: boolean;
  isDraggingPanel: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onGoToImage: (index: number) => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  allVisuals,
  currentImageIndex,
  isImageDragging,
  isDraggingPanel,
  onPrevious,
  onNext,
  onGoToImage
}) => {
  // 🐛 DEBUG - Log des props
  console.log('🎮 NavigationControls Debug:', {
    allVisuals: allVisuals.length,
    currentImageIndex,
    isImageDragging,
    isDraggingPanel,
    hasOnPrevious: typeof onPrevious === 'function',
    hasOnNext: typeof onNext === 'function',
    hasOnGoToImage: typeof onGoToImage === 'function'
  });

  if (allVisuals.length <= 1) {
    console.log('🚫 NavigationControls: Single image, hiding navigation');
    return null;
  }

  // 🔧 CORRECTION: Handlers avec debug
  const handlePreviousClick = () => {
    console.log('🔘 NavigationControls: Previous button clicked', {
      currentIndex: currentImageIndex,
      canGoPrev: currentImageIndex > 0,
      isBlocked: isImageDragging || isDraggingPanel
    });

    if (!isImageDragging && !isDraggingPanel && currentImageIndex > 0) {
      onPrevious();
    } else {
      console.log('🚫 NavigationControls: Previous click blocked');
    }
  };

  const handleNextClick = () => {
    console.log('🔘 NavigationControls: Next button clicked', {
      currentIndex: currentImageIndex,
      canGoNext: currentImageIndex < allVisuals.length - 1,
      isBlocked: isImageDragging || isDraggingPanel
    });

    if (!isImageDragging && !isDraggingPanel && currentImageIndex < allVisuals.length - 1) {
      onNext();
    } else {
      console.log('🚫 NavigationControls: Next click blocked');
    }
  };

  const handleDotClick = (index: number) => {
    console.log('🎯 NavigationControls: Dot clicked', {
      targetIndex: index,
      currentIndex: currentImageIndex,
      isBlocked: isImageDragging || isDraggingPanel
    });

    if (!isImageDragging && !isDraggingPanel && index !== currentImageIndex) {
      onGoToImage(index);
    } else {
      console.log('🚫 NavigationControls: Dot click blocked');
    }
  };

  // 🔧 CORRECTION: Conditions d'affichage améliorées
  const shouldShowButtons = !isImageDragging && !isDraggingPanel;
  const shouldShowPagination = !isImageDragging && !isDraggingPanel;

  console.log('👁️ NavigationControls: Visibility', {
    shouldShowButtons,
    shouldShowPagination,
    buttonsOpacity: shouldShowButtons ? 1 : 0,
    paginationOpacity: shouldShowPagination ? 1 : 0
  });

  return (
    <>
      {/* Navigation Buttons */}
      <button 
        onClick={handlePreviousClick}
        disabled={currentImageIndex <= 0 || isImageDragging || isDraggingPanel}
        className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 transition-all duration-300 ${
          shouldShowButtons ? 'opacity-100' : 'opacity-0'
        } ${
          currentImageIndex <= 0 ? 'cursor-not-allowed opacity-50' : 'active:bg-black/20 hover:bg-black/15'
        }`}
        aria-label="Précédent"
        style={{ 
          pointerEvents: shouldShowButtons && currentImageIndex > 0 ? 'auto' : 'none'
        }}
      >
        <ChevronLeft size={24} />
      </button>

      <button 
        onClick={handleNextClick}
        disabled={currentImageIndex >= allVisuals.length - 1 || isImageDragging || isDraggingPanel}
        className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 transition-all duration-300 ${
          shouldShowButtons ? 'opacity-100' : 'opacity-0'
        } ${
          currentImageIndex >= allVisuals.length - 1 ? 'cursor-not-allowed opacity-50' : 'active:bg-black/20 hover:bg-black/15'
        }`}
        aria-label="Suivant"
        style={{ 
          pointerEvents: shouldShowButtons && currentImageIndex < allVisuals.length - 1 ? 'auto' : 'none'
        }}
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Indicators */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 flex justify-center pointer-events-none transition-opacity duration-300 z-[35] ${
          shouldShowPagination ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ bottom: '1rem' }}
        aria-label="Indicateurs d'image"
        aria-hidden={!shouldShowPagination}
      >
        <div className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full pointer-events-auto">
          {allVisuals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              disabled={isImageDragging || isDraggingPanel}
              className={`w-2 h-2 mx-1 rounded-full transition-all duration-300 ${
                currentImageIndex === idx 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 hover:bg-white/70'
              } ${
                isImageDragging || isDraggingPanel 
                  ? 'cursor-not-allowed' 
                  : 'cursor-pointer'
              }`}
              aria-label={`Aller à l'image ${idx + 1}`}
              aria-current={currentImageIndex === idx ? "step" : undefined}
              style={{ 
                pointerEvents: shouldShowPagination ? 'auto' : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
// Note: The above code is a debug version of the NavigationControls component.
// It includes additional logging for debugging purposes and improved conditions for showing/hiding elements.