"use client"

import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Project } from "@/types/project"
import { AnimatePresence, motion } from "framer-motion"

import ProjectModalMobile from "./ProjectModalMobile"
import ProjectModalDesktop from "./ProjectModalDesktop"
import "@/styles/features/modal-desktop.css"
import "@/styles/features/carousel.css"

interface ProjectModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
  const isMobile = useIsMobile()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (isMobile) {
      import("@/styles/features/swiper-mobile.css")
    }
  }, [isMobile])

  // Modal container animation variants
  const modalVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, type: "spring", ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.4, type: "spring", ease: [0.4, 0, 0.2, 1] } },
  }

  // Backdrop animation variants
  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    exit: { opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  }

  if (!isMounted) return null;
  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={backdropVariants}
          style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.65)' }}
        >
          <motion.div
            className="relative w-full max-w-none"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={modalVariants}
            style={{ willChange: 'transform, opacity' }}
            role="dialog"
            aria-modal="true"
          >
            {isMobile
              ? <ProjectModalMobile project={project} isOpen={isOpen} onClose={onClose} />
              : <ProjectModalDesktop project={project} isOpen={isOpen} onClose={onClose} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
