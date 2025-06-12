"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
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
  const animationFrameId = useRef<number | null>(null);

  // --- Configuration de l'animation ---
  const maxRotation = 3; // Degrés max
  const textOffsetMultiplier = 15; // Pixels max texte
  const bgOffsetMultiplier = -4; // Pixels max fond (inversé)
  const dampingFactor = 0.08; // Plus petit = plus doux (ex: 0.05 - 0.1)

  // --- Refs pour stocker les valeurs d'animation ---
  // Valeurs CIBLES (basées sur la position directe de la souris)
  const targetValues = useRef({
    rotateX: 0, rotateY: 0,
    textOffsetX: 0, textOffsetY: 0,
    bgOffsetX: 0, bgOffsetY: 0,
    glowX: 0.5, glowY: 0.5 // Position normalisée de la brillance
  });
  // Valeurs ACTUELLES (celles appliquées, évoluant avec amortissement)
  const currentValues = useRef({
    rotateX: 0, rotateY: 0,
    textOffsetX: 0, textOffsetY: 0,
    bgOffsetX: 0, bgOffsetY: 0,
    glowX: 0.5, glowY: 0.5
  });

  // --- Boucle d'animation ---
  const animate = useCallback(() => {
    if (!isHovering && Math.abs(currentValues.current.rotateX) < 0.01 && Math.abs(currentValues.current.rotateY) < 0.01) {
      // Si on n'est plus en survol et que l'élément est revenu à sa position, arrêter
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
      return;
    }

    // Calculer la différence entre la cible et la valeur actuelle
    const deltaRotateX = targetValues.current.rotateX - currentValues.current.rotateX;
    const deltaRotateY = targetValues.current.rotateY - currentValues.current.rotateY;
    const deltaTextOffsetX = targetValues.current.textOffsetX - currentValues.current.textOffsetX;
    const deltaTextOffsetY = targetValues.current.textOffsetY - currentValues.current.textOffsetY;
    const deltaBgOffsetX = targetValues.current.bgOffsetX - currentValues.current.bgOffsetX;
    const deltaBgOffsetY = targetValues.current.bgOffsetY - currentValues.current.bgOffsetY;
    const deltaGlowX = targetValues.current.glowX - currentValues.current.glowX;
    const deltaGlowY = targetValues.current.glowY - currentValues.current.glowY;

    // Appliquer l'amortissement : ajouter une fraction de la différence à la valeur actuelle
    currentValues.current.rotateX += deltaRotateX * dampingFactor;
    currentValues.current.rotateY += deltaRotateY * dampingFactor;
    currentValues.current.textOffsetX += deltaTextOffsetX * dampingFactor;
    currentValues.current.textOffsetY += deltaTextOffsetY * dampingFactor;
    currentValues.current.bgOffsetX += deltaBgOffsetX * dampingFactor;
    currentValues.current.bgOffsetY += deltaBgOffsetY * dampingFactor;
    currentValues.current.glowX += deltaGlowX * dampingFactor;
    currentValues.current.glowY += deltaGlowY * dampingFactor;

    // Appliquer les transformations aux éléments
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateX(${currentValues.current.rotateX}deg) rotateY(${currentValues.current.rotateY}deg)`;
      // Appliquer l'effet de brillance amorti
      cardRef.current.style.background = `radial-gradient(circle at ${currentValues.current.glowX * 100}% ${currentValues.current.glowY * 100}%, rgba(255,255,255,0.08), transparent)`;
    }
    if (backgroundRef.current) {
      backgroundRef.current.style.transform = `translateZ(0px) scale(1.05) translateX(${currentValues.current.bgOffsetX}px) translateY(${currentValues.current.bgOffsetY}px)`;
    }
    if (textRef.current) {
      textRef.current.style.transform = `translateZ(40px) translateX(${currentValues.current.textOffsetX}px) translateY(${currentValues.current.textOffsetY}px)`;
    }

    // Demander la prochaine frame
    animationFrameId.current = requestAnimationFrame(animate);

  }, [isHovering, dampingFactor]); // Inclure isHovering et dampingFactor dans les dépendances de useCallback

  // --- Gestionnaires d'événements ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width;
    const normalizedY = (e.clientY - rect.top) / rect.height;

    // Mettre à jour les valeurs CIBLES
    targetValues.current = {
      rotateY: (normalizedX - 0.5) * maxRotation * 2,
      rotateX: (normalizedY - 0.5) * -maxRotation * 2,
      textOffsetX: (normalizedX - 0.5) * textOffsetMultiplier * 2,
      textOffsetY: (normalizedY - 0.5) * textOffsetMultiplier * 2,
      bgOffsetX: (normalizedX - 0.5) * bgOffsetMultiplier * 2,
      bgOffsetY: (normalizedY - 0.5) * bgOffsetMultiplier * 2,
      glowX: normalizedX,
      glowY: normalizedY
    };

    // Démarrer l'animation si elle n'est pas déjà en cours
    if (!animationFrameId.current) {
      animationFrameId.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);

    // Supprimer les transitions CSS pour laisser JS gérer l'animation PENDANT le survol
    if (cardRef.current) cardRef.current.style.transition = 'none';
    if (backgroundRef.current) backgroundRef.current.style.transition = 'none';
    if (textRef.current) textRef.current.style.transition = 'none';

    // Démarrer l'animation immédiatement
    if (!animationFrameId.current) {
       animationFrameId.current = requestAnimationFrame(animate);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);

    // Définir la cible sur l'état de repos (0)
    targetValues.current = {
      rotateX: 0, rotateY: 0,
      textOffsetX: 0, textOffsetY: 0,
      bgOffsetX: 0, bgOffsetY: 0,
      glowX: 0.5, glowY: 0.5 // Centre pour la brillance au repos
    };

    // Laisser la boucle `animate` ramener doucement les valeurs vers 0,
    // OU on peut forcer le retour avec les transitions CSS comme avant
    // Pour un retour plus rapide et contrôlé par CSS :
    if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1), background 0.8s ease'; // Transition plus longue pour le retour
        cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        cardRef.current.style.background = 'none'; // Supprimer la brillance
    }
    if (backgroundRef.current) {
        backgroundRef.current.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        backgroundRef.current.style.transform = 'translateZ(0px) scale(1)';
    }
    if (textRef.current) {
        textRef.current.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
        textRef.current.style.transform = 'translateZ(40px)';
    }

    // Optionnel: Annuler explicitement la boucle si on utilise les transitions CSS pour le retour
    // Si on laisse la boucle 'animate' gérer le retour, ne pas annuler ici mais laisser la condition dans 'animate' faire le travail.
    // if (animationFrameId.current) {
    //    cancelAnimationFrame(animationFrameId.current);
    //    animationFrameId.current = null;
    // }

     // Reset les valeurs actuelles si on utilise la transition CSS pour le retour pour éviter un saut au prochain hover
     currentValues.current = { ...targetValues.current };


  };

  // Nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
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
          // La transition initiale est gérée par handleMouseLeave/Enter
          willChange: 'transform, background', // Indiquer au navigateur ce qui va changer
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
            inset: '-5%', // Légèrement plus grand pour éviter les bords lors de la rotation/scale
            transform: `scale(1)`, // Scale initial
            // La transition initiale est gérée par handleMouseLeave/Enter
            willChange: 'transform',
            zIndex: 1 // Mettre derrière le texte
          }}
        >
          <Image
            src={backgroundImage}
            alt="Background design element"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes, adjust as needed
            style={{
              objectFit: 'cover',
              transform: 'scale(1.1)' // Pré-scaler un peu dans l'image pour compenser l'inset
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
            // La transition initiale est gérée par handleMouseLeave/Enter
            willChange: 'transform',
            zIndex: 3 // Devant le fond et la brillance normale
          }}
        >
          <Image
            src={textImage}
            alt="Text overlay"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes
            style={{
              objectFit: 'contain',
              padding: '1.5rem' // Ajuster si nécessaire
            }}
          />
        </div>

        {/* Couche pour la brillance radiale (via style direct sur cardRef) */}
        {/* Suppression de l'ancien div de brillance linéaire si non désiré */}
        {/*
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            backgroundSize: '200% 100%',
            opacity: isHovering ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 2, // Entre le fond et le texte
            animation: isHovering ? 'shine3D 2s infinite' : 'none'
          }}
        />
        */}
      </div>
    </div>
  );
}

// Optionnel : Définir l'animation CSS shine3D si vous gardez la brillance linéaire
/* Dans votre fichier CSS global :
@keyframes shine3D {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
*/