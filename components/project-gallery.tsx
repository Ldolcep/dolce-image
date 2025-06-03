"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProjectModal from "./ProjectModal" 
import FillerCard from "./filler-card"
// Import centralisé des données
import projectsData from '@/data/projects.json'

// Définir les types de base
interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string | string[]
  link: string
}

// Interface pour les fillers (sans textContent)
interface FillerItem {
  id: string
  backgroundImage: string
  textImage: string
  aspectRatio?: string
  isFiller: boolean
}

export default function ProjectGallery() {
  const [allItems, setAllItems] = useState<(Project | FillerItem)[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Utiliser les données importées depuis le JSON
    const interleavedItems = interleaveItems(
      projectsData.projects, 
      projectsData.fillers as FillerItem[]
    );
    setAllItems(interleavedItems);
  }, []);

  // Logique d'entrelacement (inchangée)
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

    // Gestion des éléments restants
    while (projectIndex < projects.length) {
        result.push(projects[projectIndex]);
        projectIndex++;
    }
    while (fillerIndex < fillers.length) {
        result.push(fillers[fillerIndex]);
        fillerIndex++;
    }

    return result;
  };
  
  // Fonction pour calculer les positions (inchangée)
  const calculateFillerPositions = (projectCount: number, fillerCount: number) => {
    const positions = [];
    if (fillerCount <= 0) return positions; 

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
    setSelectedProject(null); 
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

        {/* États de chargement et d'erreur */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            <p className="mt-4 text-gray-600">Chargement des projets...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Erreur: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 btn-primary"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Grille masonry */}
        {!loading && !error && (
          <div className="masonry-grid">
          {allItems.map((item) => {
            // Rendu pour les Fillers (visibles uniquement sur tablette et desktop)
            if ('isFiller' in item) {
              const filler = item as FillerItem;
              return (
                <div 
                  key={`filler-${filler.id}`} 
                  className="masonry-item hidden md:block"
                > 
                  <FillerCard
                    id={filler.id}
                    backgroundImage={filler.backgroundImage}
                    textImage={filler.textImage}
                    aspectRatio={filler.aspectRatio}
                  />
                </div>
              );
            }
            
            // Rendu pour les Projets (structure originale conservée)
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
        )}
      </div>

      {/* Project Modal */}
      {isModalOpen && selectedProject && (
         <ProjectModal 
             project={selectedProject} 
             isOpen={isModalOpen} 
             onClose={closeModal} 
         />
      )}
    </section>
  )
}
