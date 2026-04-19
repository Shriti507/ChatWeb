/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          outfit: ["Outfit", "sans-serif"],
        },
        colors: {
          primary: {
            50: "#fef7f7",
            500: "#fb6f92",
            600: "#ec5a82",
          },
          gray: {
            50: "#f9fafb",
            100: "#f3f4f6",
            900: "#111827",
          },
        },
        animation: {
          fadeIn: "fadeIn 0.3s ease-in-out",
          slideUp: "slideUp 0.3s ease-out",
          "pulse-slow": "pulse 2s infinite",
        },
        keyframes: {
          fadeIn: {
            "0%": { opacity: "0", transform: "translateY(10px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          slideUp: {
            "0%": { transform: "translateY(20px)", opacity: "0" },
            "100%": { transform: "translateY(0)", opacity: "1" },
          },
        },
      },
    },
    plugins: [],
    darkMode: "class",
  };