"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import ProjectModal from "./project-modal"

// Définir les types de base
interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string
  link: string
  isFiller?: boolean
  aspectRatio?: string
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
  
  // Ajouter les filler cards
  fillers: [
    {
      id: "filler-1",
      mainVisual: "/images/fillers/filler-1.jpg", // À remplacer par vos propres images
      isFiller: true,
      aspectRatio: "2/3", // Format portrait
    },
    {
      id: "filler-2",
      mainVisual: "/images/fillers/filler-2.jpg", // À remplacer par vos propres images
      isFiller: true,
      aspectRatio: "1/1", // Format carré
    },
    {
      id: "filler-3",
      mainVisual: "/images/fillers/filler-3.jpg", // À remplacer par vos propres images
      isFiller: true,
      aspectRatio: "3/2", // Format paysage
    },
  ]
}

export default function ProjectGallery() {
  const [allItems, setAllItems] = useState<(Project | any)[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fillerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Combiner et entrelacer les projets et les fillers
    const interleavedItems = interleaveItems(projectsData.projects, projectsData.fillers);
    setAllItems(interleavedItems);
    
    // Réinitialiser les refs pour les fillers
    fillerRefs.current = interleavedItems
      .filter(item => item.isFiller)
      .map(() => null);
  }, []);

  // Fonction pour entrelacer les projets et les fillers harmonieusement
  // Cette fonction assure que les fillers sont distribués de manière équilibrée
  const interleaveItems = (projects: Project[], fillers: Project[]) => {
    const total = projects.length + fillers.length;
    const result = [];
    
    // Distribuer les fillers de manière équilibrée parmi les projets
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
    // Placer un filler tous les n projets, où n est calculé pour une distribution optimale
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
  
  // Effet 3D pour les fillers au survol
  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    const fillerCard = fillerRefs.current[index];
    if (!fillerCard) return;
    
    const rect = fillerCard.getBoundingClientRect();
    const x = e.clientX - rect.left; // Position X relative à la carte
    const y = e.clientY - rect.top;  // Position Y relative à la carte
    
    // Calculer les rotations en fonction de la position
    const rotateY = ((x / rect.width) - 0.5) * 15; // -7.5° à +7.5°
    const rotateX = ((y / rect.height) - 0.5) * -15; // +7.5° à -7.5°
    
    // Appliquer la transformation avec un léger délai pour plus de fluidité
    fillerCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    fillerCard.style.zIndex = "1";
  };
  
  const handleMouseLeave = (index: number) => {
    const fillerCard = fillerRefs.current[index];
    if (!fillerCard) return;
    
    // Réinitialiser la transformation avec une transition douce
    fillerCard.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    fillerCard.style.zIndex = "0";
  };

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
          {allItems.map((item, index) => {
            // Gérer les filler cards avec effet 3D
            if (item.isFiller) {
              const fillerIndex = fillerRefs.current.findIndex(ref => ref === null);
              if (fillerIndex !== -1) fillerRefs.current[fillerIndex] = null; // Placeholder pour l'initialisation des refs
              
              return (
                <div
                  key={`filler-${item.id}`}
                  className="masonry-item"
                >
                  <div
                    ref={el => {
                      const fillerIndex = allItems.filter(i => i.isFiller).findIndex(f => f.id === item.id);
                      if (fillerIndex !== -1) fillerRefs.current[fillerIndex] = el;
                    }}
                    className="filler-card-container"
                    style={{
                      aspectRatio: item.aspectRatio || 'auto',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.2s ease-out',
                      willChange: 'transform',
                      position: 'relative'
                    }}
                    onMouseMove={(e) => {
                      const fillerIndex = allItems.filter(i => i.isFiller).findIndex(f => f.id === item.id);
                      handleMouseMove(e, fillerIndex);
                    }}
                    onMouseLeave={() => {
                      const fillerIndex = allItems.filter(i => i.isFiller).findIndex(f => f.id === item.id);
                      handleMouseLeave(fillerIndex);
                    }}
                  >
                    <div className="img-container" style={{ transform: 'translateZ(20px)' }}>
                      <Image
                        src={item.mainVisual || "/placeholder.svg"}
                        alt="Decorative design element"
                        width={600}
                        height={item.aspectRatio === '2/3' ? 900 : (item.aspectRatio === '1/1' ? 600 : 400)}
                        className="project-img"
                        style={{ transformStyle: 'preserve-3d' }}
                      />
                    </div>
                  </div>
                </div>
              )
            }
            
            // Rendu normal pour les projets
            return (
              <div
                key={item.id}
                className="masonry-item"
                onClick={() => openModal(item)}
                onKeyDown={(e) => e.key === "Enter" && openModal(item)}
                tabIndex={0}
                role="button"
                aria-label={`View ${item.title} project details`}
              >
                <div className="card-container">
                  <div className="img-container">
                    <Image
                      src={item.mainVisual || "/placeholder.svg"}
                      alt={item.title}
                      width={600}
                      height={400}
                      className="project-img"
                      priority={item.id === "1"}
                    />
                  </div>
                  <div className="project-content">
                    <h3 className="project-title font-great-vibes">{item.title}</h3>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={closeModal} />}
    </section>
  )
}