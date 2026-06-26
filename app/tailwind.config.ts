import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: "#ffffff",
        surface: "#f8f9fa",
        elevated: "#ffffff",
        line: "#e5e7eb",
        muted: "#6b7280",
        accent: "#0d9488",
        ok: "#16a34a",
        warn: "#ca8a04",
        bad: "#dc2626",
        crit: "#e11d48",
      },
    },
  },
  plugins: [],
};
export default config;