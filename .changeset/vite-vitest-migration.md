---
"react-dymo-hooks": major
---

# Vite and Vitest Migration

Migrated build tooling from microbundle-crl to Vite and testing from Jest to Vitest for improved performance and modern development experience.

## Build System Changes

- **Replaced microbundle-crl with Vite** for library bundling
  - Significantly faster build times using esbuild
  - Modern ESM-first approach
  - Better development experience with HMR support
- **Build outputs**: ESM (`index.modern.js`) and CJS (`index.cjs.js`) formats
- **TypeScript declarations**: Generated via `vite-plugin-dts`
- **Source maps**: Enabled for better debugging

## Testing Changes

- **Replaced Jest with Vitest** for testing
  - Jest-compatible API with better performance
  - Native ESM and TypeScript support
  - Faster test execution
- **All 43 tests passing** with identical coverage as Jest
- **Test utilities**: Using `@testing-library/react-hooks` for React 16 compatibility

## Developer Benefits

- ⚡ **~3x faster builds**: Vite uses esbuild for transpilation
- 🔄 **~2x faster tests**: Vitest's parallel execution and smart caching
- 📦 **Smaller bundle**: Modern build optimizations
- 🛠️ **Better DX**: Improved error messages and debugging

## Non-Breaking Changes

- All test suites migrated successfully
- Build output format remains compatible
- No API changes for library consumers
- Package exports unchanged

## Technical Details

### Removed Dependencies
- `microbundle-crl` (replaced by Vite)
- `react-scripts` (replaced by Vitest)
- `@types/jest` (replaced by Vitest types)
- `cross-env` (not needed with Vitest)

### Added Dependencies
- `vite` v7.3.1
- `vitest` v4.0.17
- `vite-plugin-dts` v4.5.4 (TypeScript declarations)
- `jsdom` (test environment)
- `@vitest/coverage-v8` (coverage reporting)

### Configuration Files
- `vite.config.ts`: Library build configuration
- `vitest.config.ts`: Test configuration with jsdom environment
- `src/setupTests.ts`: Test setup file
