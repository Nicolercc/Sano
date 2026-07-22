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
        moss: "#486b55",
        mint: "#dff3e7",
        oat: "#f6f2ea",
        coral: "#c8664c",
        amber: "#d69d3f"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 27, 0.09)"
      }
    }
  },
  plugins: []
};

export default config;
