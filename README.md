# react-dymo

> TypeScript-ready React hooks and utilities for the Dymo LabelWriter web service.

[![NPM](https://img.shields.io/npm/v/react-dymo-hooks.svg)](https://www.npmjs.com/package/react-dymo-hooks) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## v3.0.0 - Major Rewrite

This major release brings full TypeScript support, modern build tooling, and zero external HTTP dependencies.

### Breaking Changes

- **DymoPrinter interface**: Boolean properties (`isLocal`, `isTwinTurbo`, `isConnected`) are now actual booleans instead of string `"True"`/`"False"` values
- **Removed axios**: HTTP requests now use native Fetch API
  - Replace `cancelToken` with `signal` (AbortController)
  - Replace `axios.isCancel()` with `isRequestCancelled()`
  - Replace `axiosOtherParams` with `fetchOptions`
- **Response type**: `dymoRequestBuilder` returns `DymoResponse` instead of `AxiosResponse`

### New Features

- Full TypeScript support with exported types and interfaces
- Native Fetch API (~40KB smaller bundle, no axios dependency)
- AbortController for request cancellation (Web standard)
- Vite + Vitest for faster builds and tests
- Comprehensive test suite with 90%+ coverage
- Better IDE autocomplete and type checking

### Migration Guide

#### Boolean Properties

```typescript
// Before (v2.x)
if (printer.isLocal === "True") { ... }

// After (v3.x)
if (printer.isLocal === true) { ... }
// or simply: if (printer.isLocal) { ... }
```

#### Request Cancellation

```typescript
// Before (v2.x with axios)
import axios from "axios";
const source = axios.CancelToken.source();
dymoRequestBuilder({ cancelToken: source.token, ... });
if (axios.isCancel(error)) { ... }

// After (v3.x with fetch)
import { isRequestCancelled } from "react-dymo-hooks";
const controller = new AbortController();
dymoRequestBuilder({ signal: controller.signal, ... });
if (isRequestCancelled(error)) { ... }
```

## Install

```bash
npm install --save react-dymo-hooks
```

or

```bash
yarn add react-dymo-hooks
```

## API

### `printLabel()`

Print Dymo labels.

#### Arguments

- `printerName` {string} - The Dymo Printer to print on
- `labelXml` {string} - Label XML parsed to string
- `labelSetXml` {string} - Optional. LabelSet to print multiple labels with same layout but different data

#### Returns

- `Promise<DymoResponse>` - Response from the DYMO service

### `useDymoCheckService()`

Return the status of DYMO Label Web Service.

#### Arguments

- `port` {number} - Optional. The port of running DYMO Label Web Service (default: 41951)

#### Returns

- `status` - `"initial" | "loading" | "success" | "error"` Status of DYMO Label Web Service

### `useDymoFetchPrinters()`

Returns the available DYMO Labelwriter Printers.

#### Arguments

- `statusDymoService` {ServiceStatus} - The status from `useDymoCheckService()`
- `modelPrinter` {string} - Optional. The model of label writer printer (default: "LabelWriterPrinter")
- `port` {number} - Optional. The port of running DYMO Label Web Service (default: 41951)

#### Returns

Object containing:

- `statusFetchPrinters` - `"initial" | "loading" | "success" | "error"`
- `printers` - Array of `DymoPrinter` objects
- `error` - Error object if request failed

### `useDymoOpenLabel()`

Render a label preview.

#### Arguments

- `statusDymoService` {ServiceStatus} - The status from `useDymoCheckService()`
- `labelXML` {string} - Label XML content
- `port` {number} - Optional. The port of running DYMO Label Web Service (default: 41951)

#### Returns

Object containing:

- `statusOpenLabel` - `"initial" | "loading" | "success" | "error"`
- `label` - Base64 encoded PNG
- `error` - Error object if request failed

### `isRequestCancelled()`

Check if an error is a cancellation error.

#### Arguments

- `error` {any} - The error to check

#### Returns

- `boolean` - `true` if the error is a cancellation

## Run Example

From the root directory:

```bash
npm run example
```

Or manually:

```bash
cd example
npm install
npm start
```

The example app uses Vite + React 18 + TypeScript.

## TypeScript Support

The library is written in TypeScript and exports all necessary types:

```typescript
import {
  // Hooks
  useDymoCheckService,
  useDymoFetchPrinters,
  useDymoOpenLabel,

  // Functions
  printLabel,
  dymoRequestBuilder,
  dymoUrlBuilder,
  getDymoPrintersFromXml,
  isRequestCancelled,

  // Types
  DymoPrinter,
  DymoResponse,
  DymoRequestConfig,
  DymoRequestParams,
  ServiceStatus,
  FetchPrintersResult,
  OpenLabelResult,

  // Error class
  RequestCancelledError,
} from "react-dymo-hooks";

// All hooks and utilities are fully typed
const statusDymoService: ServiceStatus = useDymoCheckService();
const {printers, statusFetchPrinters, error}: FetchPrintersResult = useDymoFetchPrinters(statusDymoService);

// DymoPrinter interface with proper boolean types
printers.forEach((printer: DymoPrinter) => {
  console.log(`${printer.name}: ${printer.isConnected ? "Online" : "Offline"}`);
});
```

## Examples

### Print a Dymo Label

```tsx
import {printLabel} from "react-dymo-hooks";

async function handlePrintSingleLabel(printerName: string, labelXml: string) {
  try {
    const response = await printLabel(printerName, labelXml);
    console.info(response);
  } catch (error) {
    console.error(error);
  }
}

<button onClick={() => handlePrintLabel(printer, xml)}>Print</button>;
```

### Preview a Label

```tsx
import {useDymoOpenLabel, useDymoCheckService} from "react-dymo-hooks";

const DymoLabelPreview = ({xmlFile}: {xmlFile: string}) => {
  const statusDymoService = useDymoCheckService();
  const {label, statusOpenLabel, error} = useDymoOpenLabel(statusDymoService, xmlFile);

  if (statusOpenLabel === "loading") return <p>Loading preview...</p>;
  if (statusOpenLabel === "error") return <p>Error: {error?.message}</p>;
  if (statusOpenLabel === "success" && label) {
    return <img src={`data:image/png;base64,${label}`} alt="Label preview" />;
  }
  return null;
};
```

### List Available Printers

```tsx
import {useDymoCheckService, useDymoFetchPrinters, DymoPrinter} from "react-dymo-hooks";

const PrinterList = () => {
  const status = useDymoCheckService();
  const {printers, statusFetchPrinters} = useDymoFetchPrinters(status);

  if (statusFetchPrinters === "loading") return <p>Loading printers...</p>;
  if (statusFetchPrinters === "error") return <p>Failed to load printers</p>;

  return (
    <ul>
      {printers.map((printer: DymoPrinter) => (
        <li key={printer.name}>
          {printer.name} - {printer.isConnected ? "Connected" : "Disconnected"}
        </li>
      ))}
    </ul>
  );
};
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Build the library
npm run build

# Run example app
npm run example
```

## License

MIT © [apenab](https://github.com/apenab)
