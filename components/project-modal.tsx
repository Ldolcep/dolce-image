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
    link: string // Keep in type definition for data consistency
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

    // Handle modal open/close animation state
    useEffect(() => {
        if (isOpen) {
            setCurrentImageIndex(0); // Reset image index on open
            // Need a slight delay to allow the element to mount before animating
            requestAnimationFrame(() => {
                 requestAnimationFrame(() => setIsAnimating(true));
            });
        } else {
            setIsAnimating(false);
        }
    }, [isOpen]);

    // Handle click outside to close (added check for modalRef.current)
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


    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allVisuals.length);
    };

    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allVisuals.length) % allVisuals.length);
    };

    const goToSlide = (index: number) => {
        setCurrentImageIndex(index);
    };

    // Render null if closed and animation finished (or never opened)
    if (!isOpen && !isAnimating) return null;

    const currentImage = allVisuals[currentImageIndex];

    return (
        // Overlay: Handles background dimming and centering
        <div
            className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${project.id}`}
            // No longer attaching click outside here, moved to document listener
        >
            {/* Modal Content Box: Manages layout, size, and appearance */}
            <div
                ref={modalRef}
                className={`bg-white w-full max-w-4xl h-auto max-h-[90vh] rounded-lg shadow-xl flex flex-col md:flex-row overflow-hidden transition-all duration-300 ease-out relative ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
            >
                {/* Close Button: Styled like the screenshot */}
                <button
                    className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={18} />
                </button>

                {/* === Left Column / Mobile Top: Image Area === */}
                {/* Use flex-col to structure image container and pagination below it */}
                <div className="w-full md:w-1/2 p-4 pb-2 md:p-6 md:pb-6 flex flex-col relative">
                    {/* Image Container: Takes available space, relative for side arrows */}
                    <div className="relative w-full flex-grow overflow-hidden aspect-[4/3] bg-gray-100 rounded-md"> {/* Added aspect-ratio for predictability */}
                        {/* Image: Fills container, maintains aspect ratio */}
                        <Image
                            key={currentImage} // Key helps with transitions if using a library
                            src={currentImage || "/placeholder.svg"}
                            alt={project.title}
                            fill
                            className="object-contain" // Ensures whole image is visible
                            sizes="(max-width: 768px) 90vw, 40vw"
                            priority={currentImageIndex === 0}
                        />

                        {/* Subtle Side Navigation Arrows (Overlaid) */}
                        {allVisuals.length > 1 && (
                            <>
                                {/* Previous Arrow */}
                                <button
                                    onClick={handlePrevious}
                                    className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-700 hover:text-black opacity-60 hover:opacity-100 transition-all duration-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-black/50 z-10"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={28} />
                                </button>
                                {/* Next Arrow */}
                                <button
                                    onClick={handleNext}
                                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-700 hover:text-black opacity-60 hover:opacity-100 transition-all duration-200 p-1 rounded-full focus:outline-none focus:ring-1 focus:ring-black/50 z-10"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={28} />
                                </button>
                            </>
                        )}
                    </div> {/* End Image Container */}

                    {/* Pagination Controls (Below Image) */}
                    {allVisuals.length > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-4"> {/* Increased gap, added margin top */}
                            {/* Pagination Previous Arrow */}
                            <button
                                onClick={handlePrevious}
                                className="text-gray-600 hover:text-black transition-colors duration-200 p-1 focus:outline-none focus:ring-1 focus:ring-black/30 rounded-md"
                                aria-label="Previous image (pagination)"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            {/* Pagination Dots */}
                            <div className="flex gap-2"> {/* Smaller gap for dots */}
                                {allVisuals.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                                            currentImageIndex === index ? 'bg-gray-800' : 'bg-gray-300 hover:bg-gray-500'
                                        }`}
                                        aria-label={`Go to image ${index + 1}`}
                                        aria-pressed={currentImageIndex === index}
                                    />
                                ))}
                            </div>
                            {/* Pagination Next Arrow */}
                             <button
                                onClick={handleNext}
                                className="text-gray-600 hover:text-black transition-colors duration-200 p-1 focus:outline-none focus:ring-1 focus:ring-black/30 rounded-md"
                                aria-label="Next image (pagination)"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div> {/* End Left Column / Mobile Top */}


                {/* === Right Column / Mobile Bottom: Text Content === */}
                {/* Added flex-grow for better height management */}
                <div className="w-full md:w-1/2 p-4 pt-0 md:p-6 flex flex-col overflow-y-auto max-h-[80vh] md:max-h-full flex-grow">
                    <h2
                        id={`modal-title-${project.id}`}
                        // Using serif font for title as per screenshot suggestion
                        className="font-serif text-2xl md:text-3xl font-medium mb-3 text-gray-900"
                    >
                        {project.title}
                    </h2>
                    {/* Description takes remaining space */}
                    <p className="font-sans text-sm md:text-base text-gray-600 leading-relaxed flex-grow">
                        {project.description}
                    </p>
                     {/* No "View Project" button */}
                </div> {/* End Right Column / Mobile Bottom */}

            </div> {/* End Modal Content Box */}
        </div> // End Overlay
    )
}