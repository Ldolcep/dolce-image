"use client"

import { useState, useEffect } from "react"
import { getProjects } from "@/utils/dataService"
import MasonryGrid from "./MasonryGrid"
import ProjectCard from "./ProjectCard"
import ProjectModal from "./ProjectModal"
import ProjectCardSkeleton from "./ProjectCardSkeleton"
import type { Project } from "@/types/project"

export default function ProjectsGallery() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const limit = 6

  // Charger les projets initiaux
  useEffect(() => {
    const loadInitialProjects = async () => {
      try {
        setIsLoading(true)
        const response = await getProjects({ limit, offset: 0 })
        setProjects(response.projets.nodes)
        setHasMore(response.pagination.hasMore)
        setOffset(limit)
      } catch (error) {
        console.error("Erreur lors du chargement des projets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialProjects()
  }, [])

  // Charger plus de projets
  const loadMoreProjects = async () => {
    if (isLoading || !hasMore) return

    try {
      setIsLoading(true)
      const response = await getProjects({ limit, offset })
      setProjects((prev) => [...prev, ...response.projets.nodes])
      setHasMore(response.pagination.hasMore)
      setOffset((prev) => prev + limit)
    } catch (error) {
      console.error("Erreur lors du chargement de projets supplémentaires:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Ouvrir le modal avec le projet sélectionné
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  // Fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-background">
      <h2 className="text-4xl md:text-5xl font-serif text-center mb-16">Nos Projets</h2>

      <MasonryGrid>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} onClick={handleProjectClick} />
        ))}

        {isLoading && (
          <>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </>
        )}
      </MasonryGrid>

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            onClick={loadMoreProjects}
            disabled={isLoading}
            className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Chargement..." : "Voir plus de projets"}
          </button>
        </div>
      )}

      <ProjectModal isOpen={isModalOpen} onClose={handleCloseModal} project={selectedProject} />
    </section>
  )
}

