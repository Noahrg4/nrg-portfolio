import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0A0A0A",
        surface: {
          1: "#111111",
          2: "#161616",
          3: "#1C1C1C",
        },
        accent: {
          DEFAULT: "#00D4FF",
          glow: "rgba(0,212,255,0.15)",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          secondary: "#888888",
          subtle: "#555555",
        },
        hairline: "rgba(255,255,255,0.08)",
        "hairline-strong": "rgba(255,255,255,0.16)",
        status: {
          green: "#28CA41",
        },
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        "card-hover": "0 20px 60px rgba(0,212,255,0.15)",
        "card-base": "0 1px 1px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
      },
      maxWidth: {
        content: "1280px",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
      },
      animation: {
        "pulse-dot": "pulse-dot 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
