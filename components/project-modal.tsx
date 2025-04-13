// project-modal.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react" // Ensure lucide-react is installed

interface Project {
    id: string
    title: string
    mainVisual: string
    additionalVisuals: string[]
    description: string
    link: string // Keep in type definition
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
    const modalRef = useRef<HTMLDivElement>(null) // Ref for the modal content

    useEffect(() => {
        if (isOpen) {
            setCurrentImageIndex(0);
            // Delay animation slightly
            requestAnimationFrame(() => {
                 requestAnimationFrame(() => setIsAnimating(true));
            });
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            // Use mousedown for potentially better capture than click
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, onClose]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent click from propagating to image/overlay if needed
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allVisuals.length);
    };

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allVisuals.length) % allVisuals.length);
    };

    // No goToSlide needed as dots are removed

    if (!isOpen && !isAnimating) return null;

    const currentImage = allVisuals[currentImageIndex];

    return (
        // Overlay
        <div
            className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${project.id}`}
        >
            {/* Modal Content Box */}
            <div
                ref={modalRef}
                // Increased max-w slightly, added rounded-md for subtle rounding
                className={`bg-white w-full max-w-5xl h-auto max-h-[85vh] md:max-h-[75vh] rounded-md shadow-xl flex flex-col md:flex-row overflow-hidden transition-all duration-300 ease-out relative ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            >
                {/* Close Button: Styled like the screenshot */}
                <button
                    className="absolute top-2 right-2 md:-top-3 md:-right-3 z-20 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>

                {/* === Left Column / Mobile Top: Image Area === */}
                {/* Ensure this column takes appropriate space and centers content */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center relative bg-gray-50 md:bg-white order-1 md:order-1">
                    {/* Image Container: Takes available space, relative for arrows */}
                    <div className="relative w-full h-full max-h-[60vh] md:max-h-full aspect-[4/3]"> {/* Maintain aspect ratio */}
                        {/* Image: Object-contain */}
                        <Image
                            key={currentImage}
                            src={currentImage || "/placeholder.svg"}
                            alt={project.title}
                            fill
                            className="object-contain" // Fit within container, maintain ratio
                            sizes="(max-width: 768px) 90vw, 45vw"
                            priority={currentImageIndex === 0}
                        />

                        {/* Subtle Side Navigation Arrows (Overlaid) */}
                        {allVisuals.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevious}
                                    // Subtle styling: appears more on hover
                                    className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 opacity-50 hover:opacity-100 transition-all p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-black/50 z-10"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    // Subtle styling
                                    className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-900 opacity-50 hover:opacity-100 transition-all p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-black/50 z-10"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                    </div> {/* End Image Container */}
                    {/* NO PAGINATION CONTROLS BELOW IMAGE */}
                </div> {/* End Left Column / Mobile Top */}


                {/* === Right Column / Mobile Bottom: Text Content === */}
                {/* Adjusted padding, order for mobile stacking */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto order-2 md:order-2">
                    <h2
                        id={`modal-title-${project.id}`}
                        // Apply a generic serif stack or configure 'font-serif' in Tailwind
                        className="font-serif text-2xl md:text-3xl font-medium mb-4 text-gray-900"
                    >
                        {project.title}
                    </h2>
                    {/* Description using sans-serif */}
                    <p className="font-sans text-sm text-gray-700 leading-relaxed">
                        {project.description}
                    </p>
                     {/* No "View Project" button */}
                </div> {/* End Right Column / Mobile Bottom */}

            </div> {/* End Modal Content Box */}
        </div> // End Overlay
    )
}

// Add to your tailwind.config.js if not already present:
// theme: {
//   extend: {
//     fontFamily: {
//       sans: ['Poppins', 'sans-serif', /* other fallbacks */],
//       serif: ['Times New Roman', 'serif', /* other fallbacks */],
//       'great-vibes': ['Great Vibes', 'cursive'], // Keep if used elsewhere
//     },
//   },
// },