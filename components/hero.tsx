"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
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
    <section className="w-full relative pt-[64px] md:pt-[72px] lg:pt-0">
      {/* Video Full Screen */}
      <div className="w-full h-full">
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
      
      {/* Contrôles audio */}
      <div className="absolute bottom-8 right-8 flex items-center space-x-3">
        {/* Contrôle de volume - visible uniquement quand le son est activé */}
        {showVolumeControl && (
          <div 
            className="bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full transition-all duration-300"
            style={{ width: '120px', opacity: showVolumeControl ? 1 : 0 }}
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-white cursor-pointer"
            />
          </div>
        )}
        
        {/* Bouton mute/unmute */}
        <button
          onClick={toggleMute}
          className="bg-black/30 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
          onMouseOver={() => !isMuted && setShowVolumeControl(true)}
          onMouseLeave={() => setTimeout(() => setShowVolumeControl(false), 2000)}
        >
          {isMuted ? (
            <VolumeX size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </button>
      </div>
    </section>
  )
}