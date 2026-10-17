import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export const tailwindPreset: Partial<Config> = {
  darkMode: "class" as any,
  content: [],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "24px",
        sm: "32px",
        lg: "48px",
        xl: "64px",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg, 16px)",
        md: "var(--radius-md, 12px)",
        sm: "var(--radius-sm, 8px)",
        full: "var(--radius-full, 9999px)",
        DEFAULT: "var(--radius, 12px)",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-bricolage)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        sm: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.06))",
        md: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
