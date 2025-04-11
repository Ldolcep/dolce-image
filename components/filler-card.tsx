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
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0 });
  const [currentRotation, setCurrentRotation] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0.5, y: 0.5 });
  const [currentPosition, setCurrentPosition] = useState({ x: 0.5, y: 0.5 });
  const animationFrameRef = useRef<number | null>(null);

  // Fonction d'animation principale - s'exécute à chaque frame
  const animate = () => {
    // Facteur d'amortissement - plus petit = plus doux
    const dampFactor = 0.08;
    
    // Mettre à jour les rotations actuelles avec amortissement
    const newRotationX = currentRotation.x + (targetRotation.x - currentRotation.x) * dampFactor;
    const newRotationY = currentRotation.y + (targetRotation.y - currentRotation.y) * dampFactor;
    
    // Mettre à jour la position actuelle avec amortissement
    const newPositionX = currentPosition.x + (targetPosition.x - currentPosition.x) * dampFactor;
    const newPositionY = currentPosition.y + (targetPosition.y - currentPosition.y) * dampFactor;
    
    // Vérifier si les changements sont significatifs
    const hasSignificantChange = 
      Math.abs(newRotationX - currentRotation.x) > 0.001 || 
      Math.abs(newRotationY - currentRotation.y) > 0.001 ||
      Math.abs(newPositionX - currentPosition.x) > 0.001 ||
      Math.abs(newPositionY - currentPosition.y) > 0.001;
    
    if (hasSignificantChange) {
      setCurrentRotation({ x: newRotationX, y: newRotationY });
      setCurrentPosition({ x: newPositionX, y: newPositionY });
      
      const card = cardRef.current;
      if (card) {
        // Appliquer la rotation principale à la carte
        card.style.transform = `perspective(1000px) rotateX(${newRotationX}deg) rotateY(${newRotationY}deg)`;
        
        // Effet de lumière dynamique basé sur la position
        card.style.background = `radial-gradient(circle at ${newPositionX * 100}% ${newPositionY * 100}%, rgba(255,255,255,0.1), transparent)`;
        
        // Mettre à jour les éléments internes
        const backgroundEl = card.querySelector('.background-layer') as HTMLElement;
        if (backgroundEl) {
          backgroundEl.style.transform = `translateZ(0px) scale(1.03) translateX(${(newPositionX - 0.5) * -10}px) translateY(${(newPositionY - 0.5) * -10}px)`;
        }
        
        const textEl = card.querySelector('.text-layer') as HTMLElement;
        if (textEl) {
          textEl.style.transform = `translateZ(40px) translateX(${(newPositionX - 0.5) * 15}px) translateY(${(newPositionY - 0.5) * 15}px)`;
        }
      }
    }
    
    // Continuer l'animation
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normaliser les positions (0-1)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;

    // Mettre à jour les positions cibles
    setTargetPosition({ x: normalizedX, y: normalizedY });
    
    // Calculer les rotations cibles avec des valeurs réduites pour plus de douceur
    const targetRotateY = (normalizedX - 0.5) * 8; // Réduit de 12 à 8
    const targetRotateX = (normalizedY - 0.5) * -8; // Réduit de 12 à 8
    
    setTargetRotation({ x: targetRotateX, y: targetRotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    // Démarrer la boucle d'animation
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    // Réinitialiser les cibles vers l'état de repos
    setTargetRotation({ x: 0, y: 0 });
    setTargetPosition({ x: 0.5, y: 0.5 });
    
    // L'animation continue jusqu'à ce que la carte revienne à sa position initiale
    // Mais on peut l'arrêter après un certain délai pour économiser des ressources
    setTimeout(() => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        
        // Réinitialiser complètement les états après l'arrêt de l'animation
        setCurrentRotation({ x: 0, y: 0 });
        setCurrentPosition({ x: 0.5, y: 0.5 });
      }
    }, 800); // Délai suffisant pour terminer l'animation de retour
  };

  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
          // On utilise toujours une transition pour le retour à l'état initial
          transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.8s ease',
          transform: 'perspective(1000px) rotateX(0) rotateY(0)',
          willChange: 'transform'
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
            transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            willChange: 'transform'
          }}
        >
          <Image
            src={backgroundImage || "/placeholder.svg"}
            alt="Background design element"
            fill
            className="project-img"
            style={{ 
              objectFit: 'cover', 
              transition: 'transform 0.3s ease-out'
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
            transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            willChange: 'transform'
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
                transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease'
              }}
            />
          ) : textContent ? (
            <div 
              className="text-content"
              style={{
                transition: isHovering ? 'none' : 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease'
              }}
            >
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
            backgroundImage: 'radial-gradient(circle at center, rgba(247, 165, 32, 0.2), transparent 70%)',
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.8s ease',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      </div>
    </div>
  );
}