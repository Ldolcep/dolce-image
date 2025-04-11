"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProjectModal from "./project-modal"
import FillerCard from "./filler-card" // Nouveau import

// Définir les types de base
interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string
  link: string
}

// Interface pour les fillers améliorés
interface FillerItem {
  id: string
  backgroundImage: string
  textImage?: string
  textContent?: string
  aspectRatio?: string
  isFiller: boolean
}

// Définir les données des projets
const projectsData = {
  projects: [
    {
      id: "1",
      title: "Le Boudoir Miadana",
      mainVisual: "/images/projects/le-boudoir-miadana-main.jpg",
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
      title: "Ellipse Real Estate",
      mainVisual: "/images/projects/ellipse-real-estate-main.jpg",
      additionalVisuals: [
        "/images/projects/web-design-1.jpg",
        "/images/projects/web-design-2.jpg",
        "/images/projects/web-design-3.jpg",
      ],
      description:
        "A responsive e-commerce website with a focus on user experience and conversion optimization, resulting in a 40% increase in sales.",
      link: "https://ellipse-real-estate.com/",
    },
    {
      id: "3",
      title: "Ellipse Groupe",
      mainVisual: "/images/projects/ellipse-groupe-main.png",
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
      title: "Dolce",
      mainVisual: "/images/projects/dolce-main.jpg",
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
      title: "Ilios Immobilier",
      mainVisual: "/images/projects/ilios-immobilier-main.jpg",
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
      title: "PickUp",
      mainVisual: "/images/projects/pickup-main.jpg",
      additionalVisuals: [
        "/images/projects/pickup-gallery-1.jpg",
        "/images/projects/pickup-gallery-2.jpg",
        "/images/projects/pickup-gallery-3.jpg",
      ],
      description:
        "A content strategy and creation service that increased organic traffic by 85% and conversions by 35% within 6 months.",
      link: "https://example.com/content",
    },
  ],
  
  // Fillers mise à jour avec de nouvelles propriétés
  fillers: [
    {
      id: "filler_1",
      backgroundImage: "/images/fillers/filler_1_bg.jpg",
      textImage: "/images/fillers/filler_1_text.png", // Image PNG avec fond transparent pour le texte
      aspectRatio: "1/1",
      isFiller: true
    },
    {
      id: "filler_2",
      backgroundImage: "/images/fillers/filler_2_bg.jpg",
      textContent: "Creative Design", // Alternative: texte direct au lieu d'une image
      aspectRatio: "3/2",
      isFiller: true
    },
    {
      id: "filler_3",
      backgroundImage: "/images/fillers/filler_3_bg.jpg",
      textImage: "/images/fillers/filler_3_text.png",
      aspectRatio: "4/3",
      isFiller: true
    },
  ]
}

export default function ProjectGallery() {
  const [allItems, setAllItems] = useState<(Project | FillerItem)[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Combiner et entrelacer les projets et les fillers
    const interleavedItems = interleaveItems(
      projectsData.projects, 
      projectsData.fillers as FillerItem[]
    );
    setAllItems(interleavedItems);
  }, []);

  // Fonction pour entrelacer les projets et les fillers harmonieusement
  const interleaveItems = (projects: Project[], fillers: FillerItem[]) => {
    const total = projects.length + fillers.length;
    const result = [];
    
    const fillerPositions = calculateFillerPositions(projects.length, fillers.length);
    
    let fillerIndex = 0;
    let projectIndex = 0;
    
    for (let i = 0; i < total; i++) {
      if (fillerPositions.includes(i) && fillerIndex < fillers.length) {
        result.push(fillers[fillerIndex]);
        fillerIndex++;
      } else if (projectIndex < projects.length) {
        result.push(projects[projectIndex]);
        projectIndex++;
      }
    }
    
    return result;
  };
  
  // Fonction pour calculer les positions optimales des fillers
  const calculateFillerPositions = (projectCount: number, fillerCount: number) => {
    const positions = [];
    const spacing = Math.ceil(projectCount / (fillerCount + 1));
    
    for (let i = 0; i < fillerCount; i++) {
      const position = (i + 1) * spacing;
      if (position <= projectCount + fillerCount) {
        positions.push(position);
      }
    }
    
    return positions;
  };

  const openModal = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = "auto"
  }

  // Gérer les événements clavier pour l'accessibilité
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

        {/* Grille masonry améliorée */}
        <div className="masonry-grid">
          {allItems.map((item) => {
            // Utiliser le composant FillerCard pour les fillers
            if ('isFiller' in item) {
              const filler = item as FillerItem;
              return (
                <FillerCard
                  key={`filler-${filler.id}`}
                  id={filler.id}
                  backgroundImage={filler.backgroundImage}
                  textImage={filler.textImage}
                  textContent={filler.textContent}
                  aspectRatio={filler.aspectRatio}
                />
              );
            }
            
            // Rendu normal pour les projets
            const project = item as Project;
            return (
              <div
                key={project.id}
                className="masonry-item"
                onClick={() => openModal(project)}
                onKeyDown={(e) => e.key === "Enter" && openModal(project)}
                tabIndex={0}
                role="button"
                aria-label={`View ${project.title} project details`}
              >
                <div className="card-container">
                  <div className="img-container">
                    <Image
                      src={project.mainVisual || "/placeholder.svg"}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="project-img"
                      priority={project.id === "1"}
                    />
                  </div>
                  <div className="project-content">
                    <h3 className="project-title font-great-vibes">{project.title}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={closeModal} />}
    </section>
  )
}