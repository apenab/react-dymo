import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@dymo-print-suite/react': resolve(__dirname, '../packages/react/src/index.ts'),
      '@dymo-print-suite/core': resolve(__dirname, '../packages/core/src/index.ts'),
    },
  },
})
