import Link from "next/link"

export default function CTASection() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-secondary-cream-2">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-koolegant text-4xl md:text-5xl mb-4">Prêt à propulser votre marque ?</h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto font-cocogoose">
          Contactez nous pour discuter de votre projet ou collaborer.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="mailto:contact@dolce-agency.com" className="btn-primary">
            Nous contacter par email
          </Link>
          <Link
            href="https://instagram.com/groupedolce"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Nous contacter sur Instagram
          </Link>
        </div>
      </div>
    </section>
  )
}
