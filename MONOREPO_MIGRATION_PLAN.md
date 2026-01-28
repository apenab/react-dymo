# Monorepo Migration Plan: dymo-print-suite

## Overview

Migrar el repositorio actual `react-dymo-hooks` a un monorepo con dos paquetes:

| Paquete | Nombre NPM | Descripción |
|---------|------------|-------------|
| `core` | `@dymo-print-suite/core` | Lógica pura TypeScript para interactuar con DYMO Web Service |
| `react` | `@dymo-print-suite/react` | React hooks que utilizan el core |

## Herramientas

- **pnpm** - Package manager con workspaces
- **Vite** - Build tool para cada paquete
- **Vitest** - Testing framework
- **Changesets** - Versionado y changelog

---

## Estructura Final

```
dymo-print-suite/
├── .changeset/
│   └── config.json
├── .github/
│   └── workflows/
│       └── release.yml
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── constants.ts
│   │   │   ├── storage.ts
│   │   │   ├── dymo-service.ts      # dymo_utils.ts renombrado
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   │   ├── dymo-service.test.ts
│   │   │   └── storage.test.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── README.md
│   │
│   └── react/
│       ├── src/
│       │   ├── hooks/
│       │   │   ├── use-dymo-check-service.ts
│       │   │   ├── use-dymo-fetch-printers.ts
│       │   │   ├── use-dymo-open-label.ts
│       │   │   └── index.ts
│       │   ├── types.ts
│       │   └── index.ts
│       ├── tests/
│       │   ├── use-dymo-check-service.test.tsx
│       │   ├── use-dymo-fetch-printers.test.tsx
│       │   └── use-dymo-open-label.test.tsx
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── README.md
│
├── example/                         # App de ejemplo (se mantiene)
│   └── ...
├── package.json                     # Workspace root
├── pnpm-workspace.yaml
├── tsconfig.json                    # Base config
├── vitest.workspace.ts              # Vitest workspace config
└── README.md
```

---

## Plan de Migración

### Fase 1: Preparación del Workspace

- [x] **1.1** Instalar pnpm globalmente si no está instalado
- [x] **1.2** Crear `pnpm-workspace.yaml` en la raíz
- [x] **1.3** Actualizar `package.json` raíz como workspace root
- [x] **1.4** Crear estructura de directorios `packages/core` y `packages/react`

### Fase 2: Migrar Core Package

- [x] **2.1** Crear `packages/core/package.json`
- [x] **2.2** Crear `packages/core/tsconfig.json`
- [x] **2.3** Crear `packages/core/vite.config.ts`
- [x] **2.4** Mover archivos:
  - `src/constants.ts` → `packages/core/src/constants.ts`
  - `src/storage.ts` → `packages/core/src/storage.ts`
  - `src/dymo_utils.ts` → `packages/core/src/dymo-service.ts`
- [x] **2.5** Crear `packages/core/src/types.ts` con tipos exportados
- [x] **2.6** Crear `packages/core/src/index.ts` con exports públicos
- [x] **2.7** Mover y adaptar tests:
  - `src/dymo_utils.test.ts` → `packages/core/tests/dymo-service.test.ts`
  - `src/storage.test.ts` → `packages/core/tests/storage.test.ts`
- [x] **2.8** Reemplazar dependencia `react-xml-parser` por alternativa sin "react" en el nombre (o mantener si es necesario)
- [x] **2.9** Verificar build: `pnpm --filter @dymo-print-suite/core build`
- [x] **2.10** Verificar tests: `pnpm --filter @dymo-print-suite/core test`

### Fase 3: Migrar React Package

- [x] **3.1** Crear `packages/react/package.json` con dependencia a `@dymo-print-suite/core`
- [x] **3.2** Crear `packages/react/tsconfig.json`
- [x] **3.3** Crear `packages/react/vite.config.ts`
- [x] **3.4** Mover y refactorizar hooks:
  - `src/index.ts` → separar en archivos individuales en `packages/react/src/hooks/`
  - `src/hooks.ts` → `packages/react/src/hooks/use-data.ts`
- [x] **3.5** Actualizar imports para usar `@dymo-print-suite/core`
- [x] **3.6** Crear `packages/react/src/index.ts` con re-exports
- [x] **3.7** Mover y adaptar tests:
  - `src/index.test.tsx` → separar en tests individuales
- [x] **3.8** Verificar build: `pnpm --filter @dymo-print-suite/react build`
- [x] **3.9** Verificar tests: `pnpm --filter @dymo-print-suite/react test`

### Fase 4: Configuración de Testing

- [ ] **4.1** Crear `vitest.workspace.ts` en la raíz (alternativa actual: `vitest.config.ts` con `projects`)
- [x] **4.2** Configurar coverage para ambos paquetes
- [x] **4.3** Añadir script `test` en root que ejecuta todos los tests
- [x] **4.4** Verificar: `pnpm test` ejecuta tests de ambos paquetes

### Fase 5: Configuración de Changesets

- [x] **5.1** Actualizar `.changeset/config.json` para múltiples paquetes
- [x] **5.2** Configurar `linked` para versiones coordinadas (opcional)
- [x] **5.3** Crear changeset inicial para ambos paquetes

