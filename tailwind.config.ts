import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201b",
        moss: "#2563c9",
        mint: "#eaf2ff",
        oat: "#f8f4eb",
        coral: "#c22f2f",
        amber: "#8a6418"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 27, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
