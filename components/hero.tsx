"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const volumeContainerRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile()

  // Fonction pour annuler le timeout de fermeture (utilisé uniquement sur desktop)
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
      
      // Annuler tout timeout en cours (pertinent pour desktop)
      clearCloseTimeout();

      if (!newMutedState) {
        videoRef.current.volume = volume
        // Toujours afficher le contrôle quand on active le son
        setShowVolumeControl(true) 
      } else {
        // Toujours cacher le contrôle quand on coupe le son
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
      // Si on change le volume, annuler le timeout de fermeture (pertinent pour desktop)
      if (!isMobile) {
         clearCloseTimeout();
      }
    }
  }

  useEffect(() => {
    // Assurer que la vidéo est bien chargée avec le bon état initial
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = volume
    }
  }, [isMuted, volume])

  // --- Logique de survol pour DESKTOP UNIQUEMENT ---
  useEffect(() => {
    // Ne rien faire si on est sur mobile
    if (isMobile) return;

    const volumeContainer = volumeContainerRef.current
    if (!volumeContainer) return

    const handleMouseEnter = () => {
      // Annuler le timeout de fermeture quand la souris entre
      clearCloseTimeout();
    }

    const handleMouseLeave = () => {
      // Démarrer le timeout pour fermer quand la souris quitte
      closeTimeoutRef.current = setTimeout(() => {
        setShowVolumeControl(false)
      }, 300) // Délai de fermeture sur desktop
    }

    volumeContainer.addEventListener("mouseenter", handleMouseEnter)
    volumeContainer.addEventListener("mouseleave", handleMouseLeave)

    // Nettoyage
    return () => {
      volumeContainer.removeEventListener("mouseenter", handleMouseEnter)
      volumeContainer.removeEventListener("mouseleave", handleMouseLeave)
      // Nettoyer aussi le timeout si le composant est démonté ou isMobile change
      clearCloseTimeout();
    }
  // Dépendances : s'exécute si isMobile change ou si la ref change (peu probable)
  }, [isMobile, volumeContainerRef]);


  // --- Logique de "Tap Outside" pour MOBILE UNIQUEMENT ---
  useEffect(() => {
    // N'ajouter l'écouteur que si on est sur mobile ET que le contrôle est visible
    if (!isMobile || !showVolumeControl) {
      return; // Ne rien faire si pas mobile ou si contrôle caché
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Vérifier si la ref existe et si le clic/tap est en dehors du conteneur
      if (
        volumeContainerRef.current &&
        !volumeContainerRef.current.contains(event.target as Node)
      ) {
        setShowVolumeControl(false); // Cacher le contrôle
      }
    };

    // Ajouter l'écouteur au document
    document.addEventListener("mousedown", handleClickOutside);
    // Aussi écouter les événements tactiles pour une meilleure réactivité mobile
    document.addEventListener("touchstart", handleClickOutside); 

    // Fonction de nettoyage indispensable !
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };

  // Dépendances : s'exécute si isMobile ou showVolumeControl changent
  }, [isMobile, showVolumeControl, volumeContainerRef]);

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
      {/* Ajout de la classe pour le breakpoint 3xl (exemple) */}
      <div className="absolute bottom-6 right-6 xxl:bottom-30 3xl:bottom-40"> 
        {/* Le conteneur */}
        <div
          ref={volumeContainerRef}
          className={`flex ${isMobile ? 'flex-row items-center gap-3' : 'flex-col items-end gap-3'}`}
        >
          {/* Contrôle de volume */}
          {showVolumeControl && (
            <div
              // Applique une transition sur l'opacité pour l'apparition/disparition
              className={`bg-black/30 backdrop-blur-sm rounded-full transition-opacity duration-300 flex items-center justify-center ${isMobile ? 'mb-0' : 'mb-2'}`} 
              style={{
                padding: isMobile ? '8px 12px' : '8px',
                width: isMobile ? '100px' : '40px',
                height: isMobile ? 'auto' : '160px',
                // Contrôle l'opacité via l'état et la transition CSS
                opacity: showVolumeControl ? 1 : 0, 
                boxSizing: 'border-box'
              }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange} // Annule le timeout sur desktop si besoin
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
            // onMouseOver uniquement pour desktop pour afficher le contrôle si nécessaire
            onMouseOver={() => {
              // Ne s'active que sur desktop
              if (!isMobile && !isMuted) {
                setShowVolumeControl(true);
                clearCloseTimeout(); // Annuler le timeout si la souris revient sur le bouton
              }
            }}
            // Pas besoin de onMouseLeave ici, géré par le container sur desktop
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