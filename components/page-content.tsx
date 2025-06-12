"use client";

import AboutSection from "@/components/about-section"
import FillerCard from "@/components/filler-card"
import Hero from "@/components/hero"
import ProjectGallery from "@/components/project-gallery"
import dynamic from "next/dynamic"

// La logique de dynamic import est maintenant dans un composant client, où elle est autorisée.
const Footer = dynamic(() => import("@/components/footer"), { ssr: false })
const CTASection = dynamic(() => import("@/components/cta-section"), { ssr: false })

export function PageContent() {
  return (
    <>
      <Hero />
      <main className="relative z-10 bg-background">
        <ProjectGallery />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 px-4 lg:px-8">
          <FillerCard
            backgroundImage="/images/fillers/filler_1_bg.jpg"
            textImage="/images/fillers/filler_1_text_black.png"
            className="lg:col-span-2"
          />
          <FillerCard
            backgroundImage="/images/fillers/filler_2_bg.jpg"
            textImage="/images/fillers/filler_2_text.png"
          />
          <FillerCard
            backgroundImage="/images/fillers/filler_3_bg.jpg"
            textImage="/images/fillers/filler_3_text_black.png"
          />
          <FillerCard
            backgroundImage="/images/fillers/filler_4_bg.jpg"
            textImage="/images/fillers/filler_4_text.png"
            className="lg:col-span-2"
          />
        </div>
        <AboutSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
