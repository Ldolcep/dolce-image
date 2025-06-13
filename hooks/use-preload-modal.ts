// hooks/use-preload-modal.ts
import { useState, useCallback, useRef } from 'react'

interface PreloadState {
  [key: string]: boolean
}

export const usePreloadModal = () => {
  const [preloadedProjects, setPreloadedProjects] = useState<PreloadState>({})
  const preloadPromises = useRef<Map<string, Promise<void>>>(new Map())

  const preloadProjectAssets = useCallback(async (project: any) => {
    // Si déjà préchargé ou en cours, on retourne la promesse existante
    if (preloadedProjects[project.id]) {
      return Promise.resolve()
    }

    const existingPromise = preloadPromises.current.get(project.id)
    if (existingPromise) {
      return existingPromise
    }

    // Créer une nouvelle promesse de préchargement
    const preloadPromise = (async () => {
      try {
        // Assets critiques : fond du modal + image principale
        const criticalAssets = [
          '/images/gallery-background.jpg',
          project.mainVisual
        ]

        // Précharger les assets critiques en parallèle
        await Promise.all(
          criticalAssets.map(src => {
            return new Promise<void>((resolve) => {
              const img = new Image()
              img.onload = () => resolve()
              img.onerror = () => {
                console.warn(`Failed to preload: ${src}`)
                resolve() // On continue même en cas d'erreur
              }
              img.src = src
            })
          })
        )

        // Marquer comme préchargé
        setPreloadedProjects(prev => ({ ...prev, [project.id]: true }))

        // Précharger les images additionnelles en arrière-plan (non bloquant)
        if (project.additionalVisuals?.length > 0) {
          Promise.all(
            project.additionalVisuals.map(src => {
              return new Promise<void>((resolve) => {
                const img = new Image()
                img.onload = () => resolve()
                img.onerror = () => resolve()
                img.src = src
              })
            })
          ).catch(() => {}) // Ignorer les erreurs pour les images secondaires
        }
      } finally {
        // Nettoyer la promesse en cache
        preloadPromises.current.delete(project.id)
      }
    })()

    // Stocker la promesse pour éviter les doublons
    preloadPromises.current.set(project.id, preloadPromise)
    
    return preloadPromise
  }, [preloadedProjects])

  const isProjectPreloaded = useCallback((projectId: string) => {
    return !!preloadedProjects[projectId]
  }, [preloadedProjects])

  return {
    preloadProjectAssets,
    isProjectPreloaded
  }
}
