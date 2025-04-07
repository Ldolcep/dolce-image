"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { ExternalLink } from "lucide-react"
import Modal from "@/components/ui/Modal"
import OptimizedImage from "@/components/ui/OptimizedImage"
import { formatDate } from "@/utils/formatters"
import type { Project } from "@/types/project"
import ProjectModalSkeleton from "./ProjectModalSkeleton"

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Réinitialiser l'état de chargement lorsque le projet change
  const handleProjectChange = () => {
    if (project) {
      setIsLoading(true)
      setSelectedImage(project.featuredImage.sourceUrl)
    }
  }

  // Gérer le chargement de l'image principale
  const handleMainImageLoad = () => {
    setIsLoading(false)
  }

  // Mettre à jour l'image sélectionnée
  const handleThumbnailClick = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-6xl">
      {project ? (
        <div className="p-6">
          {isLoading && <ProjectModalSkeleton />}

          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            style={{ display: isLoading ? "none" : "grid" }}
          >
            <div className="space-y-4">
              <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
                <OptimizedImage
                  src={selectedImage || project.featuredImage.sourceUrl}
                  alt={project.title}
                  fill
                  className="object-cover"
                  onLoad={handleMainImageLoad}
                  priority
                />
              </div>

              {project.detailsprojet.galerie.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {project.detailsprojet.galerie.map((image, index) => (
                    <button
                      key={index}
                      className={`aspect-[1/1] relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedImage === image.sourceUrl ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleThumbnailClick(image.sourceUrl)}
                      aria-label={`Voir l'image ${image.altText}`}
                    >
                      <OptimizedImage src={image.sourceUrl} alt={image.altText} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-serif">{project.title}</h2>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Client</span>
                  <span className="font-medium">{project.detailsprojet.clientSociete}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Date</span>
                  <span className="font-medium">{formatDate(project.detailsprojet.dateDuProjet)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Services</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.services.map((service) => (
                      <span key={service.slug} className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {service.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{project.detailsprojet.description}</ReactMarkdown>
              </div>

              {project.detailsprojet.lienExterne && (
                <a
                  href={project.detailsprojet.lienExterne}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Voir le projet <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <ProjectModalSkeleton />
      )}
    </Modal>
  )
}

