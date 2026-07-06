/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "google-sans": ['"Google Sans"', "Roboto", "Arial", "sans-serif"],
      },
      colors: {
        google: {
          blue: "#1a73e8",
          "blue-dark": "#1765cc",
          "blue-light": "#e8f0fe",
          red: "#ea4335",
          "red-dark": "#c5221f",
          green: "#137333",
          "green-light": "#e6f4ea",
          orange: "#e65100",
          yellow: "#f9ab00",
          "yellow-light": "#fff8e1",
        },
        text: {
          primary: "#202124",
          secondary: "#5f6368",
          tertiary: "#70757a",
          quaternary: "#9aa0a6",
        },
        border: {
          light: "#e8eaed",
          medium: "#dadce0",
          dark: "#bdc1c6",
        },
        bg: {
          gray: "#f1f3f4",
          "gray-light": "#f8f9fa",
          "gray-lighter": "#fafafa",
        },
      },
    },
  },
  plugins: [],
};