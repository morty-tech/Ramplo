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
        // New Brand Colors
        aura: {
          50: "#F5F0FF",
          100: "#EBE0FF",
          200: "#D8B2FF",
          400: "#B266FF", 
          600: "#8E2DE2",
          700: "#7A1FB8",
          800: "#5E00A0",
        },
        eclipse: {
          50: "#F0F4FF",
          100: "#E0E8FF",
          200: "#A0B2FF",
          400: "#5768EB",
          600: "#4A00E0",
          700: "#3800B8",
          800: "#2A0090",
        },
        electric: {
          50: "#F0FFFE",
          100: "#E0FFFC",
          200: "#B3FFF0",
          400: "#66FFDD",
          600: "#00F5D4",
          700: "#00C4A8",
          800: "#00BFAF",
        },
        frost: {
          50: "#F0FEFF",
          100: "#E0FDFF",
          200: "#CFF7FF",
          400: "#9BEFFF",
          600: "#6AE5F7",
          700: "#3BD4E8",
          800: "#2ACEDD",
        },
        carbon: {
          50: "#F5F5F5",
          100: "#E5E5E5",
          200: "#B3B3B3",
          400: "#7A7A7A",
          600: "#2A2A2A",
          800: "#101010",
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
