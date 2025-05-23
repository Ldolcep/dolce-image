// ===============================
// components/ProjectModal/Mobile/NavigationControls.tsx
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

  return (
    <>
      {/* Navigation Buttons */}
      {!isImageDragging && !isDraggingPanel && (
        <>
          <button 
            onClick={onPrevious}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" 
            aria-label="Précédent"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/10 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 active:bg-black/20" 
            aria-label="Suivant"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Indicators */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 flex justify-center pointer-events-none transition-opacity duration-300 z-[35] ${
          isImageDragging || isDraggingPanel ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ bottom: '1rem' }}
        aria-label="Indicateurs d'image"
        aria-hidden={isImageDragging || isDraggingPanel}
      >
        <div className="px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full pointer-events-auto">
          {allVisuals.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onGoToImage(idx)}
              className={`w-2 h-2 mx-1 rounded-full transition-colors ${
                currentImageIndex === idx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Aller à l'image ${idx + 1}`}
              aria-current={currentImageIndex === idx ? "step" : undefined}
            />
          ))}
        </div>
      </div>
    </>
  );
};
