// ===============================
// components/ProjectModal/Mobile/NavigationControls.tsx - UN SEUL INDICATEUR
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
  if (allVisuals.length <= 1) return null;

  const handlePreviousClick = () => {
    if (!isImageDragging && !isDraggingPanel && currentImageIndex > 0) {
      onPrevious();
    }
  };

  const handleNextClick = () => {
    if (!isImageDragging && !isDraggingPanel && currentImageIndex < allVisuals.length - 1) {
      onNext();
    }
  };

  const handleDotClick = (index: number) => {
    if (!isImageDragging && !isDraggingPanel && index !== currentImageIndex) {
      onGoToImage(index);
    }
  };

  const shouldShow = !isImageDragging && !isDraggingPanel;

  return (
    <>
      {/* Navigation Buttons */}
      {shouldShow && (
        <>
          <button 
            onClick={handlePreviousClick}
            disabled={currentImageIndex <= 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 ${
              currentImageIndex <= 0 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:bg-white active:scale-95 hover:shadow-xl'
            }`}
            aria-label="Image précédente"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={handleNextClick}
            disabled={currentImageIndex >= allVisuals.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 ${
              currentImageIndex >= allVisuals.length - 1
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:bg-white active:scale-95 hover:shadow-xl'
            }`}
            aria-label="Image suivante"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* 🔧 CORRECTION: UN SEUL indicateur principal (suppression du second) */}
      {shouldShow && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex justify-center z-[35] transition-opacity duration-300"
          style={{ bottom: '2rem' }}
          aria-label="Indicateurs d'image"
        >
          <div className="flex space-x-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
            {allVisuals.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                className={`rounded-full transition-all duration-300 ${
                  currentImageIndex === idx 
                    ? 'w-3 h-3 bg-primary-orange scale-110' 
                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400 active:scale-110'
                }`}
                aria-label={`Aller à l'image ${idx + 1}`}
                aria-current={currentImageIndex === idx ? "step" : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
// ===============================
// components/ProjectModal/Mobile/NavigationControls.tsx - UN SEUL INDICATEUR