import Image from "next/image"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="relative h-16 w-16 mb-4 md:mb-0">
            <Image src="/images/DOLCE_LOGO_SECONDAIRE.png" alt="Dolce" fill className="object-contain" />
          </div>

          <div className="flex space-x-6">
            <Link
              href="https://instagram.com/groupedolce"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-black hover:text-primary-orange transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>
            <Link
              href="https://tiktok.com/@groupedolce"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-black hover:text-primary-orange transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16.5 6.5v6a3.5 3.5 0 1 1-7 0V10" />
                <path d="M16.5 3a3.5 3.5 0 0 0-3.5 3.5H8" />
                <path d="M8 14a3.5 3.5 0 1 0 0-7" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="mt-6 text-center md:text-right">
          <p className="text-sm text-gray-600 font-poppins">© {new Date().getFullYear()} Dolce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
