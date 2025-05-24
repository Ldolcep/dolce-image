// ========================================================================
// === VERSION CORRIGÉE - SWIPE FIX + PANEL COULISSANT ===
// ========================================================================

"use client";

import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useSprings } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { animated, to as interpolate } from '@react-spring/web';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Types
interface Project {
  id: string;
  title: string;
  mainVisual: string;
  additionalVisuals: string[];
  description: string | string[];
  link: string;
}

// Config locale
const CONFIG = {
  SWIPE_THRESHOLD: 80,
  VELOCITY_THRESHOLD: 0.3,
  PANEL_COLLAPSED_HEIGHT: '12vh',
  PANEL_EXPANDED_HEIGHT: '60vh'
} as const;

interface ProjectModalMobileProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModalMobile({ 
  project, 
  isOpen, 
  onClose 
}: ProjectModalMobileProps) {
  
  // ===============================
  // ÉTAT SIMPLE ET CENTRALISÉ
  // ===============================
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const allVisuals = useMemo(() => 
    [project.mainVisual, ...project.additionalVisuals].filter(Boolean), 
    [project]
  );

  // Refs pour le panel
  const panelRef = useRef<HTMLDivElement>(null);
  const panelStartY = useRef(0);
  const panelCurrentY = useRef(0);

  // ===============================
  // 🔧 CORRECTION: FONCTION SPRING SIMPLE ET TESTÉE
  // ===============================
  const getCardStyle = useCallback((index: number, active: number, gone: Set<number>) => {
    if (gone.has(index)) {
      return {
        x: index < active ? -400 : 400,
        rot: index < active ? -20 : 20,
        scale: 0.8,
        opacity: 0,
        display: 'none'
      };
    }
    
    if (index === active) {
      return {
        x: 0,
        y: 0,
        rot: 0,
        scale: 1,
        opacity: 1,
        display: 'block',
        zIndex: 10
      };
    }
    
    if (index === active + 1) {
      return {
        x: 0,
        y: 8,
        rot: 0,
        scale: 0.96,
        opacity: 0.8,
        display: 'block',
        zIndex: 9
      };
    }
    
    return {
      x: 0,
      y: 0,
      rot: 0,
      scale: 0.9,
      opacity: 0,
      display: 'none',
      zIndex: 0
    };
  }, []);

  // ===============================
  // SPRINGS AVEC CONFIGURATION TESTÉE
  // ===============================
  const gone = useRef(new Set<number>());
  
  const [springs, api] = useSprings(
    allVisuals.length,
    (index) => ({
      ...getCardStyle(index, currentIndex, gone.current),
      config: { tension: 280, friction: 30 }
    }),
    [allVisuals.length, currentIndex]
  );

  // ===============================
  // 🔧 CORRECTION: NAVIGATION CORRIGÉE
  // ===============================
  const goToNext = useCallback(() => {
    if (currentIndex < allVisuals.length - 1) {
      const newIndex = currentIndex + 1;
      gone.current.add(currentIndex);
      
      api.start(index => {
        if (index === currentIndex) {
          return {
            x: -400,
            rot: -20,
            scale: 0.8,
            opacity: 0,
            config: { tension: 250, friction: 25 }
          };
        }
        return getCardStyle(index, newIndex, gone.current);
      });
      
      setTimeout(() => setCurrentIndex(newIndex), 150);
    }
  }, [currentIndex, allVisuals.length, api, getCardStyle]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      gone.current.add(currentIndex);
      
      api.start(index => {
        if (index === currentIndex) {
          return {
            x: 400,
            rot: 20,
            scale: 0.8,
            opacity: 0,
            config: { tension: 250, friction: 25 }
          };
        }
        return getCardStyle(index, newIndex, gone.current);
      });
      
      setTimeout(() => setCurrentIndex(newIndex), 150);
    }
  }, [currentIndex, api, getCardStyle]);

  const goToIndex = useCallback((targetIndex: number) => {
    if (targetIndex >= 0 && targetIndex < allVisuals.length && targetIndex !== currentIndex) {
      gone.current.clear();
      setCurrentIndex(targetIndex);
    }
  }, [currentIndex, allVisuals.length]);

  // ===============================
  // 🔧 CORRECTION: DRAG LOGIC CORRIGÉE
  // ===============================
  const bind = useDrag(({ 
    args: [index], 
    active, 
    movement: [mx], 
    velocity: [vx], 
    direction: [xDir], 
    first, 
    last 
  }) => {
    if (index !== currentIndex) return;
    
    if (first) setIsImageDragging(true);
    if (last) setIsImageDragging(false);

    // 🔧 CORRECTION: Limites élastiques corrigées
    const canGoNext = currentIndex < allVisuals.length - 1;
    const canGoPrev = currentIndex > 0;
    
    let constrainedMx = mx;
    if (mx > 0 && !canGoPrev) {
      constrainedMx = Math.min(50, mx * 0.2); // Résistance vers la droite
    } else if (mx < 0 && !canGoNext) {
      constrainedMx = Math.max(-50, mx * 0.2); // Résistance vers la gauche
    }

    if (active) {
      // Pendant le drag
      api.start(i => {
        if (i === index) {
          return {
            x: constrainedMx,
            rot: constrainedMx / 15,
            scale: 1.02,
            opacity: 1,
            config: { tension: 0, friction: 0 },
            immediate: true
          };
        }
        // Révéler la carte suivante (swipe gauche)
        if (i === currentIndex + 1 && mx < -30 && canGoNext) {
          const progress = Math.min(1, Math.abs(mx) / 120);
          return {
            scale: 0.96 + (progress * 0.04),
            opacity: 0.8 + (progress * 0.2),
            y: 8 - (progress * 8),
            display: 'block'
          };
        }
        // Révéler la carte précédente (swipe droite)
        if (i === currentIndex - 1 && mx > 30 && canGoPrev) {
          const progress = Math.min(1, mx / 120);
          return {
            scale: 0.96 + (progress * 0.04),
            opacity: 0.8 + (progress * 0.2),
            y: 8 - (progress * 8),
            display: 'block'
          };
        }
        return undefined;
      });
    } else {
      // 🔧 CORRECTION: Fin du drag avec logique corrigée
      const shouldSwipe = Math.abs(mx) > CONFIG.SWIPE_THRESHOLD || Math.abs(vx) > CONFIG.VELOCITY_THRESHOLD;
      
      if (shouldSwipe) {
        // 🔧 CORRECTION: Direction corrigée
        if (mx < 0 && canGoNext) {
          // Swipe vers la gauche = image suivante
          goToNext();
          return;
        } else if (mx > 0 && canGoPrev) {
          // Swipe vers la droite = image précédente  
          goToPrevious();
          return;
        }
      }
      
      // Reset position
      api.start(i => {
        if (i === index) {
          return getCardStyle(i, currentIndex, gone.current);
        }
        return undefined;
      });
    }
  }, {
    axis: 'x',
    filterTaps: true,
    threshold: 8
  });

  // ===============================
  // 🔧 PANEL COULISSANT - RÉIMPLÉMENTÉ
  // ===============================
  const handlePanelTouchStart = useCallback((e: React.TouchEvent) => {
    panelStartY.current = e.touches[0].clientY;
    panelCurrentY.current = isPanelExpanded ? 0 : window.innerHeight * 0.48; // 60vh - 12vh = 48vh
  }, [isPanelExpanded]);

  const handlePanelTouchMove = useCallback((e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - panelStartY.current;
    const newY = Math.max(0, Math.min(window.innerHeight * 0.48, panelCurrentY.current + deltaY));
    
    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${newY}px)`;
    }
  }, []);

  const handlePanelTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - panelStartY.current;
    const shouldExpand = isPanelExpanded ? deltaY < -50 : deltaY < 50;
    
    setIsPanelExpanded(shouldExpand);
    
    if (panelRef.current) {
      const targetY = shouldExpand ? 0 : window.innerHeight * 0.48;
      panelRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      panelRef.current.style.transform = `translateY(${targetY}px)`;
      
      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.style.transition = '';
        }
      }, 300);
    }
  }, [isPanelExpanded]);

  // ===============================
  // EFFECTS SIMPLES
  // ===============================
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsPanelExpanded(false);
      gone.current.clear();
      api.start(index => getCardStyle(index, 0, gone.current));
    }
  }, [isOpen, project.id, api, getCardStyle]);

  useEffect(() => {
    if (isMounted) {
      api.start(index => getCardStyle(index, currentIndex, gone.current));
    }
  }, [currentIndex, isMounted, api, getCardStyle]);

  // Panel position initialization
  useEffect(() => {
    if (isMounted && panelRef.current) {
      const initialY = isPanelExpanded ? 0 : window.innerHeight * 0.48;
      panelRef.current.style.transform = `translateY(${initialY}px)`;
    }
  }, [isMounted, isPanelExpanded]);

  // ===============================
  // RENDER AVEC PANEL COULISSANT
  // ===============================
  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm h-16">
        <button 
          onClick={onClose} 
          className="text-gray-700 rounded-full p-2 hover:bg-gray-200" 
          aria-label="Fermer"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 className="flex-1 text-center text-black text-xl font-medium truncate mx-4">
          {project.title}
        </h2>
        
        <div className="w-10 h-10"></div>
      </div>

      {/* Zone d'images - Ajustée pour le panel */}
      <div className="absolute inset-0 pt-16 pb-[12vh] flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-[4/5] max-h-[70vh]">
          {springs.map(({ x, y, rot, scale, opacity, display, zIndex }, i) => (
            <animated.div
              key={allVisuals[i] || `card-${i}`}
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
              <div className="relative w-full h-full overflow-hidden bg-white shadow-xl">
                {allVisuals[i] && (
                  <Image
                    src={allVisuals[i]}
                    alt={`Image ${i + 1} du projet ${project.title}`}
                    fill
                    className="pointer-events-none"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    sizes="(max-width: 768px) 85vw, 400px"
                    priority={i === currentIndex}
                    draggable="false"
                  />
                )}
                
                {/* Frame pour carte active */}
                {i === currentIndex && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: 'inset 0 0 0 2px rgba(247,165,32,0.3)',
                    }}
                  />
                )}
              </div>
            </animated.div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {allVisuals.length > 1 && !isImageDragging && (
        <>
          <button 
            onClick={goToPrevious}
            disabled={currentIndex <= 0}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 ${
              currentIndex <= 0 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:bg-white active:scale-95'
            }`}
            aria-label="Image précédente"
          >
            <ChevronLeft size={20} />
          </button>

          <button 
            onClick={goToNext}
            disabled={currentIndex >= allVisuals.length - 1}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 ${
              currentIndex >= allVisuals.length - 1
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:bg-white active:scale-95'
            }`}
            aria-label="Image suivante"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* 🔧 PANEL COULISSANT RÉIMPLÉMENTÉ */}
      <div 
        ref={panelRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none"
        style={{
          height: CONFIG.PANEL_EXPANDED_HEIGHT,
          transform: `translateY(${isPanelExpanded ? 0 : 'calc(100% - 12vh)'})`
        }}
        onTouchStart={handlePanelTouchStart}
        onTouchMove={handlePanelTouchMove}
        onTouchEnd={handlePanelTouchEnd}
      >
        {/* Grip */}
        <div className="w-full flex flex-col items-center justify-center pointer-events-none px-4" style={{ height: CONFIG.PANEL_COLLAPSED_HEIGHT }}>
          <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-2"></div>
          {!isPanelExpanded && (
            <span className="font-medium text-gray-500 uppercase tracking-wider text-sm">
              Description
            </span>
          )}
        </div>

        {/* Contenu */}
        <div className="px-6 pb-6 h-[calc(100%-12vh)] overflow-y-auto">
          <div className="space-y-4">
            {Array.isArray(project.description) 
              ? project.description.map((p, i) => (
                  <p key={i} className="text-gray-700 text-sm leading-relaxed">
                    {p}
                  </p>
                ))
              : (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {project.description}
                  </p>
                )
            }
          </div>
          
          {project.link && (
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block mt-6 text-blue-600 hover:underline text-sm font-medium"
            >
              Visiter le site
            </a>
          )}

          {/* Indicateurs dans le panel */}
          {allVisuals.length > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-3">
                {allVisuals.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      currentIndex === idx 
                        ? 'w-3 h-3 bg-orange-500 scale-110' 
                        : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Aller à l'image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
