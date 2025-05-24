// ========================================================================
// === PROJECT MODAL MOBILE - AMÉLIORATIONS CARROUSEL ===
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
  const gripRef = useRef<HTMLDivElement>(null);

  const allVisuals = React.useMemo(() => 
    [project.mainVisual, ...project.additionalVisuals].filter(Boolean), 
    [project]
  );

  // ===============================
  // 🔧 PANEL LOGIC FIXÉE - SCROLL SÉPARÉ
  // ===============================
  const panelStartY = useRef(0);
  const panelCurrentY = useRef(0);
  const isDraggingPanel = useRef(false);

  const handlePanelTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    
    // 🔧 FIX CRITIQUE: Vérifier si on touche le grip ou le contenu
    const isInGrip = gripRef.current?.contains(target);
    const isInContent = contentRef.current?.contains(target);
    
    // 🔧 FIX CRITIQUE: Si on touche le contenu ET qu'il peut scroll, ne pas intercepter
    if (isInContent && !isInGrip && contentRef.current && isPanelExpanded) {
      const canScroll = contentRef.current.scrollHeight > contentRef.current.clientHeight;
      if (canScroll) {
        console.log('🔧 Permettre scroll natif du contenu');
        return; // Laisser le scroll natif fonctionner
      }
    }
    
    // Seulement intercepter si on touche le grip ou si le contenu ne peut pas scroll
    isDraggingPanel.current = true;
    panelStartY.current = touch.clientY;
    panelCurrentY.current = isPanelExpanded ? 0 : window.innerHeight * 0.32;
    
    console.log('🔧 Panel drag start', { isInGrip, isInContent });
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
        if (panelRef.current) {
          panelRef.current.style.transition = '';
        }
      }, 300);
    }
    
    console.log('🔧 Panel drag end', { shouldExpand });
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
      {/* Header avec titre */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3 bg-white/95 backdrop-blur-sm h-16">
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
            fontSize: '1.4rem',
            letterSpacing: '0.01em',
            lineHeight: '1.2'
          }}
        >
          {project.title}
        </h2>
        
        <div className="w-9 h-9 flex-shrink-0"></div>
      </div>

      {/* 🔧 ZONE CARROUSEL CORRIGÉE - Espacement fixé définitivement */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        style={{
          paddingTop: '64px', // 🔧 FIX exact au lieu de pt-16
          paddingBottom: 'calc(38vh + 6vh)' // 🔧 FIX exact : 6vh pour l'indicateur
        }}
      >
        
        {/* Carrousel Swiper */}
        <div className="relative w-full max-w-sm aspect-[4/5]" style={{ maxHeight: '65vh' }}>
          <Swiper
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
            effect="cards" // 🔧 RETOUR à l'effet cards comme souhaité
            modules={[Navigation, Pagination, EffectCards]} // 🔧 Réajout du module EffectCards
            spaceBetween={20}
            slidesPerView={1}
            speed={300} // 🔧 Réduit pour plus de fluidité
            threshold={1.5} // 🔧 Plus sensible
            touchRatio={1} // 🔧 Ratio naturel
            resistance={true}
            resistanceRatio={0.85} // 🔧 Légèrement augmenté pour plus de contrôle
            followFinger={true}
            shortSwipes={true}
            longSwipes={true}
            longSwipesRatio={0.2} // 🔧 Plus facile d'activer
            cardsEffect={{
              rotate: true,
              perSlideRotate: 4, // 🔧 Réduit pour plus de fluidité
              perSlideOffset: 3, // 🔧 Réduit pour plus de fluidité
              slideShadows: true,
            }}
            pagination={false}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            className="w-full h-full swiper-smooth"
          >
            {allVisuals.map((visual, index) => (
              <SwiperSlide key={visual} className="relative">
                <div className="relative w-full h-full overflow-hidden bg-white shadow-2xl"> {/* 🔧 AUCUN coin arrondi */}
                  <Image
                    src={visual}
                    alt={`Image ${index + 1} du projet ${project.title}`}
                    fill
                    className="object-cover" {/* 🔧 AUCUN coin arrondi */}
                    sizes="(max-width: 768px) 90vw, 400px"
                    priority={index === 0}
                  />
                  
                  {/* 🔧 Frame orange pour carte active - sans coins arrondis */}
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

          {/* Navigation Buttons - design épuré */}
          {allVisuals.length > 1 && (
            <>
              <button 
                className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-30"
                aria-label="Image précédente"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>

              <button 
                className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-800 shadow-lg transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 disabled:opacity-30"
                aria-label="Image suivante"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </>
          )}
        </div>

        {/* 🔧 INDICATEURS ÉPURÉS - Espacement exact fixé */}
        {allVisuals.length > 1 && (
          <div 
            className="flex justify-center"
            style={{
              marginTop: '6vh', // 🔧 FIX exact : 6vh comme paddingBottom
              marginBottom: '0' // 🔧 Assurer aucun margin bottom
            }}
          >
            <div className="flex space-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              {allVisuals.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => swiperRef.current?.slideTo(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    currentIndex === idx 
                      ? 'w-2.5 h-2.5 bg-orange-500' 
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400 hover:scale-110'
                  }`}
                  aria-label={`Aller à l'image ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Panel Description - avec espacement équilibré pb-[10vh] */}
      <div 
        ref={panelRef}
        className="absolute left-0 right-0 bottom-0 bg-white shadow-2xl touch-none z-40"
        style={{
          height: '38vh',
          transform: `translateY(${isPanelExpanded ? 0 : 'calc(100% - 6vh)'})`
        }}
      >
        {/* Grip zone */}
        <div 
          ref={gripRef}
          className="w-full flex flex-col items-center justify-center px-4 h-[6vh] bg-gradient-to-b from-gray-50 to-white border-t border-gray-100 cursor-grab active:cursor-grabbing"
          onTouchStart={handlePanelTouchStart}
          onTouchMove={handlePanelTouchMove}
          onTouchEnd={handlePanelTouchEnd}
        >
          <div className="w-12 h-1 bg-gray-400 rounded-full mb-1.5 shadow-sm"></div>
          {!isPanelExpanded && (
            <span 
              className="font-semibold text-gray-600 uppercase tracking-wider"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '1rem',
                lineHeight: '1'
              }}
            >
              Description
            </span>
          )}
        </div>

        {/* Zone de contenu avec scroll natif */}
        <div 
          ref={contentRef}
          className="px-6 pb-6 h-[calc(100%-6vh)] overflow-y-auto"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-y'
          }}
        >
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

          <div className="h-[env(safe-area-inset-bottom,20px)]"></div>
        </div>
      </div>

      {/* 🔧 CSS CORRIGÉ pour fluidité cards + scrollbar stylée */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        
        /* 🔧 Scrollbar stylée orange */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f97316; /* Orange comme l'indicateur */
          border-radius: 2px;
          transition: background 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ea580c; /* Orange plus foncé au hover */
        }
        
        /* 🔧 Fluidité cards améliorée */
        .swiper-smooth {
          transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
        }
        
        .swiper-smooth .swiper-wrapper {
          transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1) !important;
        }
        
        .swiper-cards .swiper-slide {
          overflow: hidden !important;
          border-radius: 0 !important; /* 🔧 FORCE aucun coin arrondi */
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
        }
        
        /* 🔧 Suppression TOTALE des coins arrondis Swiper */
        .swiper-cards .swiper-slide,
        .swiper-cards .swiper-slide > div,
        .swiper-cards .swiper-slide img {
          border-radius: 0 !important;
        }
        
        /* 🔧 Ombres cards plus subtiles */
        .swiper-cards .swiper-slide-shadow-left,
        .swiper-cards .swiper-slide-shadow-right {
          background: linear-gradient(to right, rgba(0,0,0,0.03), transparent) !important;
          border-radius: 0 !important;
        }

        /* 🔧 Animation ultra fluide pour carte active */
        .swiper-cards .swiper-slide-active {
          transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
        }
        
        /* 🔧 Transitions harmonieuses pour toutes les cartes */
        .swiper-cards .swiper-slide-duplicate-active,
        .swiper-cards .swiper-slide-prev,
        .swiper-cards .swiper-slide-next {
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
        }
        
        /* 🔧 Force la suppression des border-radius sur tous les éléments Swiper */
        .swiper-cards * {
          border-radius: 0 !important;
        }
      `}</style>
    </div>
  );
}
// Note: This code is designed to be used in a Next.js project with Tailwind CSS and Swiper.js.