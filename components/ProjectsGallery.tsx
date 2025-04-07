"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

// Types pour nos projets
interface Project {
  title: string
  description: string
  imageUrl: string
  longDescription?: string
}

// Props du composant
interface ProjectsGalleryProps {
  projects: Project[]
}

export default function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  const [selectedProject, setSelectedProject] = useState<number | null>(null)

  // Fonction pour ouvrir un projet
  const openProject = (index: number) => {
    setSelectedProject(index)
  }

  // Fonction pour fermer un projet
  const closeProject = () => {
    setSelectedProject(null)
  }

  return (
    <section className="py-24 px-4 md:px-8 lg:px-16 bg-background">
      <h2 className="text-4xl md:text-5xl font-serif text-center mb-16">Selected Works</h2>

      {/* Mosaïque asymétrique */}
      <motion.div
        className="columns-1 sm:columns-2 lg:columns-3 gap-8 md:gap-12 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {projects.map((project, index) => (
          <motion.div
            key={index}
            className="break-inside-avoid-column relative overflow-hidden rounded-lg transition-all duration-300 hover:shadow-xl mb-8 w-full cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            onClick={() => openProject(index)}
          >
            <div
              className={`aspect-[${index % 3 === 0 ? "1/1.2" : index % 3 === 1 ? "4/3" : "3/4"}`}
              style={{
                aspectRatio: index % 3 === 0 ? "1/1.2" : index % 3 === 1 ? "4/3" : "3/4",
              }}
            >
              <div className="relative w-full h-full">
                <picture>
                  <source srcSet={project.imageUrl} type="image/webp" />
                  <Image
                    src={project.imageUrl || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </picture>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-2xl font-serif text-white mb-2">{project.title}</h3>
                <p className="text-sm font-sans text-white/80">{project.description}</p>
              </div>
              <div className="p-6 bg-white">
                <h3 className="text-xl font-serif mb-2">{project.title}</h3>
                <p className="text-sm font-sans text-muted-foreground">{project.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Overlay et projet agrandi */}
      <AnimatePresence>
        {selectedProject !== null && (
          <>
            {/* Overlay semi-transparent */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProject}
            />

            {/* Projet agrandi - Correction du centrage */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl overflow-hidden shadow-2xl w-full max-w-6xl max-h-[90vh]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 200,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-auto">
                  <div className="relative h-[40vh] md:h-auto">
                    <picture>
                      <source srcSet={projects[selectedProject].imageUrl} type="image/webp" />
                      <Image
                        src={projects[selectedProject].imageUrl || "/placeholder.svg"}
                        alt={projects[selectedProject].title}
                        fill
                        className="object-cover"
                      />
                    </picture>
                  </div>
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      <motion.h3
                        className="text-3xl font-serif mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {projects[selectedProject].title}
                      </motion.h3>
                      <motion.p
                        className="text-muted-foreground mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {projects[selectedProject].description}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="mb-4">
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras euismod urna vel ligula
                          placerat, non finibus orci dignissim. Nulla facilisi. Vestibulum ante ipsum primis in faucibus
                          orci luctus et ultrices posuere cubilia curae.
                        </p>
                        <p>
                          Praesent pharetra cursus odio, vel pellentesque lorem varius vel. Sed imperdiet diam id metus
                          efficitur, eget vehicula est venenatis.
                        </p>
                      </motion.div>
                    </div>
                    <div className="mt-8">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Client</span>
                          <span className="font-medium">ACME Inc.</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Year</span>
                          <span className="font-medium">2023</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-medium">Branding & UI Design</span>
                        </div>
                      </div>
                      <motion.button
                        className="mt-6 inline-flex items-center justify-center rounded-md px-4 py-2 bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Case Study
                      </motion.button>
                    </div>
                  </div>
                </div>
                <button
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-black hover:bg-white/20 transition-colors"
                  onClick={closeProject}
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

