// ========================================================================
// === PROJECT MODAL MOBILE - VERSION PRODUCTION SENIOR ===
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
  const contentRef = useRef<HTMLDivElement>(null);

  const allVisuals = React.useMemo(() => 
    [project.mainVisual, ...project.additionalVisuals].filter(Boolean), 
    [project]
  );

  // ===============================
  // 🔧 PANEL LOGIC FIXÉE - SENIOR
  // ===============================
  const panelStartY = useRef(0);
  const panelCurrentY = useRef(0);

  const handlePanelTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    panelStartY.current = touch.clientY;
    // 🔧 SENIOR FIX: Calcul basé sur 6vh grip et 38vh total
    panelCurrentY.current = isPanelExpanded ? 0 : window.innerHeight * 0.32; // 38vh - 6vh = 32vh
  };

  const handlePanelTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    const deltaY = e.touches[0].clientY - panelStartY.current;
    const newY = Math.max(0, Math.min(window.innerHeight * 0.32, panelCurrentY.current + deltaY));
    
    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${newY}px)`;
    }
  };

  const handlePanelTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - panelStartY.current;
    const shouldExpand = isPanelExpanded ? deltaY < -50 : deltaY < 50;
    
    setIsPanelExpanded(shouldExpand);
    
    if (panelRef.current) {
      const targetY = shouldExpand ? 0 : window.innerHeight * 0.32;
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

  // 🔧 SENIOR FIX: Panel position initialization corrigée
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
    <div className="fixed inset-0 bg-white z-50 overflow-hidden select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 bg-white/95 backdrop-blur-sm h-14">
        <button 
          onClick={onClose} 
          className="text-gray-700 rounded-full p-1.5 hover:bg-gray-100 transition-colors flex-shrink-0" 
          aria-label="Fermer"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 
          className="flex-1 text-center text-black font-semibold truncate mx-3"
          style={{ 
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '1.25rem',
            letterSpacing: '0.01em',
            lineHeight: '1.3'
          }}
        >
          {project.title}
        </h2>
        
        <div className="w-9 h-9 flex-shrink-0"></div>
      </div>

      {/* 🔧 SENIOR FIX: Zone d'images remontée pour éviter chevauchement */}
      <div className="absolute inset-0 pt-14 pb-[8vh] flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-[4/5] max-h-[70vh]">
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            effect="cards"
            modules={[Navigation, Pagination, EffectCards]}
            spaceBetween={20}
            slidesPerView={1}
            // 🔧 SENIOR FIX: Animation plus fluide pour la fin de transition
            speed={350} // Plus rapide pour éviter l'effet saccadé
            threshold={3}
            touchRatio={1}
            resistance={true}
            resistanceRatio={0.85}
            cardsEffect={{
              rotate: true,
              perSlideRotate: 6,   // Plus subtil pour fin d'animation fluide
              perSlideOffset: 4,   // Plus proche pour transition fluide
              slideShadows: true,
            }}
            pagination={false}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            className="w-full h-full"
          >
            {allVisuals.map((visual, index) => (
              <SwiperSlide key={visual} className="relative">
                <div className="relative w-full h-full overflow-hidden bg-white shadow-2xl">
                  <Image
                    src={visual}
                    alt={`Image ${index + 1} du projet ${project.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 400px"
                    priority={index === 0}
                  />
                  
                  {/* Frame pour carte active */}
                  {index === currentIndex && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        boxShadow: 'inset 0 0 0 2px rgba(247,165,32,0.5)',
                      }}
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation Buttons */}
          {allVisuals.length > 1 && (
            <>
              <button 
                className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-30"
                aria-label="Image précédente"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>

              <button 
                className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-30"
                aria-label="Image suivante"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </>
          )}

          {/* 🔧 SENIOR FIX: Indicateurs plus éloignés du carrousel */}
          {allVisuals.length > 1 && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-25">
              <div className="flex space-x-2.5 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-100">
                {allVisuals.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => swiperRef.current?.slideTo(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      currentIndex === idx 
                        ? 'w-3 h-3 bg-orange-500 scale-110 shadow-sm' 
                        : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400 active:scale-110 hover:scale-105'
                    }`}
                    aria-label={`Aller à l'image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔧 SENIOR FIX: Panel avec grip 6vh et logique corrigée */}
      <div 
        ref={panelRef}
        className="absolute left-0 right-0 bottom-0 bg-white shadow-2xl cursor-grab active:cursor-grabbing touch-none z-40"
        style={{
          height: '38vh', // Grip 6vh + contenu 32vh
          transform: `translateY(${isPanelExpanded ? 0 : 'calc(100% - 6vh)'})`
        }}
        onTouchStart={handlePanelTouchStart}
        onTouchMove={handlePanelTouchMove}
        onTouchEnd={handlePanelTouchEnd}
      >
        {/* 🔧 SENIOR FIX: Grip 6vh avec titre 1rem */}
        <div className="w-full flex flex-col items-center justify-center pointer-events-none px-4 h-[6vh] bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
          <div className="w-12 h-1 bg-gray-400 rounded-full mb-1.5 shadow-sm"></div>
          {!isPanelExpanded && (
            <span 
              className="font-semibold text-gray-600 uppercase tracking-wider"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '1rem', // 🔧 AUGMENTÉ de 0.75rem à 1rem
                lineHeight: '1'
              }}
            >
              Description
            </span>
          )}
        </div>

        {/* 🔧 SENIOR FIX: Contenu avec visibilité corrigée */}
        <div 
          ref={contentRef}
          className="px-6 pb-6 h-[calc(100%-6vh)] overflow-y-auto"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            // 🔧 SENIOR FIX: Pas de opacity/visibility qui cassent l'affichage
            display: 'block'
          }}
        >
          {/* 🔧 SENIOR FIX: Contenu qui s'affiche correctement */}
          <div 
            className={`space-y-4 pt-2 transition-opacity duration-300 ${
              isPanelExpanded ? 'opacity-100' : 'opacity-0'
            }`}
          >
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
          
          {project.link && isPanelExpanded && (
            <a 
              href={project.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block mt-6 text-blue-600 hover:underline text-sm font-medium"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Visiter le site du projet →
            </a>
          )}

          {/* Safe area */}
          <div className="h-[env(safe-area-inset-bottom,20px)]"></div>
        </div>
      </div>

      {/* Montserrat Import + CSS fixes */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        
        /* 🔧 SENIOR CSS: Suppression complète des arrondis */
        .swiper-cards .swiper-slide {
          border-radius: 0 !important;
          overflow: hidden !important;
        }
        
        .swiper-cards .swiper-slide-shadow-left,
        .swiper-cards .swiper-slide-shadow-right {
          border-radius: 0 !important;
          background: linear-gradient(to right, rgba(0,0,0,0.03), transparent) !important;
        }

        /* 🔧 SENIOR CSS: Animation de fin plus fluide */
        .swiper-cards .swiper-slide-active {
          transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }
      `}</style>
    </div>
  );
}
// ========================================================================
// === FIN DU CODE SENIOR - PROJECT MODAL MOBILE ===