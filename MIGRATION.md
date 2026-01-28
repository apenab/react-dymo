# Migration guide (react-dymo-hooks -> dymo-print-suite)

This guide is for users coming from `react-dymo-hooks`.
New users should start from `README.md`.

## What changed

- React hooks moved to `@dymo-print-suite/react`.
- Core helpers live in `@dymo-print-suite/core`.
- If you want a single import, `@dymo-print-suite/react` re-exports core helpers.

## Install

```bash
pnpm add @dymo-print-suite/react
# or
npm install @dymo-print-suite/react
# or
yarn add @dymo-print-suite/react
```

Core only (no React dependency):

```bash
pnpm add @dymo-print-suite/core
# or
npm install @dymo-print-suite/core
# or
yarn add @dymo-print-suite/core
```

## Import mapping

```typescript
// Before
import { useDymoCheckService, printLabel } from "react-dymo-hooks";

// After - React hooks + core helper
import { useDymoCheckService } from "@dymo-print-suite/react";
import { printLabel } from "@dymo-print-suite/core";

// After - everything from react (re-exports core)
import { useDymoCheckService, printLabel } from "@dymo-print-suite/react";
```

## Typical usage

```tsx
import { useDymoCheckService, useDymoFetchPrinters } from "@dymo-print-suite/react";

const status = useDymoCheckService();
const { printers, statusFetchPrinters } = useDymoFetchPrinters(status);
```

```typescript
import { printLabel } from "@dymo-print-suite/core";

await printLabel("DYMO LabelWriter 450", labelXml);
```

## Next steps

- React hooks docs: `packages/react/README.md`
- Core helpers docs: `packages/core/README.md`
