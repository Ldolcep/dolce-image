import Link from "next/link"
import { motion } from "framer-motion"

export default function CTASection() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-secondary-cream-2">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-koolegant text-4xl md:text-5xl mb-4">Prêt à propulser votre marque ?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto font-cocogoose">
          Contactez nous pour discuter de votre projet ou collaborer.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.a
            href="mailto:contact@dolce-agency.com"
            className="btn-primary"
            whileHover={{ scale: 1.05, filter: "brightness(1.1)", boxShadow: "0 4px 24px rgba(98,137,181,0.12)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 22, duration: 0.22 }}
            style={{ willChange: 'transform, filter, box-shadow' }}
          >
            Nous contacter par email
          </motion.a>
          <motion.a
            href="https://instagram.com/groupedolce"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            whileHover={{ scale: 1.05, filter: "brightness(1.1)", boxShadow: "0 4px 24px rgba(98,137,181,0.12)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 350, damping: 22, duration: 0.22 }}
            style={{ willChange: 'transform, filter, box-shadow' }}
          >
            Nous contacter sur Instagram
          </motion.a>
        </div>
      </div>
    </section>
  )
}
