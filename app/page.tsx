import Header from "@/components/header"
import Hero from "@/components/hero"
import  AboutSection from "@/components/about-Section"
import ProjectGallery from "@/components/project-gallery"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

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
