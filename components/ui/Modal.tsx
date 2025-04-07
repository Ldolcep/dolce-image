"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  maxWidth?: string
}

export default function Modal({ isOpen, onClose, children, title, maxWidth = "max-w-4xl" }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Monter le composant côté client
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Gérer le focus et les événements clavier
  useEffect(() => {
    if (!isOpen) return

    // Sauvegarder l'élément actuellement focus
    previousFocusRef.current = document.activeElement as HTMLElement

    // Fonction pour gérer la touche Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    // Ajouter les écouteurs d'événements
    document.addEventListener("keydown", handleKeyDown)

    // Focus sur le modal
    if (modalRef.current) {
      modalRef.current.focus()
    }

    // Empêcher le défilement du body
    document.body.style.overflow = "hidden"

    return () => {
      // Nettoyer les écouteurs d'événements
      document.removeEventListener("keydown", handleKeyDown)

      // Restaurer le focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }

      // Restaurer le défilement
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  // Gérer le clic à l'extérieur du modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Ne rien rendre côté serveur ou si le modal est fermé
  if (!mounted || !isOpen) return null

  // Utiliser createPortal pour rendre le modal à la fin du body
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          <motion.div
            ref={modalRef}
            className={`bg-white rounded-lg shadow-xl overflow-hidden w-full ${maxWidth}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            tabIndex={-1}
          >
            <div className="flex justify-between items-center p-4 border-b">
              {title && (
                <h2 id="modal-title" className="text-xl font-semibold">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

