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
    extend: {
      spacing: {
        '60': '15rem',
      },
      screens: {
        'xxl': '1700px',
      },
      colors: { // Vos couleurs sont correctes
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
      fontFamily: { // VOTRE CONFIGURATION fontFamily EST CORRECTE
        sans: ['"Cocogoose Pro"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        koolegant: ['Koolegant', 'Georgia', 'Times New Roman', 'serif'], 
      },
      borderRadius: { // Votre configuration borderRadius est correcte
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: { // Votre configuration keyframes est correcte
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: { // Votre configuration animation est correcte
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // ▼▼▼ AJOUT DE LA CONFIGURATION TYPOGRAPHY (SI NÉCESSAIRE POUR LES TITRES DANS .PROSE) ▼▼▼
      typography: ({ theme }) => ({
        DEFAULT: { 
          css: {
            '--tw-prose-body': theme('colors.foreground / 1'), 
            '--tw-prose-headings': theme('colors.foreground / 1'),
            '--tw-prose-links': theme('colors.primary-blue / 1'),
            // Forcer Cocogoose Pro pour le corps du texte dans prose
            fontFamily: theme('fontFamily.sans'),
            'p, span, div, li, ul, ol': {
              fontFamily: theme('fontFamily.sans'),
              fontWeight: '400', // Forcer regular
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.koolegant'),
            },
            // Désactiver les styles de poids par défaut de prose
            'strong, b': {
              fontWeight: '700', // Bold seulement pour strong/b
            }
          },
        },
        sm: {
          css: {
            fontFamily: theme('fontFamily.sans'),
            'p, span, div, li, ul, ol': {
              fontFamily: theme('fontFamily.sans'),
              fontWeight: '400',
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.koolegant'),
            },
          },
        },
        lg: { 
          css: {
            fontFamily: theme('fontFamily.sans'),
            'p, span, div, li, ul, ol': {
              fontFamily: theme('fontFamily.sans'),
              fontWeight: '400',
            },
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.koolegant'),
            },
          }
        }
      }),
      // ▲▲▲ FIN DE L'AJOUT TYPOGRAPHY ▲▲▲
    },
  },
  plugins: [
    require('@tailwindcss/typography') // Nécessaire pour la classe `prose`
  ],
}
export default config
