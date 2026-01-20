import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          50: "color-mix(in srgb, var(--primary) 5%, white)",
          100: "color-mix(in srgb, var(--primary) 10%, white)",
          200: "color-mix(in srgb, var(--primary) 20%, white)",
          300: "color-mix(in srgb, var(--primary) 30%, white)",
          400: "color-mix(in srgb, var(--primary) 40%, white)",
          500: "var(--primary)",
          600: "color-mix(in srgb, var(--primary) 90%, black)",
          700: "color-mix(in srgb, var(--primary) 80%, black)",
          800: "color-mix(in srgb, var(--primary) 70%, black)",
          900: "color-mix(in srgb, var(--primary) 60%, black)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
        },
        background: "#ffffff",
        foreground: "#1a1a1a",
        muted: {
          DEFAULT: "#f5f5f5",
          foreground: "#737373",
        },
        border: "#e5e5e5",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
