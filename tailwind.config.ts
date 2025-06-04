import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}", // Assurez-vous que ce glob est correct pour votre structure
  ],
  theme: {
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
        "primary-orange": "#F7A520", // Vous pouvez aussi utiliser var(--color-primary-orange) ici si défini dans :root
        "primary-blue": "#09478E",   // idem
        "primary-black": "#000000",  // idem
        "secondary-orange": "#F9AF3F",
        "secondary-cream-1": "#EFE4E4",
        "secondary-cream-2": "#F0E9E6",
        "secondary-cream-3": "#FAF7F7",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        // Nouvelle configuration des polices
        'sans': ['var(--font-montserrat)', 'sans-serif'],        // Pour le corps du texte (Montserrat)
        'serif-display': ['var(--font-dm-serif-display)', 'serif'], // Pour les titres (DM Serif Display)

        // Si vous voulez toujours utiliser les anciennes clés avec les nouvelles polices
        // pour une transition plus douce dans votre CSS/classes, vous pouvez faire :
        // "great-vibes": ['var(--font-dm-serif-display)', 'serif'], // Remplace l'ancien great-vibes par DM Serif Display
        // poppins: ['var(--font-montserrat)', 'sans-serif'],      // Remplace l'ancien poppins par Montserrat
        // Sinon, supprimez les anciennes clés si vous ne les utilisez plus directement
        // et que vous passez par `font-sans` et `font-serif-display` dans votre CSS.
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
export default config
