// --- START OF FILE project-gallery.tsx (MODIFIED) ---

"use client"

import { useState, useEffect, useRef } from "react"
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

// Structure attendue pour les données des projets
interface ProjectsData {
  projects: Project[];
  fillers?: FillerItem[];
}

// Définir les données des projets codées en dur (utilisées comme fallback)
const hardcodedProjectsData: ProjectsData = { // Type explicite pour la cohérence
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
        "Pour accompagner son lancement, nous avons conçu une identité visuelle douce et apaisante, mêlant des teintes chaudes inspirées de la peau à des éléments graphiques délicats, pour créer un univers propice au bien-être. Le logo, en forme de papillon, fait écho à la triple présence de la lettre “a” dans le nom du salon et symbolise la métamorphose, la beauté et l’élégance.",
        "Grâce à cette direction artistique, Le Boudoir Miadana affirme aujourd’hui une image forte et différenciante, capable de séduire une clientèle en quête d’une expérience esthétique singulière."
      ],
      link: "https://ellipse-real-estate.com/", // Mettez à jour ce lien si nécessaire
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
        "Notre agence de communication digitale DOLCE est inspirée par la beauté ensoleillée de la Méditerranée, l’élégance intemporelle de la French Riviera des années 60 et l’art de vivre de la Dolce Vita",
        "Pour incarner cet univers, nous avons imaginé une identité visuelle raffinée et contemporaine. Le logo, à la typographie sérifée, évoque la sophistication, tandis que le travail graphique autour de la lettre “O” crée une dualité visuelle subtile. Les vagues tracées au pinceau ajoutent une dimension artistique, en lien avec l’inspiration marine.",
        "La palette de couleurs mêle un bleu profond, un jaune solaire et un beige sableux, pour retranscrire toute la chaleur, la douceur et l’élégance propre à l’esprit DOLCE."
      ],
      link: "https://example.com/social-media", // Mettez à jour ce lien si nécessaire
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
  const [allItems, setAllItems] = useState<(Project | FillerItem)[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadProjectsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/data/projects.json', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const fetchedProjectsData: ProjectsData = await response.json();
        
        if (!fetchedProjectsData.projects || !Array.isArray(fetchedProjectsData.projects)) {
          throw new Error('Format de données invalide: projects manquant ou invalide');
        }
        
        const projectsFromJson = fetchedProjectsData.projects;
        const fillersFromJson = fetchedProjectsData.fillers || []; 
        
        const interleavedItems = interleaveItems(
          projectsFromJson,
          fillersFromJson
        );
        
        setAllItems(interleavedItems);
        
      } catch (err) {
        console.error('Erreur lors du chargement des projets:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue lors du chargement';
        setError(errorMessage);
        
        console.warn("Utilisation des données de secours (hardcodées) car le chargement du JSON a échoué.");
        const fallbackFillers = hardcodedProjectsData.fillers || [];
        const fallbackInterleavedItems = interleaveItems(
          hardcodedProjectsData.projects,
          fallbackFillers
        );
        setAllItems(fallbackInterleavedItems);
        
      } finally {
        setLoading(false);
      }
    };

    loadProjectsData();
  }, []);

  const interleaveItems = (projects: Project[], fillers: FillerItem[]): (Project | FillerItem)[] => {
    const total = projects.length + fillers.length;
    const result: (Project | FillerItem)[] = [];
    
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
  
  const calculateFillerPositions = (projectCount: number, fillerCount: number): number[] => {
    const positions: number[] = [];
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
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
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
      {/* Fond fixe - fonctionne sur tous les appareils */}
      <div className="fixed inset-0 -z-10">
        {/* Image de fond */}
        <Image
          src="/images/gallery-background.jpg"
          alt=""
          fill
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
          style={{
            // Pour éviter un zoom excessif, vous pouvez ajuster le scale
            transform: 'scale(1)' // Changez à scale(0.9) si l'image est trop zoomée
          }}
          priority
        />
        
        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        
        {/* Effet de grain subtil */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            filter: 'contrast(200%) brightness(100%)'
          }}
        />
        
        {/* Gradient pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 relative z-10">
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
          <div className="masonry-grid">
            {allItems.map((item) => {
              // Rendu pour les Fillers
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
              
              // Rendu pour les Projets
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
                  <div className="card-container bg-white/95 backdrop-blur-sm rounded-sm shadow-xl hover:bg-white transition-all duration-300">
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
          </div>
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
// --- END OF FILE project-gallery.tsx (MODIFIED) ---