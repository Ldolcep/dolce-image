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
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
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
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <g transform="translate(13.7 10.5) scale(1.15) translate(-13.3385 -10.662)">
                  <path d="M6.977,15.532a2.791,2.791,0,0,0,2.791,2.792,2.859,2.859,0,0,0,2.9-2.757L12.7,3h2.578A4.8,4.8,0,0,0,19.7,7.288v2.995h0c-.147.014-.295.022-.443.022a4.8,4.8,0,0,1-4.02-2.172v7.4a5.469,5.469,0,1,1-5.469-5.469c.114,0,.226.01.338.017v2.7a2.909,2.909,0,0,0-.338-.034A2.791,2.791,0,0,0,6.977,15.532Z"></path>
                </g>
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
