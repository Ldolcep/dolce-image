// ===============================
// components/ProjectModal/Mobile/ImageStack.tsx - AESTHETIC FIX
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
    <div className="relative w-full h-full max-w-md mx-auto">
      {/* 🎨 AESTHETIC: Container avec dimensions uniformes */}
      <div className="relative w-full aspect-[3/4] max-h-[70vh]">
        {springProps.map(({ x, y, rot, scale, opacity, display, zIndex }, i) => (
          <animated.div
            key={allVisuals[i] ? allVisuals[i] : `card-${i}`}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              display,
              opacity,
              transform: interpolate([x, y, rot, scale], (xVal, yVal, rVal, sVal) =>
                `perspective(1500px) translateX(${xVal}px) translateY(${yVal}px) rotateZ(${rVal}deg) scale(${sVal})`
              ),
              touchAction: 'none',
              zIndex,
            }}
            {...bind(i)}
          >
            {/* 🎨 AESTHETIC: Container uniforme avec shadow et border */}
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-white shadow-2xl border border-gray-100">
              {allVisuals[i] && (
                <>
                  {/* 🔧 CORRECTION: Image avec object-fit intelligent */}
                  <Image
                    src={allVisuals[i]}
                    alt={`Image ${i + 1} du projet ${project.title}`}
                    fill
                    className="pointer-events-none transition-transform duration-300"
                    style={{
                      objectFit: 'cover', // 🎨 Cover pour uniformité
                      objectPosition: 'center',
                    }}
                    sizes="(max-width: 768px) 90vw, 400px"
                    priority={i === currentImageIndex}
                    draggable="false"
                  />
                  
                  {/* 🎨 AESTHETIC: Overlay subtil pour depth */}
                  <div 
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      background: i === currentImageIndex 
                        ? 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.02) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 100%)',
                      opacity: i === currentImageIndex ? 0 : 0.3
                    }}
                  />
                  
                  {/* 🎨 AESTHETIC: Reflection effect pour les cartes arrière */}
                  {i !== currentImageIndex && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)',
                        mixBlendMode: 'overlay'
                      }}
                    />
                  )}
                </>
              )}
            </div>
            
            {/* 🎨 AESTHETIC: Frame extérieur pour la carte active */}
            {i === currentImageIndex && (
              <div 
                className="absolute -inset-2 rounded-2xl pointer-events-none transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(247,165,32,0.15) 0%, rgba(9,71,142,0.1) 100%)',
                  opacity: 0.6,
                  zIndex: -1
                }}
              />
            )}
          </animated.div>
        ))}
        
        {/* 🎨 AESTHETIC: Indicateur de swipe subtil */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-black/10 backdrop-blur-sm rounded-full">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Note: The above code is a React component that uses react-spring for animations and Next.js Image component for optimized image loading. The component is designed to create a stack of images with a swipeable effect, suitable for mobile viewports. 