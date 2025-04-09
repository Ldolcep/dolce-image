"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProjectModal from "./project-modal"

// Define the project data directly in the component to avoid fetch issues
const projectsData = {
  projects: [
    {
      id: "1",
      title: "Brand Identity",
      mainVisual: "/images/projects/project-1-main.jpg",
      additionalVisuals: [
        "/images/projects/brand-identity-1.jpg",
        "/images/projects/brand-identity-2.jpg",
        "/images/projects/brand-identity-3.jpg",
      ],
      description:
        "A complete brand identity redesign for a luxury fashion brand, focusing on elegance and minimalism while maintaining brand recognition.",
      link: "https://example.com/brand-identity",
    },
    {
      id: "2",
      title: "Web Design",
      mainVisual: "/images/projects/project-2-main.jpg",
      additionalVisuals: [
        "/images/projects/web-design-1.jpg",
        "/images/projects/web-design-2.jpg",
        "/images/projects/web-design-3.jpg",
      ],
      description:
        "A responsive e-commerce website with a focus on user experience and conversion optimization, resulting in a 40% increase in sales.",
      link: "https://example.com/web-design",
    },
    {
      id: "3",
      title: "Digital Marketing",
      mainVisual: "/images/projects/project-3-main.jpg",
      additionalVisuals: [
        "/images/projects/digital-marketing-1.jpg",
        "/images/projects/digital-marketing-2.jpg",
        "/images/projects/digital-marketing-3.jpg",
      ],
      description:
        "A comprehensive digital marketing campaign that increased brand awareness by 65% and generated a 3x return on ad spend.",
      link: "https://example.com/digital-marketing",
    },
    {
      id: "4",
      title: "Social Media",
      mainVisual: "/images/projects/project-4-main.jpg",
      additionalVisuals: [
        "/images/projects/social-media-1.jpg",
        "/images/projects/social-media-2.jpg",
        "/images/projects/social-media-3.jpg",
      ],
      description:
        "A social media strategy that increased engagement by 78% and followers by 45% across all platforms within 3 months.",
      link: "https://example.com/social-media",
    },
    {
      id: "5",
      title: "UI/UX Design",
      mainVisual: "/images/projects/project-5-main.jpg",
      additionalVisuals: [
        "/images/projects/ui-ux-1.jpg",
        "/images/projects/ui-ux-2.jpg",
        "/images/projects/ui-ux-3.jpg",
      ],
      description:
        "A complete user interface and experience redesign for a mobile app, resulting in a 60% increase in user retention.",
      link: "https://example.com/ui-ux",
    },
    {
      id: "6",
      title: "Content Creation",
      mainVisual: "/images/projects/content-main.jpg",
      additionalVisuals: [
        "/images/projects/content-1.jpg",
        "/images/projects/content-2.jpg",
        "/images/projects/content-3.jpg",
      ],
      description:
        "A content strategy and creation service that increased organic traffic by 85% and conversions by 35% within 6 months.",
      link: "https://example.com/content",
    },
  ],
}

interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string
  link: string
}

export default function ProjectGallery() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Use the hardcoded data instead of fetching
    setProjects(projectsData.projects)
  }, [])

  const openModal = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = "auto"
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen])

  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="font-great-vibes text-4xl md:text-5xl mb-16 text-center">Our Projects</h2>

        {/* Masonry Grid Layout */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="break-inside-avoid mb-6"
              onClick={() => openModal(project)}
              onKeyDown={(e) => e.key === "Enter" && openModal(project)}
              tabIndex={0}
              role="button"
              aria-label={`View ${project.title} project details`}
            >
              <div className="project-card group cursor-pointer transition duration-300 ease-in-out">
                <div className="relative project-card-image rounded-md overflow-hidden">
                  <div className="w-full aspect-[4/3] md:aspect-auto md:h-auto relative">
                    <Image
                      src={project.mainVisual || "/placeholder.svg"}
                      alt={project.title}
                      fill
                      className="object-cover transition duration-300 ease-in-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
                  </div>
                </div>
                <h3 className="project-card-title font-medium text-lg mt-3 mb-1">{project.title}</h3>
                <p className="font-poppins text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={closeModal} />}
    </section>
  )
}