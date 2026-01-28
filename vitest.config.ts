import { defineConfig } from 'vitest/config'

// Root config delegates to workspace projects
// Tests are defined in packages/core and packages/react
export default defineConfig({
  test: {
    globals: true,
    projects: ['packages/core', 'packages/react'],
  }
})
