// project-gallery.tsx - Version corrigée avec gestion sécurisée du DOM

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import Masonry from 'react-masonry-css'
import dynamic from "next/dynamic"
import FillerCard from "./filler-card"

// Interfaces
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

// Fonction utilitaire pour manipuler le body de manière sécurisée
const setBodyOverflow = (value: 'hidden' | 'auto') => {
  if (typeof window !== 'undefined' && document.body) {
    document.body.style.overflow = value;
  }
};

// Données hardcodées
const hardcodedProjectsData: ProjectsData = {
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
      ],
      description: [
        "Situé à Toulon, Le Boudoir Miadana est un salon de beauté du regard spécialisé dans les extensions de cils, offrant une expérience chaleureuse et sensorielle.",
        "Pour accompagner son lancement, nous avons conçu une identité visuelle douce et apaisante, mêlant des teintes chaudes inspirées de la peau à des éléments graphiques délicats, pour créer un univers propice au bien-être. Le logo, en forme de papillon, fait écho à la triple présence de la lettre 'a' dans le nom du salon et symbolise la métamorphose, la beauté et l'élégance.",
        "Grâce à cette direction artistique, Le Boudoir Miadana affirme aujourd'hui une image forte et différenciante, capable de séduire une clientèle en quête d'une expérience esthétique singulière."
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
      mainVisual: "/images/projects/Dolce/dolce-main.jpg",
      additionalVisuals: [
        "/images/projects/Dolce/dolce-gallery-2.jpg",
        "/images/projects/Dolce/dolce-gallery-3.jpg",
        "/images/projects/Dolce/dolce-gallery-4.jpg",
        "/images/projects/Dolce/dolce-gallery-5.jpg",
        "/images/projects/Dolce/dolce-gallery-6.jpg",
        "/images/projects/Dolce/dolce-gallery-7.jpg"
      ],
      description: [ 
        "Notre agence de communication digitale DOLCE est inspirée par la beauté ensoleillée de la Méditerranée, l'élégance intemporelle de la French Riviera des années 60 et l'art de vivre de la Dolce Vita",
        "Pour incarner cet univers, nous avons imaginé une identité visuelle raffinée et contemporaine. Le logo, à la typographie sérifée, évoque la sophistication, tandis que le travail graphique autour de la lettre 'O' crée une dualité visuelle subtile. Les vagues tracées au pinceau ajoutent une dimension artistique, en lien avec l'inspiration marine.",
        "La palette de couleurs mêle un bleu profond, un jaune solaire et un beige sableux, pour retranscrire toute la chaleur, la douceur et l'élégance propre à l'esprit DOLCE."
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
        "Nous avons conçu un logotype moderne et dynamique, reflètant la nature technologique et innovante de l'application.",
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
        "L'élément graphique représentant l'icône de localisation se dévoile subtilement grâce au motif de remplissage inspiré des reliefs cartographiques des routes.",
        "Le choix des couleurs en camaïeu de verts inspire la sérénité et rappelle la nature."
      ],
      link: "https://example.com/content",
    },
  ],
  fillers: [
    { id: "filler_1", backgroundImage: "/images/fillers/filler_1_bg.jpg", textImage: "/images/fillers/filler_1_text.png", aspectRatio: "4/3", isFiller: true },
    { id: "filler_2", backgroundImage: "/images/fillers/filler_2_bg.jpg", textImage: "/images/fillers/filler_2_text.png", aspectRatio: "4/3", isFiller: true },
    { id: "filler_3", backgroundImage: "/images/fillers/filler_3_bg.jpg", textImage: "/images/fillers/filler_3_text.png", aspectRatio: "4/3", isFiller: true },
  ]
};

const prepareStrategicItems = (
  projects: Project[], 
  fillers: FillerItem[], 
  numColumns: number
): (Project | FillerItem)[] => {
  if (fillers.length === 0 || projects.length === 0) {
    return projects;
  }

  const useableFillers = fillers.slice(0, numColumns);
  const numFillers = useableFillers.length;
  const numProjects = projects.length;
  const result: (Project | FillerItem)[] = [];

  const numGroups = numFillers + 1;
  const projectsPerGroup = Math.ceil(numProjects / numGroups);

  let projectIndex = 0;

  for (let i = 0; i < numFillers; i++) {
    const group = projects.slice(projectIndex, projectIndex + projectsPerGroup);
    result.push(...group);
    projectIndex += projectsPerGroup;
    result.push(useableFillers[i]);
  }

  const remainingProjects = projects.slice(projectIndex);
  result.push(...remainingProjects);

  return result;
};

