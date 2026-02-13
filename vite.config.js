import tailwindcss from '@tailwindcss/postcss'; // Import the new v4 bridge
import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})