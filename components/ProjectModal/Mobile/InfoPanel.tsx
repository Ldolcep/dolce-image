// ===============================
// components/ProjectModal/Mobile/InfoPanel.tsx
// ===============================
"use client";

import React from 'react';
import { Project } from '../../../types/modal';
import { MODAL_CONFIG } from '../../../config/modal';

interface InfoPanelProps {
  project: Project;
  isInfoVisible: boolean;
  panelTranslateY: number | null;
  initialCollapsedY: number | null;
  isMounted: boolean;
  panelRef: React.RefObject<HTMLDivElement>;
  gripRef: React.RefObject<HTMLDivElement>;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  project,
  isInfoVisible,
  panelTranslateY,
  initialCollapsedY,
  isMounted,
  panelRef,
  gripRef,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  const panelTransform = panelTranslateY !== null 
    ? `translateY(${panelTranslateY}px)` 
    : (initialCollapsedY !== null 
        ? `translateY(${initialCollapsedY}px)` 
        : `translateY(calc(100% - ${MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED}))`
      );

  return (
    <div 
      ref={panelRef}
      className="absolute left-0 right-0 bottom-0 bg-white rounded-t-lg shadow-2xl transform will-change-transform cursor-grab active:cursor-grabbing touch-none"
      style={{
        height: MODAL_CONFIG.GRIP_HEIGHT_EXPANDED,
        maxHeight: MODAL_CONFIG.GRIP_HEIGHT_EXPANDED,
        transform: panelTransform,
        zIndex: 30,
        visibility: isMounted && initialCollapsedY !== null ? 'visible' : 'hidden',
      }}
      aria-hidden={!isInfoVisible}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Grip Area */}
      <div 
        ref={gripRef}
        className="w-full flex flex-col items-center justify-center pointer-events-none px-4"
        style={{ height: MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED }}
      >
        <div className="w-10 h-1.5 bg-gray-300 rounded-full mb-2 shrink-0"></div>
        {!isInfoVisible && (
          <span className="font-poppins text-[1.5rem] font-semibold text-gray-500 uppercase tracking-wider leading-tight">
            Description
          </span>
        )}
      </div>

      {/* Content Area */}
      <div 
        className="panel-content px-5 pb-5 overflow-y-auto pointer-events-auto touch-auto"
        style={{
          height: `calc(100% - ${MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED})`,
          maxHeight: `calc(100% - ${MODAL_CONFIG.GRIP_HEIGHT_COLLAPSED})`,
          display: 'block',
          opacity: isInfoVisible ? 1 : 0,
          transition: `opacity ${MODAL_CONFIG.CONTENT_FADE_DURATION}ms ease-out`,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="space-y-4">
          {Array.isArray(project.description) 
            ? project.description.map((p, i) => (
                <p key={i} className="font-poppins text-gray-700 text-sm leading-relaxed">
                  {p}
                </p>
              ))
            : (
                <p className="font-poppins text-gray-700 text-sm leading-relaxed">
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
            className="font-poppins block mt-5 text-primary-blue hover:underline text-sm font-medium"
          >
            Visiter le site
          </a>
        )}
        
        <div className="h-[calc(env(safe-area-inset-bottom,0px)+20px)]"></div>
      </div>
    </div>
  );
};
