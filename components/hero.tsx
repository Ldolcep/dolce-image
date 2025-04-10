"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isMobile = useIsMobile()
  
  // Gérer le changement d'état mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      videoRef.current.muted = newMutedState
      
      // Si on active le son, appliquer le volume précédemment défini
      if (!newMutedState) {
        videoRef.current.volume = volume
        // Afficher le contrôle de volume quand le son est activé
        setShowVolumeControl(true)
      } else {
        // Cacher le contrôle de volume quand le son est désactivé
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
    }
  }
  
  useEffect(() => {
    // Assurer que la vidéo est bien chargée avec le bon état initial
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = volume
    }
  }, [isMuted, volume])

  return (
    <section className="w-full relative video-container">
      {/* Video Full Screen avec hauteur ajustée */}
      <div className="w-full h-[100vh] md:h-[80vh] lg:h-[70vh] xl:h-[85vh] overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero-video/dolce-banner.mp4" type="video/mp4" />
          {/* Fallback pour les navigateurs qui ne supportent pas la vidéo */}
          Your browser does not support the video tag.
        </video>
      </div>
      
      {/* Contrôles audio - repositionnés selon l'écran */}
      <div className={`absolute ${isMobile ? 'bottom-4 right-4' : 'bottom-8 right-8 md:bottom-12 lg:top-1/2 lg:-translate-y-1/2 lg:right-12'} flex items-center space-x-2 md:space-x-3 z-10`}>
        {/* Contrôle de volume - visible uniquement quand le son est activé */}
        {showVolumeControl && (
          <div 
            className="bg-black/30 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-full transition-all duration-300"
            style={{ 
              width: isMobile ? '80px' : '100px', 
              opacity: showVolumeControl ? 1 : 0 
            }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-white cursor-pointer"
              style={{ height: isMobile ? '3px' : '4px' }}
            />
          </div>
        )}
        
        {/* Bouton mute/unmute - taille réduite sur mobile */}
        <button
          onClick={toggleMute}
          className="bg-black/30 backdrop-blur-sm p-2 md:p-3 rounded-full text-white hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
          onMouseOver={() => !isMuted && setShowVolumeControl(true)}
          onMouseLeave={() => setTimeout(() => setShowVolumeControl(false), 2000)}
        >
          {isMuted ? (
            <VolumeX size={isMobile ? 16 : 20} />
          ) : (
            <Volume2 size={isMobile ? 16 : 20} />
          )}
        </button>
      </div>
    </section>
  )
}