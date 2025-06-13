// src/components/about-section.tsx

import Image from 'next/image';

export default function AboutSection() {
  return (
    // La section principale utilise une couleur de fond de vos variables CSS.
    // Le padding (py) est ajusté pour mobile et desktop.
    <section 
      id="qui-sommes-nous" 
      className="relative bg-[var(--color-secondary-cream-2)] py-20 md:py-28 overflow-hidden"
    >
      {/* Conteneur principal qui centre le contenu et ajoute du padding horizontal */}
      <div className="container mx-auto px-6 lg:px-8">
        {/* 
          Mise en page en grille : 
          - 1 colonne sur mobile (les éléments s'empilent).
          - 2 colonnes sur les écrans larges (lg:).
          - `items-center` pour aligner verticalement les deux colonnes.
          - `gap-x-24` et `gap-y-16` pour gérer les espacements.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-16 items-center">
          
          {/* === COLONNE DE L'IMAGE === */}
          {/* 
            - `order-2 lg:order-1` : L'image apparaît en deuxième sur mobile, et en première sur desktop.
            - `relative` est nécessaire pour positionner le texte "Bienvenue..." par-dessus.
          */}
          <div className="relative order-2 lg:order-1">
            <div className="qsm-image-container">
              {/* REMPLACEZ le `src` par le chemin de votre image */}
              <Image
                src="/images/QSM_illu.png" // <--- MODIFIEZ CECI
                alt="Voiture jaune sur la côte méditerranéenne"
                width={550}
                height={688}
                className="w-full h-auto object-cover rounded-[2px] shadow-lg"
                sizes="(max-width: 768px) 90vw, 550px"
              />
            </div>
            
            {/* Le texte "Bienvenue..." est positionné de manière absolue */}
            {/* Il utilise la police de titre 'Koolegant' grâce à la balise h3 */}
            <h3 className="qsm-handwritten-text">
              Bienvenue dans<br />notre univers
            </h3>
          </div>

          {/* === COLONNE DU TEXTE === */}
          {/* `order-1 lg:order-2` : Le texte apparaît en premier sur mobile, en deuxième sur desktop. */}
          <div className="order-1 lg:order-2">
            {/* 
              Le titre `h2` utilisera automatiquement la police 'Koolegant' 
              définie dans la base de votre CSS.
            */}
            <h2 className="text-5xl md:text-6xl mb-6 text-primary-black">
              {/* MODIFIEZ le titre si besoin */}
              Qui sommes-nous ?
            </h2>
            
            {/* 
              Le paragraphe `p` utilisera automatiquement la police 'Cocogoose Pro' 
              définie pour le `body`.
            */}
            <p className="text-base md:text-lg leading-relaxed text-foreground">
              {/* MODIFIEZ le texte ici */}
              Bienvenue dans l'univers DOLCE, l'agence de communication digitale 
              inspirée de la beauté de la Méditerranée, de l'élégance de la 
              French Riviera des années 60 et de la Dolce Vita.
              <br/><br/>
              Situés entre la French Riviera, Paris et le Luxembourg, nous vous 
              accompagnons dans votre stratégie de communication digitale au 
              travers de nos différents services, comme le développement de votre 
              identité visuelle, la conception et le design de votre site web ou 
              encore la gestion de vos réseaux sociaux.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}