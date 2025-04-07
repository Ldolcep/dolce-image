import Image from "next/image"
import { Instagram, Linkedin, Figma, PenTool } from "lucide-react"
import CtaSection from "@/components/CtaSection"
import VideoBanner from "@/components/VideoBanner"
import ProjectsGallery from "@/components/projects/ProjectsGallery"

export default function Home() {
  return (
    <div className="min-h-screen bg-background"> 
      {/* Header Section */}
      <header className="py-3 px-4 flex justify-center items-center border-b border-muted">
        <div className="logo">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DOLCE_LOGO_PRIMAIRE%20%281%29-RhyxCbY1Dh3NErJz4aXKp8S8QehohX.png"
            alt="Dolce Logo"
            width={100} // Remplace 500 par la taille que tu veux
            height={100}
            className="w-[50px] h-[50px]" // Tailwind CSS permet un contrôle direct de la taille
            priority
          />
        </div>
      </header>

      {/* Hero Section avec vidéo */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-10"></div>
        <VideoBanner />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center text-white">
            <h2 className="text-4xl md:text-6xl font-serif mb-4">Creative Digital Solutions</h2>
            <p className="text-lg md:text-xl font-sans max-w-md mx-auto">
              Elevating brands through elegant design and strategic innovation
            </p>
          </div>
        </div>
      </section>

      {/* Nouvelle galerie de projets en style masonry */}
      <ProjectsGallery />

      {/* CTA Section */}
      <CtaSection />

      {/* Footer Section */}
      <footer className="py-12 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              <Instagram size={24} />
              <span className="sr-only">Instagram</span>
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              <Linkedin size={24} />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              <Figma size={24} />
              <span className="sr-only">Behance</span>
            </a>
            <a href="#" className="text-secondary hover:text-primary transition-colors">
              <PenTool size={24} />
              <span className="sr-only">Pinterest</span>
            </a>
          </div>
          <p className="text-sm font-sans">© 2023 Dolce Agency</p>
        </div>
      </footer>
    </div>
  )
}

