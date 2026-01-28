import {useState, useMemo, memo} from "react";
import {
  useDymoCheckService,
  useDymoFetchPrinters,
  useDymoOpenLabel,
  printLabel,
  ServiceStatus,
} from "@dymo-print-suite/react";

import {generateXmlExample} from "./utils";

interface DymoLabelPreviewProps {
  xml: string;
  statusDymoService: ServiceStatus;
  loadingComponent: React.ReactNode;
  errorComponent: React.ReactNode;
}

const DymoLabelPreview = memo(({xml, statusDymoService, loadingComponent, errorComponent}: DymoLabelPreviewProps) => {
  const {label, statusOpenLabel} = useDymoOpenLabel(statusDymoService, xml);
  const style = {background: "hsla(0, 0%, 50%, 0.66)", padding: 7};
  const base64Label =
    typeof label === "string" ? label.replace(/^"|"$/g, "").replace(/^data:image\/png;base64,/, "") : "";

  if (statusOpenLabel === "loading") {
    return <>{loadingComponent}</>;
  } else if (statusOpenLabel === "error") {
    return <>{errorComponent}</>;
  } else if (statusOpenLabel === "success") {
    return <img src={"data:image/png;base64," + base64Label} alt="dymo label preview" style={style} />;
  }
  return null;
});

DymoLabelPreview.displayName = "DymoLabelPreview";

export default function App() {
  const statusDymoService = useDymoCheckService();
  const {statusFetchPrinters, printers} = useDymoFetchPrinters(statusDymoService);

  const [name, setName] = useState("Antonio Peña Batista");
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);

  const xmlMemo = useMemo(() => generateXmlExample(name), [name]);

  async function handlePrintSingleLabel(printerName: string, labelXml: string) {
    try {
      const response = await printLabel(printerName, labelXml);
      console.info(response);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      {statusDymoService === "loading" && <h1>Checking dymo web service...</h1>}
      {statusDymoService === "error" && <h1>Error</h1>}
      {statusDymoService === "success" && (
        <>
          <h3 style={{color: "green"}}>DYMO service is running in your PC.</h3>
          <input value={name} title="Name" onChange={(e) => setName(e.target.value)} />
          <br />
          <br />
          <br />
          <br />
        </>
      )}
      <DymoLabelPreview
        xml={xmlMemo}
        statusDymoService={statusDymoService}
        loadingComponent={<h4>Loading Preview...</h4>}
        errorComponent={<h4>Error..</h4>}
      />
      {statusFetchPrinters === "loading" && <h4>Loading printers..</h4>}
      <br />
      {statusFetchPrinters === "success" && (
        <>
          <label htmlFor="printer-select">Choose a Dymo printer:</label>
          <br />
          <select name="printers" id="printer-select" onChange={(e) => setSelectedPrinter(e.target.value)}>
            <option value="">--Please choose an option--</option>
            {printers.map((printer) => (
              <option key={printer.name} value={printer.name}>
                {printer.name}
              </option>
            ))}
          </select>
        </>
      )}
      <br />
      <button
        disabled={!selectedPrinter}
        onClick={() => selectedPrinter && handlePrintSingleLabel(selectedPrinter, xmlMemo)}>
        Print single label
      </button>
    </div>
  );
}
