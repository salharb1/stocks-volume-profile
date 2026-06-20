import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// `base` must match the repo name for GitHub Pages (served from
// https://<user>.github.io/stocks-volume-profile/). Stays "/" in dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/stocks-volume-profile/' : '/',
  plugins: [react()],
}))
