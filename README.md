# react-dymo

> Collections of javascript and react utilities to handle the Dymo LabelWriter web service.

[![NPM](https://img.shields.io/npm/v/react-dymo-hooks.svg)](https://www.npmjs.com/package/react-dymo-hooks) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-dymo-hooks
```

or

```bash
yarn add react-dymo-hooks
```

## API

### `printSingleLabel()`

Print a single Dymo Label

#### Arguments

- printer {string}: The Dymo printer
- xml {string}: The Dymo label in XML format parsed to string

### `useDymoCheckService()`

Return the status of DYMO Label Web Service

#### Arguments

- port: The port of running DYMO Label Web Service. (For defualt is the 41951)

#### Returns

- status: `"initial" | "loading" | "success" | "error"` Status of DYMO Label Web Service.

### `useDymoFetchPrinters()`

Returns the available DYMO Labelwriter Printer

#### Arguments

- statusDymoService: The status of DYMO Label Web Service. (Use the status returned fot the `useDymoCheckService()` hook)
- modelPrinter: The model of label writer printer.
- port: The port of running DYMO Label Web Service. (For defualt is the 41951)

#### Returns

Object containing:

- statusFetchPrinters: `"initial" | "loading" | "success" | "error"` Status of loading printers.
- printers: The list of available DYMO Printer.
- error.

### `useDymoOpenLabel()`

Render Label

#### Arguments

- statusDymoService: The status of DYMO Label Web Service. (Use the status returned fot the `useDymoCheckService()` hook)
- labelXML: XML file.
- port: The port of running DYMO Label Web Service. (For defualt is the 41951)

#### Returns

Object containing:

- statusOpenLabel: `"initial" | "loading" | "success" | "error"` Status of open label.
- label.
- error.

## Run examples

> Inside the root directory project

1. Switch to the directory `example/`
2. `yarn install` or `npm install`
3. `yarn run start` or `npm run-script start`

## Examples

### Print a Dymo Label

```jsx
import {printSingleLabel} from "react-dymo-hooks";

async function handlePrintSingleLabel(printer, xml) {
  try {
    const response = await printSingleLabel(printer, xml);
    console.info(response);
  } catch (error) {
    console.error(error);
  }
}

<button onClick={() => handlePrintLabel(printer, xml)} />;
```

```jsx
import {useDymoOpenLabel, useDymoCheckService} from "react-dymo-hooks";

const DymoLabelPreview = () => {
  const statusDymoService = useDymoCheckService();
  const {label, statusOpenLabel, errorOpenLabel} = useDymoOpenLabel(statusDymoService, xmlFile);

  if (label) {
    return <img src={"data:image/png;base64," + label} alt="dymo label preview" />;
  } else {
    return null;
  }
};
```

## License

MIT © [apenab](https://github.com/apenab)
