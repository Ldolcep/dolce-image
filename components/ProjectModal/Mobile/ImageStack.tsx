// ===============================
// components/ProjectModal/Mobile/ImageStack.tsx - DIMENSIONS FIXES
// ===============================
"use client";

import React from 'react';
import { animated } from '@react-spring/web';
import { to as interpolate } from '@react-spring/web';
import Image from 'next/image';
import { Project } from '../../../types/modal';

interface ImageStackProps {
  project: Project;
  allVisuals: string[];
  currentImageIndex: number;
  springProps: any[];
  bind: (index: number) => any;
}

export const ImageStack: React.FC<ImageStackProps> = ({
  project,
  allVisuals,
  currentImageIndex,
  springProps,
  bind
}) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* 🔧 CORRECTION: Container FIXE 4:5 pour uniformité */}
      <div className="relative w-full max-w-sm aspect-[4/5] max-h-[65vh]">
        {springProps.map(({ x, y, rot, scale, opacity, display, zIndex }, i) => (
          <animated.div
            key={allVisuals[i] ? allVisuals[i] : `card-${i}`}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              display,
              opacity,
              transform: interpolate([x, y, rot, scale], (xVal, yVal, rVal, sVal) =>
                `perspective(1200px) translateX(${xVal}px) translateY(${yVal}px) rotateZ(${rVal}deg) scale(${sVal})`
              ),
              touchAction: 'none',
              zIndex,
            }}
            {...bind(i)}
          >
            {/* 🔧 CORRECTION: Container uniforme SANS coins arrondis */}
            <div className="relative w-full h-full overflow-hidden bg-white shadow-xl">
              {allVisuals[i] && (
                <>
                  {/* 🔧 CORRECTION: Image toujours en 4:5 avec object-fit cover */}
                  <Image
                    src={allVisuals[i]}
                    alt={`Image ${i + 1} du projet ${project.title}`}
                    fill
                    className="pointer-events-none"
                    style={{
                      objectFit: 'cover', // Force le crop pour uniformité
                      objectPosition: 'center',
                    }}
                    sizes="(max-width: 768px) 85vw, 400px"
                    priority={i === currentImageIndex}
                    draggable="false"
                  />
                  
                  {/* 🔧 CORRECTION: Frame subtil pour la carte active seulement */}
                  {i === currentImageIndex && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 0 2px rgba(247,165,32,0.3)',
                        background: 'linear-gradient(135deg, rgba(247,165,32,0.05) 0%, rgba(9,71,142,0.05) 100%)',
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </animated.div>
        ))}
        
        {/* 🔧 CORRECTION: Indicateur de swipe plus discret */}
        {allVisuals.length > 1 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="flex items-center space-x-1 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full">
              <div className="w-0.5 h-0.5 bg-white/60 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-white/40 rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-white/60 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// ===============================
// components/ProjectModal/Mobile/ImageStack.tsx - DIMENSIONS FIXES