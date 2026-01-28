# dymo-print-suite

[![npm version](https://img.shields.io/npm/v/@dymo-print-suite/react.svg)](https://www.npmjs.com/package/@dymo-print-suite/react)
[![npm version](https://img.shields.io/npm/v/@dymo-print-suite/core.svg)](https://www.npmjs.com/package/@dymo-print-suite/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

TypeScript-first toolkit to interact with DYMO LabelWriter printers via the DYMO Web Service.

## Features

- **Typed helpers** - XML request/response handling with full TypeScript support
- **React hooks** - Easy integration with React applications
- **Abortable requests** - Cancel pending requests with AbortController
- **Printer discovery** - Enumerate available DYMO printers
- **Label preview** - Render labels as PNG images before printing

## Packages

| Package | Description | Docs |
|---------|-------------|------|
| [@dymo-print-suite/core](https://www.npmjs.com/package/@dymo-print-suite/core) | TypeScript utilities (no React dependency) | [README](./packages/core/README.md) |
| [@dymo-print-suite/react](https://www.npmjs.com/package/@dymo-print-suite/react) | React hooks + re-exports from core | [README](./packages/react/README.md) |

## Installation

**For React projects:**

```bash
npm install @dymo-print-suite/react
# or
pnpm add @dymo-print-suite/react
```

**For non-React projects:**

```bash
npm install @dymo-print-suite/core
# or
pnpm add @dymo-print-suite/core
```

## Quick Start

### React

```tsx
import {
  useDymoCheckService,
  useDymoFetchPrinters,
  printLabel,
} from "@dymo-print-suite/react";

function App() {
  const status = useDymoCheckService();
  const { printers, statusFetchPrinters } = useDymoFetchPrinters(status);

  if (status === "loading") return <p>Checking DYMO service...</p>;
  if (status === "error") return <p>DYMO service not available</p>;

  return (
    <div>
      <h1>Available Printers</h1>
      {statusFetchPrinters === "success" && (
        <ul>
          {printers.map((p) => (
            <li key={p.name}>
              {p.name}
              <button onClick={() => printLabel(p.name, labelXml)}>
                Print
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Core (non-React)

```typescript
import { dymoRequestBuilder, printLabel } from "@dymo-print-suite/core";

// Check service status
const response = await dymoRequestBuilder({
  method: "GET",
  wsAction: "status",
});

// Print a label
await printLabel("DYMO LabelWriter 450", labelXml);
```

## Migration from react-dymo-hooks

If you were using `react-dymo-hooks`, update your imports:

```diff
- import { useDymoCheckService, printLabel } from "react-dymo-hooks";
+ import { useDymoCheckService, printLabel } from "@dymo-print-suite/react";
```

The API remains compatible. See [MIGRATION.md](./MIGRATION.md) for details.

## Documentation

- **Core API**: [packages/core/README.md](./packages/core/README.md) - Full API reference for TypeScript utilities
- **React Hooks**: [packages/react/README.md](./packages/react/README.md) - Hook documentation with examples

## Example App

```bash
pnpm install
pnpm --filter dymo-print-suite-example dev
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Requirements

- DYMO Label Web Service must be installed and running on the user's machine
- Supported browsers: Chrome, Firefox, Edge, Safari

## License

MIT © [apenab](https://github.com/apenab)
