import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'node_modules/**']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactDymoHooks',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'modern' : format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'axios', 'react-xml-parser'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    outDir: 'dist'
  }
})
