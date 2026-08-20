import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Assets are loaded over file:// from the packaged app, so paths in
  // index.html must be relative — the default '/' base resolves to the
  // filesystem root and the window comes up blank.
  base: './',
  plugins: [react(), tailwindcss()],
})
