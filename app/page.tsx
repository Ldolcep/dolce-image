"use client";

import Header from "@/components/header"
import Hero from "@/components/hero"
import AboutSection from "@/components/about-section"
import ProjectGallery from "@/components/project-gallery"
import dynamic from "next/dynamic"

const Footer = dynamic(() => import("@/components/footer"), { ssr: false })
const CTASection = dynamic(() => import("@/components/cta-section"), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <AboutSection />
      <ProjectGallery />
      <CTASection />
      <Footer />
    </main>
  )
}
