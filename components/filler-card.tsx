"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface FillerCardProps {
  id: string;
  backgroundImage: string;
  textImage?: string;
  textContent?: string;
  aspectRatio?: string;
}

export default function FillerCard({
  id,
  backgroundImage,
  textImage,
  textContent,
  aspectRatio = "1/1"
}: FillerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normaliser les positions (0-1)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    // Calculer les rotations en fonction de la position
    const rotateY = (normalizedX - 0.5) * 12; 
    const rotateX = (normalizedY - 0.5) * -12;

    // Appliquer la transformation à la carte entière
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Effet parallaxe sur les éléments internes
    const backgroundEl = card.querySelector('.background-layer') as HTMLElement;
    if (backgroundEl) {
      backgroundEl.style.transform = `translateZ(0px) scale(1.05) translateX(${(normalizedX - 0.5) * -15}px) translateY(${(normalizedY - 0.5) * -15}px)`;
    }

    // Le texte se déplace plus rapidement dans la direction du mouvement
    const textEl = card.querySelector('.text-layer') as HTMLElement;
    if (textEl) {
      textEl.style.transform = `translateZ(40px) translateX(${(normalizedX - 0.5) * 20}px) translateY(${(normalizedY - 0.5) * 20}px)`;
    }

    // Effet de lumière dynamique
    card.style.background = `radial-gradient(circle at ${normalizedX * 100}% ${normalizedY * 100}%, rgba(255,255,255,0.1), transparent)`;
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    const card = cardRef.current;
    if (!card) return;

    // Réinitialiser toutes les transformations
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    card.style.background = 'none';

    const backgroundEl = card.querySelector('.background-layer') as HTMLElement;
    if (backgroundEl) {
      backgroundEl.style.transform = 'translateZ(0px) scale(1)';
    }

    const textEl = card.querySelector('.text-layer') as HTMLElement;
    if (textEl) {
      textEl.style.transform = 'translateZ(40px)';
    }
  };

  return (
    <div 
      className="masonry-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="filler-card-container"
        style={{
          aspectRatio,
          transformStyle: 'preserve-3d',
          transition: isHovering ? 'none' : 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        }}
        onMouseMove={handleMouseMove}
      >
        {/* Couche d'arrière-plan */}
        <div 
          className="background-layer"
          style={{ 
            transform: 'translateZ(0px)',
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            transition: isHovering ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          <Image
            src={backgroundImage || "/placeholder.svg"}
            alt="Background design element"
            fill
            className="project-img"
            style={{ 
              objectFit: 'cover', 
              transition: isHovering ? 'none' : 'transform 0.3s ease-out'
            }}
          />
        </div>
        
        {/* Couche de texte en overlay */}
        <div 
          className="text-layer"
          style={{ 
            transform: 'translateZ(40px)', 
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: isHovering ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {textImage ? (
            <Image
              src={textImage}
              alt="Text overlay"
              fill
              className="text-img"
              style={{ 
                objectFit: 'contain',
                padding: '1.5rem',
                transition: isHovering ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease'
              }}
            />
          ) : textContent ? (
            <div className="text-content">
              {textContent}
            </div>
          ) : null}
        </div>
        
        {/* Effet de brillance (glow) */}
        <div 
          className="glow-effect"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: isHovering 
              ? 'radial-gradient(circle at center, rgba(247, 165, 32, 0.2), transparent 70%)' 
              : 'none',
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      </div>
    </div>
  );
}