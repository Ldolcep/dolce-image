"use client"
import { Mail, Instagram } from "lucide-react"
import { motion } from "framer-motion"

export default function CtaSection() {
  return (
    <section className="py-20 px-4 md:px-8 lg:px-16 bg-muted">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-serif mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Ready to elevate your brand?
        </motion.h2>
        <motion.p
          className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Let's create something extraordinary together. Reach out to discuss your project or follow our latest work on
          Instagram.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.a
            href="mailto:contact@groupedolce.com"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail size={18} />
            Contactez-nous par email
          </motion.a>

          <motion.a
            href="https://www.instagram.com/groupedolce/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 bg-secondary text-white font-medium hover:bg-secondary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Instagram size={18} />
            Suivez-nous sur Instagram
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

