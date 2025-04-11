"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const volumeContainerRef = useRef<HTMLDivElement>(null) // Renommé pour clarté
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Ref pour le timeout
  const isMobile = useIsMobile()

  // Fonction pour annuler le timeout de fermeture
  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  // Gérer le changement d'état mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      videoRef.current.muted = newMutedState
      
      // Annuler tout timeout en cours quand on clique
      clearCloseTimeout();

      if (!newMutedState) {
        videoRef.current.volume = volume
        // Afficher le contrôle immédiatement quand on active le son
        setShowVolumeControl(true) 
      } else {
        // Cacher le contrôle immédiatement quand on coupe le son
        setShowVolumeControl(false)
      }
    }
  }

  // Gérer le changement de volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
      // Si on change le volume, on est forcément actif, donc on annule le timeout
      clearCloseTimeout();
    }
  }

  useEffect(() => {
    // Assurer que la vidéo est bien chargée avec le bon état initial
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = volume
    }
  }, [isMuted, volume]) // Dépendances correctes

  // Gérer l'affichage/masquage du contrôle de volume au survol
  useEffect(() => {
    const volumeContainer = volumeContainerRef.current
    if (!volumeContainer) return

    const handleMouseEnter = () => {
      // Quand la souris entre dans la zone, annuler le timeout de fermeture
      clearCloseTimeout();
      // Si le son n'est pas coupé, on peut montrer le contrôle (facultatif ici, géré par le bouton aussi)
      // if (!isMuted) {
      //   setShowVolumeControl(true);
      // }
    }

    const handleMouseLeave = () => {
      // Quand la souris quitte la zone, démarrer le timeout pour fermer
      closeTimeoutRef.current = setTimeout(() => {
        setShowVolumeControl(false)
      }, 300) // Délai de fermeture
    }

    // Ajouter les écouteurs au conteneur global
    volumeContainer.addEventListener("mouseenter", handleMouseEnter)
    volumeContainer.addEventListener("mouseleave", handleMouseLeave)

    // Nettoyage au démontage du composant
    return () => {
      volumeContainer.removeEventListener("mouseenter", handleMouseEnter)
      volumeContainer.removeEventListener("mouseleave", handleMouseLeave)
      // Nettoyer aussi le timeout si le composant est démonté
      clearCloseTimeout();
    }
  }, [isMuted]); // On ajoute isMuted comme dépendance si la logique dans handleMouseEnter dépendait de ça (même si commenté)
                 // On pourrait aussi laisser [] si on gère l'affichage uniquement via le bouton et le toggleMute.
                 // Pour ce cas précis, [] est suffisant car on gère showVolumeControl ailleurs.

  return (
    <section className="w-full relative pt-[64px] md:pt-[72px]">
      {/* Video Full Screen */}
      <div className="w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted // Commence en mute
          loop
          playsInline
        >
          <source src="/hero-video/dolce-banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Contrôles audio */}
      <div className="absolute bottom-6 right-6 xxl:bottom-60">
        {/* Le conteneur qui déclenche le mouseenter/mouseleave */}
        <div
          ref={volumeContainerRef}
          className={`flex ${isMobile ? 'flex-row items-center gap-3' : 'flex-col items-end gap-3'}`}
        >
          {/* Contrôle de volume - visible uniquement quand showVolumeControl est true */}
          {showVolumeControl && (
            <div
              className={`bg-black/30 backdrop-blur-sm rounded-full transition-opacity duration-300 flex items-center justify-center ${isMobile ? 'mb-0' : 'mb-2'}`} // Durée de transition pour l'opacité
              style={{
                padding: isMobile ? '8px 12px' : '8px',
                width: isMobile ? '100px' : '40px',
                height: isMobile ? 'auto' : '160px',
                opacity: showVolumeControl ? 1 : 0, // Contrôle l'opacité via l'état
                boxSizing: 'border-box'
              }}
              // Pas besoin de mouseenter/leave ici, géré par le parent
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange} // handleVolumeChange annule aussi le timeout
                className={`accent-white cursor-pointer ${isMobile ? 'w-full' : '-rotate-90 w-28'}`}
                style={{
                  height: '4px',
                  transform: isMobile ? 'none':'rotate(-90deg)',
                  transformOrigin: 'center',
                  marginTop: isMobile ? 0 : '4px'
                }}
              />
            </div>
          )}

          {/* Bouton mute/unmute */}
          <button
            onClick={toggleMute}
            className="bg-black/30 backdrop-blur-sm p-2.5 rounded-full text-white hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
            // Au survol du bouton :
            onMouseOver={() => {
              if (!isMuted) {
                // 1. Afficher le contrôle
                setShowVolumeControl(true);
                // 2. Annuler tout timeout de fermeture en cours (important!)
                clearCloseTimeout();
              }
            }}
            // onMouseLeave n'est plus nécessaire ici, géré par le parent (volumeContainerRef)
          >
            {isMuted ? (
              <VolumeX size={isMobile ? 20 : 18} />
            ) : (
              <Volume2 size={isMobile ? 20 : 18} />
            )}
          </button>
        </div>
      </div>
    </section>
  )
}