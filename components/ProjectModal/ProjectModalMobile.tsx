// ========================================================================
// === PROJECT MODAL MOBILE - SWIPER.JS INTEGRATION ===
// ========================================================================

"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCards } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';

// Types
interface Project {
  id: string;
  title: string;
  mainVisual: string;
  additionalVisuals: string[];
  description: string | string[];
  link: string;
}

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
  // ÉTAT SIMPLE
  // ===============================
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const swiperRef = useRef<SwiperType>();
  const panelRef = useRef<HTMLDivElement>(null);

  const allVisuals = React.useMemo(() => 
    [project.mainVisual, ...project.additionalVisuals].filter(Boolean), 
    [project]
  );

  // ===============================
  // PANEL LOGIC
  // ===============================
  const panelStartY = useRef(0);
  const panelCurrentY = useRef(0);

  const handlePanelTouchStart = (e: React.TouchEvent) => {
    panelStartY.current = e.touches[0].clientY;
    panelCurrentY.current = isPanelExpanded ? 0 : window.innerHeight * 0.48;
  };

  const handlePanelTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - panelStartY.current;
    const newY = Math.max(0, Math.min(window.innerHeight * 0.48, panelCurrentY.current + deltaY));
    
    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${newY}px)`;
    }
  };

  const handlePanelTouchEnd = (e: React.TouchEvent) => {
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
  };

  // ===============================
  // EFFECTS
  // ===============================
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsPanelExpanded(false);
      if (swiperRef.current) {
        swiperRef.current.slideTo(0, 0);
      }
    }
  }, [isOpen, project.id]);

  useEffect(() => {
    if (isMounted && panelRef.current) {
      const initialY = isPanelExpanded ? 0 : window.innerHeight * 0.48;
      panelRef.current.style.transform = `translateY(${initialY}px)`;
    }
  }, [isMounted, isPanelExpanded]);

  // ===============================
  // RENDER
  // ===============================
  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white/90 backdrop-blur-sm h-16">
        <button 
          onClick={onClose} 
          className="text-gray-700 rounded-full p-2 hover:bg-gray-200 transition-colors" 
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

      {/* Swiper Container */}
      <div className="absolute inset-0 pt-16 pb-[12vh] flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-[4/5] max-h-[70vh]">
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            effect="cards"
            modules={[Navigation, Pagination, EffectCards]}
            spaceBetween={30}
            slidesPerView={1}
            cardsEffect={{
              rotate: true,
              perSlideRotate: 15,
              perSlideOffset: 8,
              slideShadows: true,
            }}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet custom-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active',
            }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            className="w-full h-full"
          >
            {allVisuals.map((visual, index) => (
              <SwiperSlide key={visual} className="relative">
                <div className="relative w-full h-full overflow-hidden bg-white shadow-xl rounded-lg">
                  <Image
                    src={visual}
                    alt={`Image ${index + 1} du projet ${project.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 85vw, 400px"
                    priority={index === 0}
                  />
                  
                  {/* Frame pour carte active */}
                  {index === currentIndex && (
                    <div 
                      className="absolute inset-0 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: 'inset 0 0 0 2px rgba(247,165,32,0.4)',
                      }}
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons Customisées */}
          {allVisuals.length > 1 && (
            <>
              <button 
                className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 hover:bg-white active:scale-95 disabled:opacity-30"
                aria-label="Image précédente"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>

              <button 
                className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 hover:bg-white active:scale-95 disabled:opacity-30"
                aria-label="Image suivante"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Panel Coulissant */}
      <div 
        ref={panelRef}
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-xl shadow-2xl cursor-grab active:cursor-grabbing touch-none z-40"
        style={{
          height: '60vh',
          transform: `translateY(${isPanelExpanded ? 0 : 'calc(100% - 12vh)'})`
        }}
        onTouchStart={handlePanelTouchStart}
        onTouchMove={handlePanelTouchMove}
        onTouchEnd={handlePanelTouchEnd}
      >
        {/* Grip */}
        <div className="w-full flex flex-col items-center justify-center pointer-events-none px-4 h-[12vh]">
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

          {/* Safe area pour mobile */}
          <div className="h-[env(safe-area-inset-bottom,0px)]"></div>
        </div>
      </div>

      {/* Styles Custom pour Swiper */}
      <style jsx global>{`
        .custom-bullet {
          width: 10px !important;
          height: 10px !important;
          background: #d1d5db !important;
          opacity: 1 !important;
          margin: 0 4px !important;
          border-radius: 50% !important;
          transition: all 0.3s ease !important;
        }
        
        .custom-bullet-active {
          background: #f97316 !important;
          transform: scale(1.2) !important;
        }
        
        .swiper-pagination {
          bottom: 16px !important;
          z-index: 25 !important;
        }
        
        .swiper-pagination-bullets {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }

        /* Hide default Swiper buttons */
        .swiper-button-next,
        .swiper-button-prev {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
// ========================================================================
// === END OF PROJECT MODAL MOBILE - SWIPER.JS INTEGRATION ===