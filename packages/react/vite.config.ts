import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'DymoPrintSuiteReact',
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.modern.js' : 'index.cjs.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', '@dymo-print-suite/core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@dymo-print-suite/core': 'DymoPrintSuiteCore',
        },
      },
    },
  },
})
