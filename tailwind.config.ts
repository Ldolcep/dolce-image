// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-cocogoose)', 'sans-serif'],
      koolegant: ['var(--font-koolegant)', 'serif'],
    },
    extend: {
      spacing: {
        '60': '15rem',
      },
      screens: {
        'xxl': '1700px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "primary-orange": "#F7A520",
        "primary-blue": "#09478E",
        "primary-black": "#000000",
        "secondary-orange": "#F9AF3F",
        "secondary-cream-1": "#EFE4E4",
        "secondary-cream-2": "#F0E9E6",
        "secondary-cream-3": "#FAF7F7",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // ▼▼▼ SECTION TYPOGRAPHY AJUSTÉE ▼▼▼
      typography: ({ theme }) => ({
        DEFAULT: { 
          css: {
            // Variables de couleur pour prose (bon à garder pour la cohérence)
            '--tw-prose-body': theme('colors.foreground / 1'), 
            '--tw-prose-headings': theme('colors.foreground / 1'),
            '--tw-prose-links': theme('colors.primary-blue / 1'),
            '--tw-prose-bold': theme('colors.foreground / 1'),
            // ... vous pouvez ajouter d'autres variables de couleur prose si nécessaire

            // Style de base pour le corps du texte dans .prose
            fontFamily: theme('fontFamily.cocogoose'),
            fontSize: '1rem', // Taille de police par défaut, ajustez si nécessaire
            color: 'var(--tw-prose-body)',
            fontWeight: '400', // <<< Correction clé : Forcer la graisse regular pour le texte de base

            // Styles pour les titres dans .prose
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.koolegant'),
              color: 'var(--tw-prose-headings)',
              fontWeight: '700', // Ou le poids désiré pour Koolegant (souvent bold)
            },

            // Styles pour les éléments en gras dans .prose
            strong: {
              fontWeight: '700', // Assure que la graisse 700 (bold) est utilisée
              color: 'var(--tw-prose-bold)',
            },
            b: { // Au cas où Markdown génère <b>
              fontWeight: '700',
              color: 'var(--tw-prose-bold)',
            }
          },
        },
        // Appliquer des corrections similaires pour les modificateurs de taille
        sm: { // Pour prose-sm (utilisé sur mobile)
           css: {
            color: 'var(--tw-prose-body)', // Hérite de DEFAULT ou spécifiez ici si différent
            fontWeight: '400', // <<< Correction clé
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.koolegant'),
              fontWeight: '700',
            },
            strong: { fontWeight: '700' },
            b: { fontWeight: '700' },
          },
        },
        lg: { // Pour prose-lg (utilisé sur desktop)
          css: {
            color: 'var(--tw-prose-body)', // Hérite de DEFAULT ou spécifiez ici si différent
            fontWeight: '400', // <<< Correction clé
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.koolegant'),
              fontWeight: '700',
            },
            strong: { fontWeight: '700' },
            b: { fontWeight: '700' },
          }
        }
      }),
      // ▲▲▲ FIN DE LA SECTION TYPOGRAPHY AJUSTÉE ▲▲▲
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
export default config
