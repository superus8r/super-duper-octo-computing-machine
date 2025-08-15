import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Use root base in dev/preview; CI overrides base via --base in workflow
  const isDev = mode === 'development';
  return {
    plugins: [react()],
    base: isDev ? '/' : '/',
  }
})
