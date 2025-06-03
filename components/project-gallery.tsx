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

// Définir les données des projets
const projectsData = {
  projects: [
    {
      id: "1",
      title: "Le Boudoir Miadana",
      mainVisual: "/images/projects/Le Boudoir de Miadana/le-boudoir-miadana-main.jpg",
      additionalVisuals: [
        "/images/projects/Le Boudoir de Miadana/le-boudoir-miadana-gallery-1.jpg",
        "/images/projects/Le Boudoir de Miadana/le-boudoir-miadana-gallery-2.jpg",
        "/images/projects/Le Boudoir de Miadana/le-boudoir-miadana-gallery-3.jpg",
        "/images/projects/Le Boudoir de Miadana/le-boudoir-miadana-gallery-4.jpg",
        "/images/projects/Le Boudoir de Miadana/le-boudoir-miadana-gallery-5.jpg",
      ],
      description: [

        "Situé à Toulon, Le Boudoir Miadana est un salon de beauté du regard spécialisé dans les extensions de cils, offrant une expérience chaleureuse et sensorielle.",
        "Pour accompagner son lancement, nous avons conçu une identité visuelle douce et apaisante, mêlant des teintes chaudes inspirées de la peau à des éléments graphiques délicats, pour créer un univers propice au bien-être. Le logo, en forme de papillon, fait écho à la triple présence de la lettre “a” dans le nom du salon et symbolise la métamorphose, la beauté et l’élégance.",
        "Grâce à cette direction artistique, Le Boudoir Miadana affirme aujourd’hui une image forte et différenciante, capable de séduire une clientèle en quête d’une expérience esthétique singulière."
      ],
      link: "https://ellipse-real-estate.com/",
    },
    {
      id: "2",
      title: "Ellipse Real Estate",
      mainVisual: "/images/projects/ellipse-real-estate-main.jpg",
      additionalVisuals: [
        "/images/projects/ellipse-real-estate-gallery-1.jpg",
        "/images/projects/ellipse-real-estate-gallery-2.jpg",
        "/images/projects/web-design-3.jpg",
      ],
      description: [
        "ELLIPSE REAL ESTATE est un groupe immobilier spécialisé dans les biens d'exception, basé à Nice, dans le sud de la France.",
        "Dans le cadre de leur volonté d'expansion et de l'ouverture d'une seconde agence en Grèce, sur l'île de Zakynthos, leur souhait était de moderniser leur identité visuelle ainsi que leur présence digitale.",
        "Nous avons dans un premier temps imaginé un nouveau logo, élégant et intemporel, reflètant la prestance, le luxe et l'esprit grec. Nous avons également réalisé une refonte complète de leur site internet."
      ],
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
      description: "A comprehensive digital marketing campaign that increased brand awareness by 65% and generated a 3x return on ad spend.",
      link: "https://example.com/digital-marketing",
    },
    {
      id: "4",
      title: "Dolce",
      mainVisual: "/images/projects/dolce-main.jpg",
      additionalVisuals: [
        "/images/projects/dolce-gallery-1.jpg",
        "/images/projects/dolce-gallery-2.jpg",
        "/images/projects/dolce-gallery-3.jpg",
        "/images/projects/dolce-gallery-4.jpg",
      ],
      description: [
        "Notre première mission a bien entendu été celle de développer notre propre identité visuelle.",
        "DOLCE puise son inspiration de la beauté de la Méditerranée, de l'élégance de la French Riviera des années 60 et de la Dolce Vita.",
        "Notre souhait était donc d'avoir une identité visuelle qui retranscrirait cette inspiration avec une touche de modernité.",
        "Le logo inspire l’élégance, la typographie dotée de sérifs confére une touche de sophistication et de finesse.",
        "Le jeu graphique réalisé avec la lettre ‘o’. crée une dualité visuelle captivante. Les éléments graphiques reprennent la forme de vagues, tracées au pinceau pour induire la dimension artistique."
      ],
      link: "https://example.com/social-media",
    },
    {
      id: "5",
      title: "Ilios Immobilier",
      mainVisual: "/images/projects/ilios-immobilier-main.jpg",
      additionalVisuals: [
        "/images/projects/ilios-immobilier-gallery-1.jpg",
        "/images/projects/ilios-immobilier-gallery-2.jpg",
        "/images/projects/ilios-immobilier-gallery-3.jpg",
        "/images/projects/ilios-immobilier-gallery-4.jpg",
        "/images/projects/ilios-immobilier-gallery-5.jpg",
      ],
      description: [
        "Souhaitant développer une application à destination des chauffeurs privés, le fondateur de Pick Up nous à contacté pour la création de son identité visuelle.",
        "Nous avons conçu un logotype moderne et dynamique, reflétant la nature technologique et innovante de l'application.",
        "L'identité visuelle s'accompagne d'un système graphique cohérent qui a été décliné sur l'ensemble des supports de communication."
      ],
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
      description: [
        "Souhaitant développer une application à destination des chauffeurs privés, le fondateur de Pick Up nous à contacté pour la création de son identité visuelle.",
        "Notre client souhaitait se différencier par une identité forte, moderne, inspirant la confiance et la sérénité et rappelant la nature.",
        "La typographie futuriste et inspirée de la technologie, offre au logo un style minimaliste.",
        "L’élément graphique représentant l’icône de localisation se dévoile subtilement grâce au motif de remplissage inspiré des reliefs cartographiques des routes.",
        "Le choix des couleurs en camaïeu de verts inspire la sérénité et rappelle la nature."
      ],
      link: "https://example.com/content",
    },
  ],
  
  // Fillers mise à jour (sans textContent)
  fillers: [
    {
      id: "filler_1",
      backgroundImage: "/images/fillers/filler_1_bg.jpg",
      textImage: "/images/fillers/filler_1_text.png", 
      aspectRatio: "4/3",
      isFiller: true
    },
    {
      id: "filler_2",
      backgroundImage: "/images/fillers/filler_2_bg.jpg",
      textImage: "/images/fillers/filler_2_text.png",
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
};

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
