import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./dashboard/**/*.{js,ts,jsx,tsx,mdx}",
    "./charts/**/*.{js,ts,jsx,tsx,mdx}",
    "./alerts/**/*.{js,ts,jsx,tsx,mdx}",
    "./ai/**/*.{js,ts,jsx,tsx,mdx}",
    "./logs/**/*.{js,ts,jsx,tsx,mdx}",
    "./settings/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(to bottom, var(--surface-0), var(--surface-1))"
      },
      boxShadow: {
        glass: "0 1px 2px rgba(0, 0, 0, 0.04)",
        premium: "0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)",
        "premium-hover": "0 12px 24px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.03)",
        spotlight: "0 0 80px rgba(59, 130, 246, 0.07)"
      }
    }
  },
  plugins: []
};

export default config;
