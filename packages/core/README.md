# @dymo-print-suite/core

Core TypeScript library for interacting with DYMO Label Web Service.
Use this package when you want the DYMO helpers without React.

> **Using React?** Check out [@dymo-print-suite/react](https://www.npmjs.com/package/@dymo-print-suite/react) for ready-to-use hooks.

## Installation

```bash
npm install @dymo-print-suite/core
# or
pnpm add @dymo-print-suite/core
# or
yarn add @dymo-print-suite/core
```

## Usage

> **Note:** Examples use async/await syntax. For CommonJS or environments without top-level await, wrap calls in an async function.

### Print a Label

```typescript
import { printLabel } from "@dymo-print-suite/core";

async function print() {
  const labelXml = `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <!-- Your label XML -->
</DieCutLabel>`;

  await printLabel("DYMO LabelWriter 450", labelXml);
}

print();
```

### Build Custom Requests

```typescript
import { dymoRequestBuilder } from "@dymo-print-suite/core";

async function fetchPrinters() {
  const response = await dymoRequestBuilder({
    method: "GET",
    wsAction: "getPrinters",
  });

  console.log(response.data);
}

fetchPrinters();
```

### Parse Printer List from XML

```typescript
import { getDymoPrintersFromXml } from "@dymo-print-suite/core";

const printers = getDymoPrintersFromXml(xmlResponse, "LabelWriterPrinter");

printers.forEach((printer) => {
  console.log(`${printer.name}: ${printer.isConnected ? "Online" : "Offline"}`);
});
```

### Request Cancellation

```typescript
import { dymoRequestBuilder, isRequestCancelled } from "@dymo-print-suite/core";

async function fetchWithCancellation() {
  const controller = new AbortController();

  // Cancel after 5 seconds
  setTimeout(() => controller.abort(), 5000);

  try {
    const response = await dymoRequestBuilder({
      method: "GET",
      wsAction: "status",
      signal: controller.signal,
    });
    console.log(response.data);
  } catch (error) {
    if (isRequestCancelled(error)) {
      console.log("Request was cancelled");
    }
  }
}

fetchWithCancellation();
```

## API

### `printLabel(printerName, labelXml, labelSetXml?)`

Print a label to a DYMO printer.

- `printerName` - Name of the DYMO printer
- `labelXml` - Label XML content
- `labelSetXml` - Optional. LabelSet XML for printing multiple labels

### `dymoRequestBuilder(config)`

Build and execute requests to the DYMO web service.

```typescript
interface DymoRequestConfig {
  wsProtocol?: string;
  wsPath?: string;
  wsAction: WsAction;
  method: "GET" | "POST";
  signal?: AbortSignal;
  fetchOptions?: RequestInit;
}
```

### `dymoUrlBuilder(protocol, host, port, path, action)`

Build a URL for the DYMO web service.

### `getDymoPrintersFromXml(xml, modelPrinter)`

Parse XML response from GetPrinters endpoint into typed printer objects.

### `isRequestCancelled(error)`

Check if an error is a cancellation error.

### `localStore(key, data, timeout?)` / `localRetrieve(key, defaultValue?)`

Storage utilities with optional expiration.

## Types

```typescript
interface DymoPrinter {
  name: string;
  modelName: string;
  isLocal: boolean;
  isTwinTurbo: boolean;
  isConnected: boolean;
}

interface DymoResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  url: string;
}

type WsAction =
  | "status"
  | "getPrinters"
  | "openLabel"
  | "printLabel"
  | "printLabel2"
  | "renderLabel"
  | "loadImage"
  | "getJobStatus";
```

## Requirements

- [DYMO Label Web Service](https://www.dymo.com/support?cfid=online-support-sdk) must be installed and running
- Supported browsers: Chrome, Firefox, Edge, Safari

## Related

- [@dymo-print-suite/react](https://www.npmjs.com/package/@dymo-print-suite/react) - React hooks for DYMO printing
- [GitHub Repository](https://github.com/apenab/dymo-print-suite)

## License

MIT