### Fase 6: CI/CD

- [x] **6.1** Actualizar `.github/workflows/release.yml` para pnpm
- [x] **6.2** Configurar cache de pnpm en CI
- [x] **6.3** Actualizar steps de build y test
- [x] **6.4** Configurar publicación de múltiples paquetes

### Fase 7: Example App

- [x] **7.1** Actualizar `example/package.json` para usar los nuevos paquetes
- [x] **7.2** Actualizar imports en el código de ejemplo
- [x] **7.3** Verificar que la app de ejemplo funciona

### Fase 8: Documentación

- [x] **8.1** Actualizar README.md principal
- [x] **8.2** Crear README.md para `packages/core`
- [x] **8.3** Crear README.md para `packages/react`
- [x] **8.4** Documentar guía de migración desde `react-dymo-hooks` v3/v4

### Fase 9: Limpieza

- [ ] **9.1** Eliminar archivos obsoletos de la raíz (`src/`, configs antiguos)
- [ ] **9.2** Actualizar `.gitignore`
- [ ] **9.3** Verificar que todo funciona desde cero: `rm -rf node_modules && pnpm install && pnpm build && pnpm test`

---

## Configuraciones Clave

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
  - 'example'
```

### packages/core/package.json

```json
{
  "name": "@dymo-print-suite/core",
  "version": "1.0.0",
  "description": "Core TypeScript library for DYMO Label Web Service",
  "type": "module",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.modern.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.modern.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "fast-xml-parser": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^7.x",
    "vite-plugin-dts": "^4.x",
    "vitest": "^3.x"
  }
}
```

### packages/react/package.json

```json
{
  "name": "@dymo-print-suite/react",
  "version": "1.0.0",
  "description": "React hooks for DYMO Label printing",
  "type": "module",
  "main": "./dist/index.cjs.js",
  "module": "./dist/index.modern.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.modern.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@dymo-print-suite/core": "workspace:*"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.x",
    "@types/react": "^18.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "typescript": "^5.x",
    "vite": "^7.x",
    "vite-plugin-dts": "^4.x",
    "vitest": "^3.x"
  }
}
```

### vitest.workspace.ts

```typescript
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/core',
  'packages/react',
])
```

### .changeset/config.json (actualizado)

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [["@dymo-print-suite/core", "@dymo-print-suite/react"]],
  "access": "public",
  "baseBranch": "master",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

---

## Estrategia de Testing

### Core Package Tests

| Test | Descripción |
|------|-------------|
| `dymo-service.test.ts` | Tests de `dymoRequestBuilder`, `dymoUrlBuilder`, `getDymoPrintersFromXml`, `printLabel` |
| `storage.test.ts` | Tests de `localStore`, `localRetrieve` |

### React Package Tests

| Test | Descripción |
|------|-------------|
| `use-dymo-check-service.test.tsx` | Test del hook con mocks del core |
| `use-dymo-fetch-printers.test.tsx` | Test del hook con diferentes estados |
| `use-dymo-open-label.test.tsx` | Test del hook de renderizado de labels |

### Configuración de Mocks

- Core: Mock de `fetch` global con `vi.stubGlobal`
- React: Mock de `@dymo-print-suite/core` con `vi.mock`

---

## Consideraciones de Breaking Changes

### Para usuarios de `react-dymo-hooks`

```typescript
// Antes (react-dymo-hooks v3/v4)
import { useDymoCheckService, printLabel } from 'react-dymo-hooks';

// Después - Opción 1: Solo React hooks
import { useDymoCheckService } from '@dymo-print-suite/react';
import { printLabel } from '@dymo-print-suite/core';

// Después - Opción 2: Todo desde react (re-exports)
import { useDymoCheckService, printLabel } from '@dymo-print-suite/react';
```

El paquete `@dymo-print-suite/react` re-exportará las funciones del core para facilitar la migración.

---

## Timeline Estimado

| Fase | Tareas |
|------|--------|
| Fase 1-2 | Setup workspace + Core package |
| Fase 3-4 | React package + Testing |
| Fase 5-6 | Changesets + CI/CD |
| Fase 7-9 | Example, docs, limpieza |

---

## Comandos Útiles Post-Migración

```bash
# Instalar dependencias
pnpm install

# Build todos los paquetes
pnpm build

# Build un paquete específico
pnpm --filter @dymo-print-suite/core build

# Tests todos
pnpm test

# Tests con coverage
pnpm test -- --coverage

# Crear changeset
pnpm changeset

# Version bump
pnpm changeset version

# Publicar
pnpm changeset publish
```

---

## Decisiones Pendientes

1. **¿Mantener `react-dymo-hooks` como alias?** - Podríamos publicar un paquete wrapper que simplemente re-exporta `@dymo-print-suite/react` para backwards compatibility.

2. **¿Usar `fast-xml-parser` en lugar de `react-xml-parser`?** - El nombre "react-xml-parser" es confuso para un paquete core que no usa React. `fast-xml-parser` es más popular y mantenido.

3. **¿Scope `@dymo-print-suite` o nombres simples?** - El scope agrupa los paquetes visualmente en npm, pero requiere configurar la organización en npm.
