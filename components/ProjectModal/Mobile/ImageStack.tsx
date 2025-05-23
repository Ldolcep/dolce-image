// ===============================
// components/ProjectModal/Mobile/ImageStack.tsx
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
    <div className="relative w-full h-full max-w-md aspect-[3/4]">
      {springProps.map(({ x, y, rot, scale, opacity, display, zIndex }, i) => (
        <animated.div
          key={allVisuals[i] ? allVisuals[i] : `card-${i}`}
          className="absolute w-full h-full cursor-grab active:cursor-grabbing"
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
          {allVisuals[i] && (
            <Image
              src={allVisuals[i]}
              alt={`Image ${i + 1} du projet ${project.title}`}
              fill
              className="object-contain rounded-lg shadow-md pointer-events-none"
              sizes="100vw"
              priority={i === currentImageIndex}
              draggable="false"
            />
          )}
        </animated.div>
      ))}
    </div>
  );
};
