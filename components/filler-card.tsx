"use client";

import React, { useRef, useState, useEffect } from "react";
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
  
  // Positions cibles (où pointe la souris)
  const [targetPosition, setTargetPosition] = useState({ x: 0.5, y: 0.5 });
  // Positions actuelles (avec amortissement)
  const [currentPosition, setCurrentPosition] = useState({ x: 0.5, y: 0.5 });
  
  const animationFrameRef = useRef<number | null>(null);
  
  // Configurer l'amortissement et les limites de mouvement
  const dampingFactor = 0.08; // Ajuster pour plus/moins de fluidité
  const maxRotation = 6; // Degrés maximum de rotation
  const textOffsetMultiplier = 15; // Pixels max de déplacement du texte
  const bgOffsetMultiplier = -8; // Pixels max de déplacement du fond (négatif = direction opposée)

  // Fonction d'animation principale utilisant requestAnimationFrame
  const animate = () => {
    // Calcul des nouvelles positions avec amortissement
    const newX = currentPosition.x + (targetPosition.x - currentPosition.x) * dampingFactor;
    const newY = currentPosition.y + (targetPosition.y - currentPosition.y) * dampingFactor;
    
    // Mise à jour uniquement si le changement est significatif
    if (Math.abs(newX - currentPosition.x) > 0.001 || Math.abs(newY - currentPosition.y) > 0.001) {
      setCurrentPosition({ x: newX, y: newY });
      
      // Appliquer les transformations directement au DOM pour de meilleures performances
      if (cardRef.current) {
        // Calculer rotations
        const rotateX = (newY - 0.5) * -maxRotation * 2; // Inverser Y pour rotation X
        const rotateY = (newX - 0.5) * maxRotation * 2;
        
        // Appliquer rotation à la carte
        cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Appliquer décalage au fond
        const bgEl = cardRef.current.querySelector('.background-layer') as HTMLElement;
        if (bgEl) {
          const bgOffsetX = (newX - 0.5) * bgOffsetMultiplier * 2;
          const bgOffsetY = (newY - 0.5) * bgOffsetMultiplier * 2;
          bgEl.style.transform = `translateZ(0px) scale(1.05) translateX(${bgOffsetX}px) translateY(${bgOffsetY}px)`;
        }
        
        // Appliquer décalage au texte
        const textEl = cardRef.current.querySelector('.text-layer') as HTMLElement;
        if (textEl) {
          const textOffsetX = (newX - 0.5) * textOffsetMultiplier * 2;
          const textOffsetY = (newY - 0.5) * textOffsetMultiplier * 2;
          textEl.style.transform = `translateZ(40px) translateX(${textOffsetX}px) translateY(${textOffsetY}px)`;
        }
      }
    }
    
    // Continuer l'animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    
    // Mettre à jour la position cible uniquement
    setTargetPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Démarrer l'animation
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Revenir au centre
    setTargetPosition({ x: 0.5, y: 0.5 });
    
    // Arrêter l'animation après un délai pour laisser le temps au retour
    setTimeout(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        
        // Réinitialiser la position actuelle après l'arrêt
        setCurrentPosition({ x: 0.5, y: 0.5 });
      }
    }, 800);
  };

  // Nettoyer l'animation lors du démontage
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
          transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}
      >
        {/* Couche d'arrière-plan */}
        <div 
          className="background-layer"
          style={{ 
            transform: 'translateZ(0px) scale(1.05)',
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <Image
            src={backgroundImage || "/placeholder.svg"}
            alt="Background design element"
            fill
            className="project-img"
            style={{ objectFit: 'cover' }}
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
            transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {textImage ? (
            <Image
              src={textImage}
              alt="Text overlay"
              fill
              className="text-img"
              style={{ objectFit: 'contain', padding: '1.5rem' }}
            />
          ) : textContent ? (
            <div className="text-content">
              {textContent}
            </div>
          ) : null}
        </div>
        
        {/* Effet de brillance */}
        <div 
          className="glow-effect"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: isHovering 
              ? `radial-gradient(circle at ${currentPosition.x * 100}% ${currentPosition.y * 100}%, rgba(247, 165, 32, 0.2), transparent 70%)` 
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