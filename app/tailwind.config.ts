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
        ink: "#0A0A0B",
        surface: "#111113",
        elevated: "#18181B",
        line: "#27272A",
        muted: "#71717A",
        accent: "#22D3EE",
        ok: "#4ADE80",
        warn: "#FBBF24",
        bad: "#F87171",
        crit: "#FB7185",
      },
    },
  },
  plugins: [],
};
export default config;