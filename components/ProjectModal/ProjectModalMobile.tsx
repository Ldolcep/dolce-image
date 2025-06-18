// ========================================================================
// === PROJECT MODAL MOBILE - EFFET CARTES POSTALES ===
// ========================================================================

"use client";

import ReactMarkdown from 'react-markdown';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { Project } from "@/types/project";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Types
// interface ProjectModalMobileProps {
//   project: Project;
//   isOpen: boolean;
//   onClose: () => void;
// }
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
  // ÉTAT + LIMITES
  // ===============================
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const swiperRef = useRef<SwiperType>();
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const gripRef = useRef<HTMLDivElement>(null);

  const allVisuals = React.useMemo(() => 
    [project.mainVisual, ...project.additionalVisuals].filter(Boolean), 
    [project]
  );

  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex === allVisuals.length - 1;

  // ===============================
  // PANEL LOGIC
  // ===============================
  const panelStartY = useRef(0);
  const panelCurrentY = useRef(0);
  const isDraggingPanel = useRef(false);

  const handlePanelTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    
    const isInGrip = gripRef.current?.contains(target);
    const isInContent = contentRef.current?.contains(target);
    
    if (isInContent && !isInGrip && contentRef.current && isPanelExpanded) {
      const canScroll = contentRef.current.scrollHeight > contentRef.current.clientHeight;
      if (canScroll) return;
    }
    
    isDraggingPanel.current = true;
    panelStartY.current = touch.clientY;
    panelCurrentY.current = isPanelExpanded ? 0 : window.innerHeight * 0.32;
  };

  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingPanel.current) return;
    e.preventDefault();
    const deltaY = e.touches[0].clientY - panelStartY.current;
    const newY = Math.max(0, Math.min(window.innerHeight * 0.32, panelCurrentY.current + deltaY));
    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${newY}px)`;
    }
  };

  const handlePanelTouchEnd = (e: React.TouchEvent) => {
    if (!isDraggingPanel.current) return;
    isDraggingPanel.current = false;
    const deltaY = e.changedTouches[0].clientY - panelStartY.current;
    const shouldExpand = isPanelExpanded ? deltaY < -50 : deltaY < 50;
    setIsPanelExpanded(shouldExpand);
    if (panelRef.current) {
      const targetY = shouldExpand ? 0 : window.innerHeight * 0.32;
      panelRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      panelRef.current.style.transform = `translateY(${targetY}px)`;
      setTimeout(() => {
        if (panelRef.current) panelRef.current.style.transition = '';
      }, 300);
    }
  };

  // ===============================
  // EFFECTS
  // ===============================
  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsPanelExpanded(false);
      swiperRef.current?.slideTo(0, 0);
    }
  }, [isOpen, project.id]);

  useEffect(() => {
    if (isMounted && panelRef.current) {
      const initialY = isPanelExpanded ? 0 : window.innerHeight * 0.32;
      panelRef.current.style.transform = `translateY(${initialY}px)`;
    }
  }, [isMounted, isPanelExpanded]);

  // ===============================
  // RENDER
  // ===============================
  if (!isMounted || !isOpen) return null;

  return (
    // MODIFIED: Remplacement de l'ancien fond par la nouvelle structure
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      
      {/* NOUVEAU: Conteneur pour l'image de fond et l'overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/gallery-background-mobile.jpg"
          alt=""
          fill
          quality={75}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm h-16 border-b border-white/10">
        <button 
          onClick={onClose} 
          className="text-white rounded-full p-1.5 hover:bg-white/20 transition-colors flex-shrink-0" 
          aria-label="Fermer"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 
          className="flex-1 text-center text-white font-semibold truncate mx-3 drop-shadow-md"
          style={{ fontSize: '1.4rem', letterSpacing: '0.01em', lineHeight: '1.2' }}
        >
          {project.title}
        </h2>
        
        <div className="w-9 h-9 flex-shrink-0"></div>
      </div>

      {/* Zone carrousel */}
      <div className="absolute inset-0 pt-16 pb-[5vh] flex flex-col items-center justify-center w-[92%] mx-auto sm:w-[85%] md:w-[80%]">
        <div className="relative w-full max-w-sm sm:max-w-md aspect-[4/5] max-h-[65vh] sm:max-h-[70vh]">
          <Swiper
            onBeforeInit={(swiper) => { swiperRef.current = swiper; }}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            effect="slide"
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            speed={400}
            threshold={3}
            touchRatio={1}
            resistance={true}
            resistanceRatio={0.85}
            followFinger={true}
            shortSwipes={true}
            longSwipes={true}
            longSwipesRatio={0.3}
            centeredSlides={true}
            pagination={false}
            navigation={false}
            className="w-full h-full swiper-card-fan"
          >
            {allVisuals.map((visual, index) => (
              <SwiperSlide key={visual} className="relative">
                <div className="relative w-full h-full overflow-hidden bg-gray-200 shadow-2xl">
                  <Image
                    src={visual}
                    alt={`Image ${index + 1} du projet ${project.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 400px"
                    priority={index === 0}
                  />
                  {index === currentIndex && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ boxShadow: 'inset 0 0 0 2px rgba(247,165,32,0.5)' }}
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* ... (Le reste du code des boutons de navigation est inchangé) ... */}
          {allVisuals.length > 1 && (
            <>
              <button 
                className={`swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${ isAtStart ? 'bg-gray-300/70 text-gray-400 cursor-not-allowed opacity-50' : 'bg-white/90 text-gray-800 hover:bg-white hover:text-orange-500 cursor-pointer' }`}
                aria-label="Image précédente"
                disabled={isAtStart}
                onTouchStart={(e) => { e.preventDefault(); if (!isAtStart) swiperRef.current?.slidePrev(); }}
                onMouseDown={(e) => { if (!('ontouchstart' in window) && !isAtStart) swiperRef.current?.slidePrev(); }}
              ><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg></button>
              <button 
                className={`swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${ isAtEnd ? 'bg-gray-300/70 text-gray-400 cursor-not-allowed opacity-50' : 'bg-white/90 text-gray-800 hover:bg-white hover:text-orange-500 cursor-pointer' }`}
                aria-label="Image suivante"
                disabled={isAtEnd}
                onTouchStart={(e) => { e.preventDefault(); if (!isAtEnd) swiperRef.current?.slideNext(); }}
                onMouseDown={(e) => { if (!('ontouchstart' in window) && !isAtEnd) swiperRef.current?.slideNext(); }}
              ><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg></button>
            </>
          )}
        </div>
        {/* ... (Le reste du code des indicateurs est inchangé) ... */}
        {allVisuals.length > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full shadow-sm">
              {allVisuals.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => swiperRef.current?.slideTo(idx)}
                  className={`rounded-full transition-all duration-300 ${ currentIndex === idx ? 'w-2.5 h-2.5 bg-orange-500' : 'w-2 h-2 bg-white/60 hover:bg-white/80 hover:scale-110' }`}
                  aria-label={`Aller à l'image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panel Description */}
      <div 
        ref={panelRef}
        className="absolute left-0 right-0 bottom-0 bg-white shadow-2xl touch-none z-40"
        style={{ height: '38vh', transform: `translateY(${isPanelExpanded ? 0 : 'calc(100% - 6vh)'})` }}
      >
        {/* ... (Le reste du code du panel de description est inchangé) ... */}
        <div ref={gripRef} className="w-full flex flex-col items-center justify-center px-4 h-[6vh] bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 cursor-grab active:cursor-grabbing" onTouchStart={handlePanelTouchStart} onTouchMove={handlePanelTouchMove} onTouchEnd={handlePanelTouchEnd}>
          <div className="w-12 h-1 bg-gray-400 rounded-full mb-1.5 shadow-sm"></div>
          {!isPanelExpanded && <span className="font-semibold text-gray-600 uppercase tracking-wider" style={{ fontSize: '1rem', lineHeight: '1' }}>Description</span>}
        </div>
        <div ref={contentRef} className="px-6 pb-6 h-[calc(100%-6vh)] overflow-y-auto custom-scrollbar px-[2.5vw] sm:px-[1.5vw]" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
          <div className={`space-y-4 pt-2 transition-opacity duration-300 prose prose-sm prose-slate max-w-none sm:max-w-full ${ isPanelExpanded ? 'opacity-100' : 'opacity-0' }`}>
            {Array.isArray(project.description) ? project.description.map((markdownContent, i) => (<ReactMarkdown key={i}>{markdownContent}</ReactMarkdown>)) : (<ReactMarkdown>{project.description}</ReactMarkdown>)}
          </div>
          {project.link && isPanelExpanded && <a href={project.link} target="_blank" rel="noopener noreferrer" className="block mt-6 text-blue-600 hover:underline text-sm font-medium">Visiter le site du projet →</a>}
          <div className="h-[env(safe-area-inset-bottom,20px)]"></div>
        </div>
      </div>
    </div>
  );
}

// --- END OF FILE ProjectModalMobile.tsx (MODIFIED) ---
