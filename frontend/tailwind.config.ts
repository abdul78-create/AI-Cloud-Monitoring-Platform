import type { Config } from "tailwindcss";

const config: Config = {
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
          "radial-gradient(circle at top right, rgba(217, 245, 255, 0.6), transparent 50%), radial-gradient(circle at top left, rgba(245, 235, 255, 0.6), transparent 35%), linear-gradient(to bottom right, #f8fafc, #f1f5f9)"
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.04)",
        premium: "0 20px 50px rgba(0, 0, 0, 0.05)",
        "premium-hover": "0 30px 60px rgba(0, 0, 0, 0.08)",
        spotlight: "0 0 100px rgba(56, 189, 248, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