const breakpointColumns = {
  default: 3,
  1024: 3,
  768: 2,
  640: 1
};

const ProjectModal = dynamic(() => import("./ProjectModal"), { ssr: false })

export default function ProjectGallery() {
  const [allItems, setAllItems] = useState<(Project | FillerItem)[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preloadedProjects, setPreloadedProjects] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);

  // S'assurer que le composant est monté
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Fonction de préchargement intégrée
  const preloadProjectAssets = useCallback(async (project: Project) => {
    if (preloadedProjects.has(project.id)) {
      return Promise.resolve();
    }

    try {
      const criticalAssets = [
        '/images/gallery-background.jpg',
        project.mainVisual
      ];

      await Promise.all(
        criticalAssets.map(src => {
          return new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => {
              console.warn(`Failed to preload: ${src}`);
              resolve();
            };
            img.src = src;
          });
        })
      );

      setPreloadedProjects(prev => new Set(prev).add(project.id));

      // Précharger les images additionnelles en arrière-plan
      if (project.additionalVisuals?.length > 0) {
        Promise.all(
          project.additionalVisuals.map(src => {
            return new Promise<void>((resolve) => {
              const img = new window.Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = src;
            });
          })
        ).catch(() => {});
      }
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
    }
  }, [preloadedProjects]);

  // Précharger l'image de fond au chargement
  useEffect(() => {
    if (isMounted) {
      const img = new window.Image();
      img.src = '/images/gallery-background.jpg';
    }
  }, [isMounted]);

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

    if (isMounted) {
      loadProjectsData();
    }
  }, [isMounted]);
  
  const openModal = useCallback(async (project: Project) => {
    if (!isMounted) return;

    // Si déjà préchargé, ouvrir immédiatement
    if (preloadedProjects.has(project.id)) {
      setSelectedProject(project);
      setIsModalOpen(true);
      setBodyOverflow('hidden');
      return;
    }

    // Sinon, précharger d'abord
    try {
      await preloadProjectAssets(project);
      
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
      if (isMounted) {
        requestAnimationFrame(() => {
          if (isMounted) {
            setSelectedProject(project);
            setIsModalOpen(true);
            setBodyOverflow('hidden');
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors du préchargement:', error);
      // Ouvrir quand même en cas d'erreur
      if (isMounted) {
        setSelectedProject(project);
        setIsModalOpen(true);
        setBodyOverflow('hidden');
      }
    }
  }, [isMounted, preloadedProjects, preloadProjectAssets]);

  // Préchargement au survol
  const handleProjectHover = useCallback((project: Project) => {
    if (!preloadedProjects.has(project.id) && isMounted) {
      preloadProjectAssets(project).catch(() => {});
    }
  }, [preloadedProjects, isMounted, preloadProjectAssets]);

  const closeModal = useCallback(() => {
    if (!isMounted) return;
    
    setIsModalOpen(false);
    setSelectedProject(null);
    setBodyOverflow('auto');
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isMounted, closeModal]);

  // Nettoyer l'overflow au démontage
  useEffect(() => {
    return () => {
      setBodyOverflow('auto');
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <section ref={sectionRef} id="projects" className="relative py-16 md:py-24 min-h-screen">
      
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

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
            <p className="mt-4 text-white font-cocogoose drop-shadow">Chargement des projets...</p>
          </div>
        )}

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

        {!loading && !error && allItems.length > 0 && (
          <Masonry
            breakpointCols={breakpointColumns}
            className="masonry-grid-js"
            columnClassName="masonry-column"
          >
            {allItems.map((item) => {
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

        {!loading && !error && allItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white drop-shadow">Aucun projet disponible pour le moment.</p>
          </div>
        )}
      </div>

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
