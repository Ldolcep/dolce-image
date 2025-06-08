// --- START OF FILE ProjectModalDesktop.tsx (REBUILT WITH FRAMER MOTION) ---

"use client"

import ReactMarkdown from 'react-markdown';
import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// L'interface Project reste la même
export interface Project { id: string; title: string; mainVisual: string; additionalVisuals: string[]; description: string | string[]; link: string; }
interface ProjectModalDesktopProps { project: Project; isOpen: boolean; onClose: () => void; }

// --- Définitions des animations pour Framer Motion ---
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }
};

export default function ProjectModalDesktop({ project, isOpen, onClose }: ProjectModalDesktopProps) {
  const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals].filter(Boolean), [project]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // --- LOGIQUE SIMPLIFIÉE ---
  // On a juste besoin de savoir si l'image actuelle est chargée
  const [isCurrentImageLoaded, setIsCurrentImageLoaded] = useState(false);

  const descriptionColumnRef = useRef<HTMLDivElement>(null);

  // Reset quand le projet change
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setIsCurrentImageLoaded(false); // On réinitialise l'état de chargement
    }
  }, [project.id, isOpen]);

  const handleNext = useCallback(() => {
    setIsCurrentImageLoaded(false); // Préparer le chargement de la nouvelle image
    setCurrentImageIndex((prev) => (prev + 1) % allVisuals.length);
  }, [allVisuals.length]);

  const handlePrevious = useCallback(() => {
    setIsCurrentImageLoaded(false);
    setCurrentImageIndex((prev) => (prev - 1 + allVisuals.length) % allVisuals.length);
  }, [allVisuals.length]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (allVisuals.length > 1) {
        if (e.key === "ArrowRight") handleNext();
        else if (e.key === "ArrowLeft") handlePrevious();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleNext, handlePrevious, onClose, allVisuals.length]);


  return (
    // AnimatePresence gère l'animation d'entrée/sortie de la modale
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4 md:p-6 z-50"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
        >
          {/* Le fond flou est aussi animé */}
          <div className="absolute inset-0 -z-10">
            <Image src="/images/gallery-background.jpg" alt="" fill quality={80} sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" />
          </div>

          <motion.div
            className="bg-white w-full max-w-5xl h-auto max-h-[90vh] relative shadow-2xl flex flex-col md:flex-row overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Colonne image */}
            <div className="w-full md:w-1/2 relative flex-shrink-0 flex items-center justify-center bg-gray-100 min-h-[300px]">
              {/* AnimatePresence pour animer le changement d'image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
                  exit={{ opacity: 0, x: -30, transition: { duration: 0.2, ease: 'easeIn' } }}
                >
                  <Image
                    src={allVisuals[currentImageIndex]}
                    alt={`Image ${currentImageIndex + 1} du projet ${project.title}`}
                    fill
                    className="object-contain"
                    priority={currentImageIndex === 0}
                    onLoad={() => setIsCurrentImageLoaded(true)}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Indicateur de chargement */}
              {!isCurrentImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <Loader className="animate-spin text-primary-orange" size={40} />
                </div>
              )}
              
              {/* Navigation (simplifiée et rendue conditionnelle) */}
              {isCurrentImageLoaded && allVisuals.length > 1 && (
                <>
                  <button onClick={handlePrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 btn-nav"><ChevronLeft size={20} /></button>
                  <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 btn-nav"><ChevronRight size={20} /></button>
                </>
              )}
            </div>

            {/* Colonne description */}
            <div ref={descriptionColumnRef} className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar">
              <h2 className="font-koolegant text-2xl md:text-3xl font-medium mb-4">{project.title}</h2>
              <div className="text-base text-gray-700 leading-relaxed prose lg:prose-base">
                {Array.isArray(project.description) ? project.description.map((md, i) => <ReactMarkdown key={i}>{md}</ReactMarkdown>) : <ReactMarkdown>{project.description}</ReactMarkdown>}
              </div>
              {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="block mt-6 text-primary-blue hover:underline">Visiter le site du projet</a>}
            </div>

            <button onClick={onClose} className="absolute top-3 right-3 z-20 text-gray-500 hover:text-black transition-colors"><X size={24} /></button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- END OF FILE ProjectModalDesktop.tsx (REBUILT WITH FRAMER MOTION) ---