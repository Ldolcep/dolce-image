"use client"

import { useEffect, useRef, useState } from "react"

export default function VideoBanner() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current

    if (video) {
      video.addEventListener("loadeddata", () => {
        setIsLoaded(true)
      })
    }

    return () => {
      if (video) {
        video.removeEventListener("loadeddata", () => {
          setIsLoaded(true)
        })
      }
    }
  }, [])

  return (
    <div className="absolute inset-0 z-0">
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-white/20">
          <span className="text-6xl font-serif">Loading...</span>
        </div>
      )}
      <video
        ref={videoRef}
        className={`h-full w-full object-cover transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/public/dolce-banner.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>
    </div>
  )
}

