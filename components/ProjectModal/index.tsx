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

export default function ProjectModal(props: ProjectModalProps) {
  const isMobile = useIsMobile()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (isMobile) {
      import("@/styles/features/swiper-mobile.css")
    }
  }, [isMobile])  

  if (!isMounted) {
    if (!props.isOpen) return null
    return <div className="fixed inset-0 bg-white z-50" role="dialog" aria-modal="true"></div>
  }

  // AnimatePresence wraps the modal for enter/exit animation
  return (
    <AnimatePresence mode="wait" initial={false}>
      {props.isOpen && (
        <motion.div
          key="modal-root"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", ease: [0.4, 0, 0.2, 1] }}
          style={{ willChange: "opacity, transform", zIndex: 50 }}
          className="fixed inset-0 flex items-center justify-center p-4 md:p-6 z-50"
        >
          {isMobile 
            ? <ProjectModalMobile {...props} /> 
            : <ProjectModalDesktop {...props} />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
