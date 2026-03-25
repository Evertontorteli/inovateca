import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configuração do Vite: plugins React e Tailwind para desenvolvimento e build.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
