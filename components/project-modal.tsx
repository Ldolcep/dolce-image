// project-modal.tsx

"use client"

import type React from "react"
import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
// Removed Link import as it's no longer used
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Project {
    id: string
    title: string
    mainVisual: string
    additionalVisuals: string[]
    description: string
    link: string // Keep in interface in case data still has it
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
    const modalRef = useRef<HTMLDivElement>(null) // Ref for the inner content box

    useEffect(() => {
        if (isOpen) {
            setCurrentImageIndex(0)
            setTimeout(() => {
                setIsAnimating(true)
            }, 10)
        } else {
            setIsAnimating(false)
            // Optional: Add a delay matching animation before setting display none if needed
        }
    }, [project, isOpen])


    // Handle click outside to close (using overlay ID)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Ensure the click is directly on the overlay
            if (event.target === event.currentTarget) {
                onClose();
            }
        }
        const overlay = document.getElementById(`modal-overlay-${project.id}`);
        if (isOpen && overlay) {
            overlay.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            if (overlay) {
                overlay.removeEventListener("mousedown", handleClickOutside);
            }
        }
    }, [isOpen, onClose, project.id]);


    const handleNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allVisuals.length);
    };

    const handlePrevious = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allVisuals.length) % allVisuals.length);
    };

    const goToSlide = (index: number) => {
        setCurrentImageIndex(index);
    };

    // Early return if not open to prevent rendering null or empty elements
    if (!isOpen && !isAnimating) return null // Return null only after fade out potentially

    const currentImage = allVisuals[currentImageIndex];

    return (
        <div
            id={`modal-overlay-${project.id}`}
            className={`fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} // Added pointer-events none when closed
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-title-${project.id}`}
        >
            {/* Modal Content Box */}
            <div
                ref={modalRef}
                className={`bg-white w-full max-w-4xl h-auto max-h-[90vh] rounded-sm shadow-xl flex flex-col md:flex-row transition-all duration-300 ease-out ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside from propagating to overlay
            >
                 {/* Close Button - Positioned relative to the content box */}
                <button
                    className="absolute -top-3 -right-3 z-20 p-1.5 bg-gray-700 text-white rounded-full hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>

                {/* === Left Column / Mobile Top: Image Area === */}
                {/* Added flex-grow and min-h-0 for better flex behavior */}
                <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col justify-center relative flex-grow min-h-0">
                    {/* Image Container: Relative for overlay, flex-grow to take space */}
                    <div className="relative w-full h-full flex-grow overflow-hidden bg-gray-100 flex items-center justify-center">
                        {/* Image: Object-contain maintains ratio, key for potential transition */}
                        <Image
                            key={currentImage}
                            src={currentImage || "/placeholder.svg"}
                            alt={project.title}
                            fill // Fill the container
                            className="object-contain" // Maintain aspect ratio within container
                            sizes="(max-width: 768px) 90vw, 40vw"
                            priority={currentImageIndex === 0}
                        />

                        {/* Navigation Arrows: Smaller, more subtle, overlaid */}
                        {allVisuals.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevious}
                                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/30 text-white p-1.5 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-1 focus:ring-white/50 z-10" // Smaller padding, adjusted ring
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={18} /> {/* Smaller icon */}
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/30 text-white p-1.5 rounded-full hover:bg-black/50 transition-colors focus:outline-none focus:ring-1 focus:ring-white/50 z-10" // Smaller padding, adjusted ring
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={18} /> {/* Smaller icon */}
                                </button>
                            </>
                        )}

                        {/* Pagination Dots: Smaller, overlaid at the bottom */}
                        {allVisuals.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex justify-center gap-1.5 z-10"> {/* Smaller gap */}
                                {allVisuals.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-colors duration-200 ${ // Smaller dots
                                            currentImageIndex === index ? 'bg-white/90 ring-1 ring-black/30' : 'bg-black/30 hover:bg-black/50' // Adjusted active/inactive style
                                        }`}
                                        aria-label={`Go to image ${index + 1}`}
                                        aria-pressed={currentImageIndex === index}
                                    />
                                ))}
                            </div>
                        )}
                    </div> {/* End Image Container */}
                </div> {/* End Left Column / Mobile Top */}


                {/* === Right Column / Mobile Bottom: Text Content === */}
                <div className="w-full md:w-1/2 p-4 md:p-6 flex flex-col overflow-y-auto max-h-[80vh] md:max-h-full">
                    <h2 id={`modal-title-${project.id}`} className="font-poppins text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
                        {project.title}
                    </h2>
                    {/* flex-grow makes description take available space */}
                    <p className="font-poppins text-sm md:text-base text-gray-600 leading-relaxed flex-grow mb-4">
                        {project.description}
                    </p>
                    {/* "View Project" Button Removed */}
                </div> {/* End Right Column / Mobile Bottom */}

            </div> {/* End Modal Content Box */}
        </div> // End Overlay
    )
}