// project-gallery.tsx - Version mise à jour avec préchargement anti-flash

"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Masonry from 'react-masonry-css'
import ProjectModal from "./ProjectModal" 
import FillerCard from "./filler-card"
import { usePreloadModal } from "@/hooks/use-preload-modal"

// [Les interfaces restent identiques...]
interface Project {
  id: string
  title: string
  mainVisual: string
  additionalVisuals: string[]
  description: string | string[]
  link: string
}

interface FillerItem {
  id: string
  backgroundImage: string
  textImage: string
  aspectRatio?: string
  isFiller: boolean
}

interface ProjectsData {
  projects: Project[];
  fillers?: FillerItem[];
}

// [hardcodedProjectsData reste identique...]
const hardcodedProjectsData: ProjectsData = {
  projects: [
    // ... même contenu qu'avant
  ],
  fillers: [
    // ... même contenu qu'avant
  ]
};

// [prepareStrategicItems reste identique...]
const prepareStrategicItems = (
  projects: Project[], 
  fillers: FillerItem[], 
  numColumns: number
): (Project | FillerItem)[] => {
  // ... même implémentation qu'avant
};

const breakpointColumns = {
  default: 3,
  1024: 3,
  768: 2,
  640: 1
};

export default function ProjectGallery() {
  const [allItems, setAllItems] = useState<(Project | FillerItem)[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreloadingModal, setIsPreloadingModal] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  const { preloadProjectAssets, isProjectPreloaded } = usePreloadModal();

  // Précharger l'image de fond du modal au chargement de la page
  useEffect(() => {
    const img = new Image();
    img.src = '/images/gallery-background.jpg';
  }, []);

  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/data/projects.json', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const fetchedProjectsData: ProjectsData = await response.json();
        
        if (!fetchedProjectsData.projects || !Array.isArray(fetchedProjectsData.projects)) {
          throw new Error('Format de données invalide: projects manquant ou invalide');
        }
        
        const projects = fetchedProjectsData.projects;
        const fillers = fetchedProjectsData.fillers || [];
        
        const preparedItems = prepareStrategicItems(
          projects, 
          fillers, 
          breakpointColumns.default
        );
        setAllItems(preparedItems);
         
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement';
        setError(errorMessage);
        
        console.warn("Utilisation des données de secours (hardcodées).");
        
        const projects = hardcodedProjectsData.projects;
        const fillers = hardcodedProjectsData.fillers || [];
        
        const preparedItems = prepareStrategicItems(
          projects, 
          fillers, 
          breakpointColumns.default
        );
        setAllItems(preparedItems);
      } finally {
        setLoading(false);     
      }
    };

    loadProjectsData();
  }, []);
  
  // Nouvelle fonction d'ouverture avec préchargement
  const openModal = async (project: Project) => {
    // Si déjà préchargé, ouvrir immédiatement
    if (isProjectPreloaded(project.id)) {
      setSelectedProject(project);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
      return;
    }

    // Sinon, précharger d'abord
    setIsPreloadingModal(true);
    
    try {
      await preloadProjectAssets(project);
      
      // Petit délai pour garantir que le rendu est prêt
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setSelectedProject(project);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
      // Ouvrir quand même en cas d'erreur
      setSelectedProject(project);
      setIsModalOpen(true);
      document.body.style.overflow = "hidden";
    } finally {
      setIsPreloadingModal(false);
    }
  };

  // Préchargement au survol (desktop uniquement)
  const handleProjectHover = (project: Project) => {
    if (!isProjectPreloaded(project.id)) {
      preloadProjectAssets(project).catch(() => {});
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <section ref={sectionRef} id="projects" className="relative py-16 md:py-24 min-h-screen">
      
      {/* Fond fixe CSS pur */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/gallery-background.jpg"
          alt=""
          fill
          quality={90}
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container mx-auto px-4 relative">
        <h2 className="font-koolegant text-4xl md:text-5xl mb-16 text-center text-white drop-shadow-lg">
          Our Projects
        </h2>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            <p className="mt-4 text-white font-cocogoose drop-shadow">Chargement des projets...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <p className="text-red-400 font-cocogoose mb-4 drop-shadow">Erreur: {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {!loading && !error && allItems.length > 0 && (
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid-js"
            columnClassName="masonry-column"
          >
            {allItems.map((item) => {
              // Rendu pour les Fillers
              if ('isFiller' in item) {
                const filler = item as FillerItem;
                return (
                  <div key={`filler-${filler.id}`} className="hidden md:block">
                    <FillerCard
                      id={filler.id}
                      backgroundImage={filler.backgroundImage}
                      textImage={filler.textImage}
                      aspectRatio={filler.aspectRatio}
                    />
                  </div>
                );
              }
              
              // Rendu pour les Projets
              const project = item as Project;
              return (
                <div
                  key={project.id}
                  onClick={() => openModal(project)}
                  onMouseEnter={() => handleProjectHover(project)}
                  onKeyDown={(e) => e.key === "Enter" && openModal(project)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${project.title} project details`}
                  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 rounded-lg"
                >
                  <div className="card-container bg-white/100 backdrop-blur-sm">
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
                      <h3 className="project-title font-koolegant">{project.title}</h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </Masonry>
        )}

        {/* Empty state */}
        {!loading && !error && allItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white drop-shadow">Aucun projet disponible pour le moment.</p>
          </div>
        )}
      </div>

      {/* Indicateur de préchargement */}
      {isPreloadingModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange" />
        </div>
      )}

      {/* Modal */}
      {isModalOpen && selectedProject && (
         <ProjectModal 
             project={selectedProject} 
             isOpen={isModalOpen} 
             onClose={closeModal} 
         />
      )}
    </section>
  );
}
