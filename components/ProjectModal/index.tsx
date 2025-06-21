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

  // AnimatePresence wraps the modal with a dynamic key for animation
  return (
    <AnimatePresence mode="wait">
      {props.isOpen && (
        (props.project ? (
          isMobile
            ? <ProjectModalMobile key={props.project.id} {...props} />
            : <ProjectModalDesktop key={props.project.id} {...props} />
        ) : null)
      )}
    </AnimatePresence>
  )
}
