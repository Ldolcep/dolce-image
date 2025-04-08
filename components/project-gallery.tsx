"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import ProjectModal from "./project-modal"

// Define the project data directly in the component to avoid fetch issues
const projectsData = {
  projects: [
    {
      id: "1",
      title: "Brand Identity",
      mainVisual: "/images/projects/brand-identity-main.jpg",
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
      mainVisual: "/images/projects/web-design-main.jpg",
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
      mainVisual: "/images/projects/digital-marketing-main.jpg",
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
      mainVisual: "/images/projects/social-media-main.jpg",
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
      mainVisual: "/images/projects/ui-ux-main.jpg",
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
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

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

  // Handle horizontal scrolling with mouse wheel
  useEffect(() => {
    const gallery = galleryRef.current

    const handleWheel = (e: WheelEvent) => {
      if (gallery) {
        e.preventDefault()
        gallery.scrollLeft += e.deltaY
      }
    }

    if (gallery) {
      gallery.addEventListener("wheel", handleWheel)

      return () => {
        gallery.removeEventListener("wheel", handleWheel)
      }
    }
  }, [])

  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="font-koolegant text-3xl md:text-4xl mb-12 text-center">Our Projects</h2>

        {/* Horizontal scrolling gallery with overlapping cards */}
        <div
          ref={galleryRef}
          className="horizontal-scroll flex overflow-x-auto pb-8 -mx-4 px-4 snap-x snap-mandatory"
          tabIndex={0}
          aria-label="Project gallery, scroll horizontally to view more projects"
        >
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="project-card snap-center"
              style={{
                marginLeft: index === 0 ? "0" : "-40px",
                zIndex: hoveredId === project.id ? 10 : projects.length - index,
                opacity: hoveredId && hoveredId !== project.id ? 0.7 : 1,
                transform: hoveredId === project.id ? "scale(1.05)" : "scale(1)",
              }}
              onClick={() => openModal(project)}
              onKeyDown={(e) => e.key === "Enter" && openModal(project)}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              tabIndex={0}
              role="button"
              aria-label={`View ${project.title} project details`}
            >
              <div className="relative project-card-image">
                <Image
                  src={project.mainVisual || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="project-card-title">{project.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={closeModal} />}
    </section>
  )
}
