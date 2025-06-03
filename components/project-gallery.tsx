"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import ProjectModal from "./ProjectModal" 
import FillerCard from "./filler-card"

// Définir les types de base
interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string | string[]
  link: string
}

// Interface pour les fillers
interface FillerItem {
  id: string
  backgroundImage: string
  textImage: string
  aspectRatio?: string
  isFiller: boolean
}

// Interface pour les données du JSON
interface ProjectsData {
  projects: Project[]
  fillers: FillerItem[]
}

export default function ProjectGallery() {
  const [allItems, setAllItems] = useState<(Project | FillerItem)[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Charger les données depuis public/data/projects.json
    const loadProjectsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/data/projects.json', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
        }
        
        const projectsData: ProjectsData = await response.json()
        
        // Valider la structure des données
        if (!projectsData.projects || !Array.isArray(projectsData.projects)) {
          throw new Error('Format de données invalide: projects manquant ou invalide')
        }
        
        // Utiliser les fillers du JSON ou un tableau vide par défaut
        const fillers = projectsData.fillers || []
        
        const interleavedItems = interleaveItems(
          projectsData.projects, 
          fillers
        )
        
        setAllItems(interleavedItems)
        
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err)
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement'
        setError(errorMessage)
        
        // En cas d'erreur, utiliser des données par défaut pour éviter un écran blanc
        setAllItems([])
        
      } finally {
        setLoading(false)
      }
    }

    loadProjectsData()
  }, [])

  // Logique d'entrelacement (inchangée)
  const interleaveItems = (projects: Project[], fillers: FillerItem[]) => {
    const total = projects.length + fillers.length
    const result: (Project | FillerItem)[] = []
    
    const fillerPositions = calculateFillerPositions(projects.length, fillers.length)
    
    let fillerIndex = 0
    let projectIndex = 0
    
    for (let i = 0; i < total; i++) {
      if (fillerPositions.includes(i) && fillerIndex < fillers.length) {
        result.push(fillers[fillerIndex])
        fillerIndex++
      } else if (projectIndex < projects.length) {
        result.push(projects[projectIndex])
        projectIndex++
      }
    }

    // Gestion des éléments restants
    while (projectIndex < projects.length) {
      result.push(projects[projectIndex])
      projectIndex++
    }
    while (fillerIndex < fillers.length) {
      result.push(fillers[fillerIndex])
      fillerIndex++
    }

    return result
  }
  
  // Fonction pour calculer les positions (inchangée)
  const calculateFillerPositions = (projectCount: number, fillerCount: number): number[] => {
    const positions: number[] = []
    if (fillerCount <= 0) return positions

    const spacing = Math.ceil(projectCount / (fillerCount + 1))
    
    for (let i = 0; i < fillerCount; i++) {
      const position = (i + 1) * spacing
      if (position <= projectCount + fillerCount) { 
        positions.push(position)
      }
    }
    
    return positions
  }

  const openModal = (project: Project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
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

        {/* État de chargement */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            <p className="mt-4 text-gray-600 font-poppins">Chargement des projets...</p>
          </div>
        )}

        {/* État d'erreur */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <p className="text-red-600 font-poppins mb-4">Erreur: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Grille masonry */}
        {!loading && !error && allItems.length > 0 && (
          <div className="masonry-grid">
            {allItems.map((item) => {
              // Rendu pour les Fillers (visibles uniquement sur tablette et desktop)
              if ('isFiller' in item) {
                const filler = item as FillerItem
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
                )
              }
              
              // Rendu pour les Projets (structure originale conservée)
              const project = item as Project
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
              )
            })}
          </div>
        )}

        {/* Message si aucun projet */}
        {!loading && !error && allItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 font-poppins">Aucun projet disponible pour le moment.</p>
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
