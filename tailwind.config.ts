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
      // ON MET TOUT DANS EXTEND POUR ÉVITER TOUTE AMBIGUÏTÉ

      // 1. Définition de nos polices personnalisées
      fontFamily: {
        sans: ['var(--font-cocogoose)', 'sans-serif'],
        koolegant: ['var(--font-koolegant)', 'serif'],
      },

      // 2. Le reste de vos personnalisations
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
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.foreground'),
            '--tw-prose-headings': theme('colors.foreground'),
            '--tw-prose-links': theme('colors.primary-blue'),
            '--tw-prose-bold': theme('colors.foreground'),
            fontFamily: theme('fontFamily.sans'),
            color: 'var(--tw-prose-body)',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.koolegant'),
              color: 'var(--tw-prose-headings)',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
export default config
