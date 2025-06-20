// --- START OF FILE project-gallery.tsx (MODIFIED) ---

"use client"

import { useRef, useEffect } from "react";
import Image from "next/image";
import ProjectModal from "./ProjectModal";
import FillerCard from "./filler-card";
import { useProjects, type FillerItem } from "@/hooks/useProjects";
import { useProjectModal } from "@/hooks/useProjectModal";
import { Project } from "@/types/project";
import Masonry from "react-masonry-css";
import { motion } from "framer-motion"

const breakpointCols = {
  default: 3,
  1100: 2,
  700: 1,
};

export default function ProjectGallery() {
  const { allItems, loading, error } = useProjects();
  const { selectedProject, isModalOpen, openModal, closeModal } = useProjectModal();
  const sectionRef = useRef<HTMLElement>(null);

  // UX : fermeture du modal avec la touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeModal]);

  return (
    <section ref={sectionRef} id="projects" className="relative py-16 md:py-24 min-h-screen">
      {/* Fond fixe */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/gallery-background.jpg"
          alt=""
          fill
          quality={90}
          sizes="100vw"
          className="object-cover object-center"
          style={{ transform: 'scale(1)' }}
          priority
        />
        <div className="absolute inset-0 bg-black/40 mix-blend-multiply" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            filter: 'contrast(200%) brightness(100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="font-koolegant text-4xl md:text-5xl mb-16 text-center text-white drop-shadow-lg">
          Portfolio
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
            breakpointCols={breakpointCols}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {allItems.map((item: Project | FillerItem) => {
              if ("isFiller" in item) {
                // Filler
                return (
                  <div
                    key={`filler-${item.id}`}
                    className="masonry-item hidden md:block"
                  >
                    <FillerCard
                      id={item.id}
                      backgroundImage={item.backgroundImage}
                      textImage={item.textImage}
                      aspectRatio={item.aspectRatio}
                    />
                  </div>
                );
              }
              // Project
              return (
                <motion.div
                  key={item.id}
                  className="masonry-item"
                  onClick={() => openModal(item)}
                  onKeyDown={(e) => e.key === "Enter" && openModal(item)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${item.title} project details`}
                  whileHover={{ scale: 1.03, y: -8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.3 }}
                  style={{ willChange: 'transform' }}
                >
                  <div className="card-container bg-white/95 backdrop-blur-sm rounded-sm shadow-xl hover:bg-white transition-all duration-300">
                    <div className="img-container">
                      <Image
                        src={item.mainVisual || "/placeholder.svg"}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="project-img"
                        priority={item.id === "1"}
                        style={{ transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)', willChange: 'transform' }}
                      />
                    </div>
                    <div className="project-content">
                      <h3 className="project-title font-cocogoose">{item.title}</h3>
                    </div>
                  </div>
                </motion.div>
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
// --- END OF FILE project-gallery.tsx (MODIFIED) ---