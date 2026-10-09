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
        brand: {
          dark: "#090b0e",
          card: "#12151b",
          cardHover: "#171c24",
          surface: "#1c222d",
          border: "#252d3a",
          borderLight: "#333d4e",
          orange: "#ff6a00",
          orangeBright: "#ff7d1a",
          orangeGlow: "rgba(255, 106, 0, 0.15)",
          amber: "#f59e0b",
        },
      },
      boxShadow: {
        'ember': '0 0 20px -3px rgba(255, 106, 0, 0.25)',
        'ember-sm': '0 0 10px -2px rgba(255, 106, 0, 0.2)',
        'metal': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
