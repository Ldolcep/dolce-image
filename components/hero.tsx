import Image from "next/image"

export default function Hero() {
  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-24 w-56 md:h-32 md:w-72 mb-8">
            <Image src="/images/DOLCE_LOGO_PRIMAIRE.png" alt="Dolce" fill className="object-contain" priority />
          </div>
          <h2 className="font-great-vibes text-4xl md:text-5xl lg:text-6xl max-w-2xl">
            Crafting digital experiences that elevate your brand
          </h2>
          <p className="font-poppins text-base md:text-lg mt-4 max-w-xl text-gray-600">
            We create elegant, functional designs that help businesses stand out in the digital landscape
          </p>
        </div>
      </div>
    </section>
  )
}
