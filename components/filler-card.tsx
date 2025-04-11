"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

interface FillerCardProps {
  id: string;
  backgroundImage: string;
  textImage: string;
  aspectRatio?: string;
}

export default function FillerCard({
  id,
  backgroundImage,
  textImage,
  aspectRatio = "1/1"
}: FillerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  
  // Configurer les paramètres d'animation
  const maxRotation = 6; // Degrés maximum de rotation
  const textOffsetMultiplier = 15; // Pixels max de déplacement du texte
  const bgOffsetMultiplier = -8; // Pixels max de déplacement du fond (négatif = direction opposée)
  const dampingFactor = 0.08; // Facteur d'amortissement - plus petit = plus doux

  // Fonction de gestion du mouvement avec amortissement manuel
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !backgroundRef.current || !textRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculer les positions normalisées (0-1)
    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;
    
    // Calculer les rotations (effet direct sans amortissement pour cette version simple)
    const rotateY = (normalizedX - 0.5) * maxRotation * 2;
    const rotateX = (normalizedY - 0.5) * -maxRotation * 2;
    
    // Calculer les décalages
    const textOffsetX = (normalizedX - 0.5) * textOffsetMultiplier * 2;
    const textOffsetY = (normalizedY - 0.5) * textOffsetMultiplier * 2;
    
    const bgOffsetX = (normalizedX - 0.5) * bgOffsetMultiplier * 2;
    const bgOffsetY = (normalizedY - 0.5) * bgOffsetMultiplier * 2;
    
    // Appliquer les transformations directement pour s'assurer qu'elles fonctionnent
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    backgroundRef.current.style.transform = `translateZ(0px) scale(1.05) translateX(${bgOffsetX}px) translateY(${bgOffsetY}px)`;
    textRef.current.style.transform = `translateZ(40px) translateX(${textOffsetX}px) translateY(${textOffsetY}px)`;
    
    // Effet de brillance suivant la souris
    cardRef.current.style.background = `radial-gradient(circle at ${normalizedX * 100}% ${normalizedY * 100}%, rgba(255,255,255,0.1), transparent)`;
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    
    // Supprimer la transition pour des mouvements immédiats
    if (cardRef.current) cardRef.current.style.transition = 'none';
    if (backgroundRef.current) backgroundRef.current.style.transition = 'none';
    if (textRef.current) textRef.current.style.transition = 'none';
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    // Remettre la transition pour un retour en douceur
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      cardRef.current.style.background = 'none';
    }
    
    if (backgroundRef.current) {
      backgroundRef.current.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      backgroundRef.current.style.transform = 'translateZ(0px) scale(1)';
    }
    
    if (textRef.current) {
      textRef.current.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      textRef.current.style.transform = 'translateZ(40px)';
    }
  };

  return (
    <div 
      className="masonry-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        ref={cardRef}
        className="filler-card-container"
        style={{
          aspectRatio,
          transformStyle: 'preserve-3d',
          transition: 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          willChange: 'transform',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '2px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Couche d'arrière-plan */}
        <div 
          ref={backgroundRef}
          style={{ 
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            transformStyle: 'preserve-3d',
            transition: 'transform 1s cubic-bezier(0.34, 1.2, 0.64, 1)',
            willChange: 'transform'
          }}
        >
          <Image
            src={backgroundImage}
            alt="Background design element"
            fill
            style={{ 
              objectFit: 'cover'
            }}
          />
        </div>
        
        {/* Couche de texte en overlay */}
        <div 
          ref={textRef}
          style={{ 
            transform: 'translateZ(40px)', 
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            willChange: 'transform'
          }}
        >
          <Image
            src={textImage}
            alt="Text overlay"
            fill
            style={{ 
              objectFit: 'contain',
              padding: '1.5rem'
            }}
          />
        </div>
        
        {/* Effet de brillance */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            backgroundSize: '200% 100%',
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 1,
            animation: isHovering ? 'shine3D 2s infinite' : 'none'
          }}
        />
      </div>
    </div>
  );
}