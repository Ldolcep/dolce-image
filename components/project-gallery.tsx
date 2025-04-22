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

// Interface pour les fillers (sans textContent)
interface FillerItem {
  id: string
  backgroundImage: string
  textImage: string // Requis par FillerCard
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
        "/images/projects/le-boudoir-miadana-gallery-1.jpg",
        "/images/projects/le-boudoir-miadana-gallery-2.jpg",
        "/images/projects/le-boudoir-miadana-gallery-3.jpg",
        "/images/projects/le-boudoir-miadana-gallery-4.jpg",
        "/images/projects/le-boudoir-miadana-gallery-5.jpg",
      ],
      description: "A complete brand identity redesign for a luxury fashion brand, focusing on elegance and minimalism while maintaining brand recognition.",
      link: "https://ellipse-real-estate.com/",
    },
    {
      id: "2",
      title: "Ellipse Real Estate",
      mainVisual: "/images/projects/ellipse-real-estate-main.jpg",
      additionalVisuals: [
        "/images/projects/ellipse-real-estate-gallery-1.jpg",
        "/images/projects/web-design-2.jpg",
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
      description: "A social media strategy that increased engagement by 78% and followers by 45% across all platforms within 3 months.",
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
      description: "A content strategy and creation service that increased organic traffic by 85% and conversions by 35% within 6 months.",
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

  useEffect(() => {
    // Combiner et entrelacer les projets et les fillers
    const interleavedItems = interleaveItems(
      projectsData.projects, 
      projectsData.fillers as FillerItem[] // Utilise le type FillerItem nettoyé
    );
    setAllItems(interleavedItems);
  }, []);

  // --- Logique d'entrelacement et de positionnement exacte de votre version précédente ---
  const interleaveItems = (projects: Project[], fillers: FillerItem[]) => {
    const total = projects.length + fillers.length;
    const result = [];
    
    const fillerPositions = calculateFillerPositions(projects.length, fillers.length);
    
    let fillerIndex = 0;
    let projectIndex = 0;
    
    for (let i = 0; i < total; i++) {
      // Utilise la vérification `includes` sur les positions pré-calculées
      if (fillerPositions.includes(i) && fillerIndex < fillers.length) {
        result.push(fillers[fillerIndex]);
        fillerIndex++;
      } else if (projectIndex < projects.length) {
        result.push(projects[projectIndex]);
        projectIndex++;
      }
    }

    // Gestion des éléments restants (inchangée)
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
  
  // Fonction pour calculer les positions exactes de votre version précédente
  const calculateFillerPositions = (projectCount: number, fillerCount: number) => {
    const positions = [];
    if (fillerCount <= 0) return positions; 

    // Calcul de l'espacement exact de votre version
    const spacing = Math.ceil(projectCount / (fillerCount + 1)); 
    
    for (let i = 0; i < fillerCount; i++) {
      // Calcul de la position exact de votre version
      const position = (i + 1) * spacing; 
      // Vérification exacte de votre version
      if (position <= projectCount + fillerCount) { 
        positions.push(position);
      }
      // Pas d'autre logique dans la boucle selon votre code précédent
    }
    
    // Pas de tri dans votre code précédent
    return positions; 
  };
  // --- Fin de la logique d'entrelacement exacte ---


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

        {/* Grille masonry */}
        <div className="masonry-grid">
          {allItems.map((item) => {
            // Rendu pour les Fillers (visibles uniquement sur tablette et desktop)
            if ('isFiller' in item) {
              const filler = item as FillerItem;
              return (
                <div 
                  key={`filler-${filler.id}`} 
                  className="masonry-item hidden md:block" // Caché < md, visible >= md + classe masonry
                > 
                  <FillerCard
                    id={filler.id}
                    backgroundImage={filler.backgroundImage}
                    textImage={filler.textImage} // textContent n'est plus passé
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