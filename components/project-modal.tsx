// project-modal.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Project {
    id: string
    title: string
    mainVisual: string
    additionalVisuals: string[]
    description: string
    link: string
}

interface ProjectModalProps {
    project: Project
    isOpen: boolean
    onClose: () => void
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const allVisuals = useMemo(() => [project.mainVisual, ...project.additionalVisuals], [project]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false)
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            setCurrentImageIndex(0);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsAnimating(true));
            });
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, onClose]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allVisuals.length);
    };

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allVisuals.length) % allVisuals.length);
    };

    if (!isOpen && !isAnimating) return null;

    const currentImage = allVisuals[currentImageIndex];

    return (
        <div
            className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${project.id}`}
        >
            {/* Modal Content Box : Layout principal (colonne mobile, row desktop) */}
            <div
                ref={modalRef}
                // Augmentation légère de max-w, ajustement max-h, coins arrondis
                className={`bg-white w-full max-w-4xl h-auto max-h-[90vh] rounded-md shadow-xl flex flex-col md:flex-row overflow-hidden transition-all duration-300 ease-out relative ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            >
                {/* Bouton Fermer : Positionnement précis du centre sur le coin */}
                <button
                    className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 z-20 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>

                {/* === Colonne Gauche / Haut Mobile : Zone Image === */}
                {/* md:w-1/2 pour largeur sur desktop/tablette. min-h-0 est important pour flexbox */}
                <div className="w-full md:w-1/2 p-6 flex items-center justify-center relative min-h-0 order-1">
                    {/* Conteneur Image : Prend toute la hauteur/largeur de la colonne */}
                    <div className="relative w-full h-full aspect-[4/3]"> {/* Ratio pour la zone, peut être ajusté */}
                        {/* Image : object-contain pour voir toute l'image */}
                        <Image
                            key={currentImage}
                            src={currentImage || "/placeholder.svg"}
                            alt={project.title}
                            fill
                            className="object-contain" // Important: préserve le ratio, ne coupe pas
                            sizes="(max-width: 768px) 90vw, 45vw" // Adapter selon les breakpoints
                            priority={currentImageIndex === 0}
                        />

                        {/* Flèches de Navigation Superposées */}
                        {allVisuals.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevious}
                                    className="absolute top-1/2 left-2 md:left-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 opacity-60 hover:opacity-100 transition-all p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-black/50 z-10"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={28} /> {/* Taille augmentée légèrement */}
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute top-1/2 right-2 md:right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 opacity-60 hover:opacity-100 transition-all p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-black/50 z-10"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={28} /> {/* Taille augmentée légèrement */}
                                </button>
                            </>
                        )}
                    </div> {/* Fin Conteneur Image */}
                     {/* PAS de pagination en dessous */}
                </div> {/* Fin Colonne Gauche / Haut Mobile */}


                {/* === Colonne Droite / Bas Mobile : Zone Texte === */}
                {/* md:w-1/2 pour largeur, gestion overflow */}
                <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto max-h-[80vh] md:max-h-full order-2">
                    <h2
                        id={`modal-title-${project.id}`}
                        className="font-serif text-2xl md:text-3xl font-medium mb-3 text-gray-900" // Police Serif
                    >
                        {project.title}
                    </h2>
                    <p className="font-sans text-sm text-gray-700 leading-relaxed flex-grow"> {/* Police Sans, flex-grow pour prendre l'espace */}
                        {project.description}
                    </p>
                    {/* PAS de bouton "View Project" */}
                </div> {/* Fin Colonne Droite / Bas Mobile */}

            </div> {/* Fin Modal Content Box */}
        </div> // Fin Overlay
    )
}

// Rappel : Configurer les polices dans tailwind.config.js si nécessaire
// theme: { extend: { fontFamily: { sans: [...], serif: [...] } } }