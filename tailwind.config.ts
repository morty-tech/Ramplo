import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Brand Colors
        forest: {
          50: "hsl(150, 23%, 96%)",
          100: "hsl(150, 23%, 92%)",
          200: "hsl(150, 23%, 85%)",
          300: "hsl(150, 23%, 75%)",
          400: "hsl(155, 20%, 44%)",
          500: "hsl(155, 33%, 35%)",
          600: "hsl(155, 46%, 26%)",
          700: "hsl(155, 55%, 20%)",
          800: "hsl(155, 63%, 15%)",
        },
        limeglow: {
          200: "hsl(75, 100%, 91%)",
          300: "hsl(75, 100%, 82%)",
          400: "hsl(75, 100%, 73%)",
          600: "hsl(75, 72%, 58%)",
          800: "hsl(75, 89%, 37%)",
        },
        tealwave: {
          200: "hsl(169, 45%, 89%)",
          400: "hsl(169, 43%, 63%)",
          600: "hsl(169, 51%, 40%)",
          800: "hsl(169, 75%, 22%)",
        },
        slate: {
          200: "hsl(216, 12%, 90%)",
          400: "hsl(216, 10%, 77%)",
          600: "hsl(216, 8%, 52%)",
          800: "hsl(216, 10%, 22%)",
        },
        // Shadcn/UI Color System
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        headline: ["var(--font-headline)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        inter: ['Inter', 'sans-serif'],
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
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
