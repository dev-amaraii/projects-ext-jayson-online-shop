import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Static client-preview build. The production TanStack Start configuration
// remains unchanged; no checkout or server functions are exposed by this build.
export default defineConfig({
  root: 'pages-preview',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../dist/pages',
    emptyOutDir: true,
  },
})
