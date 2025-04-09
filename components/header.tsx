"use client"

import Image from "next/image"
import Link from "next/link"

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Smooth scroll to element
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="relative h-12 w-36 md:h-14 md:w-40 mx-2">
          <Image src="/images/DOLCE_LOGO_PRIMAIRE.png" alt="Dolce" fill className="object-contain" priority />
        </Link>
        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => scrollToSection("projects")}
            className="font-poppins text-sm hover:text-primary-orange transition-colors focus:outline-none focus:text-primary-orange"
          >
            PROJECTS
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="font-poppins text-sm hover:text-primary-orange transition-colors focus:outline-none focus:text-primary-orange"
          >
            CONTACT
          </button>
        </nav>
        <button className="md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}
