import forms from '@tailwindcss/forms'; // Import at the top

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          600: '#2563eb', 
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [
    forms, // Use the variable here instead of require()
  ],
}