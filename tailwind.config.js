/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#f0f4fa",
        foreground: "#0d0d0d",
        border: "#e2e8f0",
        primary: {
          DEFAULT: "#1a5fd4",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#dbe7fb",
          foreground: "#1a5fd4",
        },
        muted: {
          DEFAULT: "#e8edf5",
          foreground: "#7a8599",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0d0d0d",
        },
        dark: {
          DEFAULT: "#1a1f2e",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "System"],
      },
      borderRadius: {
        sm: "8px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
