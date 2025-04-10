"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX } from "lucide-react"

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.5)
  const [showVolumeControl, setShowVolumeControl] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      setIsMuted(newMutedState)
      videoRef.current.muted = newMutedState

      if (!newMutedState) {
        videoRef.current.volume = volume
        setShowVolumeControl(true)
      } else {
        setShowVolumeControl(false)
      }
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)

    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
      videoRef.current.volume = volume
    }
  }, [isMuted, volume])

  return (
    <section className="w-full relative pt-[64px] md:pt-[72px] lg:pt-0">
      <div className="w-full h-auto flex justify-center items-center bg-black">
        <video
          ref={videoRef}
          className="w-full max-h-[100svh lg:h-screen object-contain"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero-video/dolce-banner.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="absolute bottom-8 right-8 flex items-center space-x-3">
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

        <button
          onClick={toggleMute}
          className="bg-black/30 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
          onMouseOver={() => !isMuted && setShowVolumeControl(true)}
          onMouseLeave={() => setTimeout(() => setShowVolumeControl(false), 2000)}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </section>
  )
}
