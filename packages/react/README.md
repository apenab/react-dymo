# @dymo-print-suite/react

React hooks for interacting with DYMO Label Web Service.
Built on top of `@dymo-print-suite/core`.

## Installation

```bash
npm install @dymo-print-suite/react
# or
pnpm add @dymo-print-suite/react
# or
yarn add @dymo-print-suite/react
```

## Quick Start

```tsx
import {
  useDymoCheckService,
  useDymoFetchPrinters,
  useDymoOpenLabel,
  printLabel,
} from "@dymo-print-suite/react";

function App() {
  const status = useDymoCheckService();
  const { printers, statusFetchPrinters } = useDymoFetchPrinters(status);

  if (status === "loading") return <p>Checking DYMO service...</p>;
  if (status === "error") return <p>DYMO service not available</p>;

  return (
    <div>
      <h1>DYMO Service Connected!</h1>
      {statusFetchPrinters === "success" && (
        <ul>
          {printers.map((p) => (
            <li key={p.name}>{p.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Hooks

### `useDymoCheckService()`

Check if the DYMO Web Service is running on the user's machine.

```tsx
const status = useDymoCheckService();
// status: "initial" | "loading" | "success" | "error"
```

**Returns:** `ServiceStatus` - Current status of the service check.

### `useDymoFetchPrinters(statusDymoService, modelPrinter?)`

Fetch available DYMO printers. Only runs when `statusDymoService` is `"success"`.

```tsx
const status = useDymoCheckService();
const { statusFetchPrinters, printers, error } = useDymoFetchPrinters(status);
```

**Parameters:**
- `statusDymoService` - Status from `useDymoCheckService()`
- `modelPrinter` - Optional. Filter by printer model (default: `"LabelWriterPrinter"`)

**Returns:** `FetchPrintersResult`
```typescript
interface FetchPrintersResult {
  statusFetchPrinters: ServiceStatus;
  printers: DymoPrinter[];
  error: Error | null;
}
```

### `useDymoOpenLabel(statusDymoService, labelXML)`

Render a label preview as a base64 PNG image.

```tsx
const status = useDymoCheckService();
const { statusOpenLabel, label, error } = useDymoOpenLabel(status, labelXml);

if (statusOpenLabel === "success" && label) {
  const base64 = label.replace(/^"|"$/g, "");
  return <img src={`data:image/png;base64,${base64}`} alt="Label preview" />;
}
```

**Parameters:**
- `statusDymoService` - Status from `useDymoCheckService()`
- `labelXML` - Label XML string

**Returns:** `OpenLabelResult`
```typescript
interface OpenLabelResult {
  statusOpenLabel: ServiceStatus;
  label: string | null;
  error: Error | null;
}
```

## Printing Labels

Use the `printLabel` function (re-exported from `@dymo-print-suite/core`):

```tsx
import { printLabel } from "@dymo-print-suite/react";

async function handlePrint(printerName: string, labelXml: string) {
  try {
    await printLabel(printerName, labelXml);
    console.log("Label printed successfully!");
  } catch (error) {
    console.error("Print failed:", error);
  }
}
```

## Complete Example

```tsx
import { useState, useMemo } from "react";
import {
  useDymoCheckService,
  useDymoFetchPrinters,
  useDymoOpenLabel,
  printLabel,
} from "@dymo-print-suite/react";

const labelTemplate = (name: string) => `<?xml version="1.0" encoding="utf-8"?>
<DieCutLabel Version="8.0" Units="twips">
  <PaperOrientation>Landscape</PaperOrientation>
  <ObjectInfo Name="Text">
    <TextObject>
      <Name>TEXT</Name>
      <StyledText>
        <String>${name}</String>
      </StyledText>
    </TextObject>
  </ObjectInfo>
</DieCutLabel>`;

export default function App() {
  const status = useDymoCheckService();
  const { printers, statusFetchPrinters } = useDymoFetchPrinters(status);
  const [name, setName] = useState("Hello World");
  const [selectedPrinter, setSelectedPrinter] = useState("");

  const labelXml = useMemo(() => labelTemplate(name), [name]);
  const { label, statusOpenLabel } = useDymoOpenLabel(status, labelXml);

  if (status === "loading") return <p>Checking DYMO service...</p>;
  if (status === "error") return <p>DYMO Web Service is not running</p>;

  return (
    <div>
      <h1>DYMO Label Printer</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter label text"
      />

      {statusOpenLabel === "success" && label && (
        <img
          src={`data:image/png;base64,${label.replace(/^"|"$/g, "")}`}
          alt="Preview"
        />
      )}

      {statusFetchPrinters === "success" && (
        <select onChange={(e) => setSelectedPrinter(e.target.value)}>
          <option value="">Select printer</option>
          {printers.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      <button
        disabled={!selectedPrinter}
        onClick={() => printLabel(selectedPrinter, labelXml)}
      >
        Print
      </button>
    </div>
  );
}
```

## Re-exported from Core

For convenience, this package re-exports everything from `@dymo-print-suite/core`:

**Functions:**
- `printLabel` - Print a label to a DYMO printer
- `dymoRequestBuilder` - Build custom requests to DYMO Web Service
- `dymoUrlBuilder` - Build URLs for DYMO Web Service
- `getDymoPrintersFromXml` - Parse printer list from XML
- `isRequestCancelled` - Check if error is a cancellation
- `localStore` / `localRetrieve` - Storage utilities

**Constants:**
- `WS_PROTOCOL`, `WS_START_PORT`, `WS_END_PORT`
- `WS_CHECK_TIMEOUT`, `WS_COMMAND_TIMEOUT`
- `WS_SVC_HOST`, `WS_SVC_HOST_LEGACY`, `WS_SVC_PATH`
- `WS_ACTIONS`

**Types:**
- `DymoPrinter`, `DymoResponse`, `DymoRequestConfig`
- `WsAction`, `WsActionValue`

## Types

```typescript
type ServiceStatus = "initial" | "loading" | "success" | "error";

interface DymoPrinter {
  name: string;
  modelName: string;
  isLocal: boolean;
  isTwinTurbo: boolean;
  isConnected: boolean;
}

interface FetchPrintersResult {
  statusFetchPrinters: ServiceStatus;
  printers: DymoPrinter[];
  error: Error | null;
}

interface OpenLabelResult {
  statusOpenLabel: ServiceStatus;
  label: string | null;
  error: Error | null;
}
```

## Migration from react-dymo-hooks

If you're migrating from `react-dymo-hooks`, update your imports:

```diff
- import { useDymoCheckService, useDymoFetchPrinters } from "react-dymo-hooks";
+ import { useDymoCheckService, useDymoFetchPrinters } from "@dymo-print-suite/react";
```

The API is fully compatible.

## License

MIT
