"use client"

import type React from "react"
import { motion } from "framer-motion"
import OptimizedImage from "@/components/ui/OptimizedImage"
import { formatDate } from "@/utils/formatters"
import type { Project } from "@/types/project"
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"

interface ProjectCardProps {
  project: Project
  onClick: (project: Project) => void
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const [isVisible, cardRef] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  })

  const handleClick = () => {
    onClick(project)
  }

  return (
    <motion.div
      ref={cardRef as React.RefObject<HTMLDivElement>}
      className="project-card break-inside-avoid-column mb-6 rounded-lg overflow-hidden shadow-md bg-white cursor-pointer transition-all duration-300"
      style={{
        backgroundColor: project.detailsprojet.couleurDeFond || "white",
        willChange: "transform",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      tabIndex={0}
      role="button"
      aria-label={`Voir les détails de ${project.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <OptimizedImage
          src={project.featuredImage.sourceUrl}
          alt={project.featuredImage.altText}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-serif mb-1">{project.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{formatDate(project.date)}</p>
        <div className="flex flex-wrap gap-2">
          {project.services.map((service) => (
            <span key={service.slug} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
              {service.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

