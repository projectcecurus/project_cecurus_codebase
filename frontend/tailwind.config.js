/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e8f8f4",
          100: "#cbf1e7",
          200: "#9fe6d7",
          300: "#67d4c0",
          400: "#27b9a2",
          500: "#0d8a76",
          600: "#0a7766",
          700: "#0a6458",
          800: "#0b4f46",
          900: "#0b3d37",
          950: "#071f1c",
        },
        ink: {
          50: "#f8fafb",
          100: "#f2f5f6",
          200: "#e3eaec",
          300: "#cfd8dc",
          400: "#95a3aa",
          500: "#67767e",
          600: "#4a5860",
          700: "#364148",
          800: "#20292e",
          900: "#11181c",
          950: "#081014",
        },
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        shell: "0 24px 80px rgba(8, 31, 27, 0.12)",
        card: "0 10px 32px rgba(13, 34, 33, 0.08)",
        glow: "0 18px 50px rgba(17, 146, 125, 0.16)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #041b18 0%, #0a4f45 55%, #0d8a76 100%)",
        "sidebar-gradient": "linear-gradient(180deg, #06211d 0%, #0b3d37 58%, #072723 100%)",
        "surface-glow": "radial-gradient(circle at top left, rgba(39, 185, 162, 0.12), transparent 35%)",
      },
    },
  },
};
