import React, {useState, useMemo, memo} from "react";
import {useDymoCheckService, useDymoFetchPrinters, useDymoOpenLabel} from "react-dymo-hooks";

import {generateXmlExample} from "./utils";

const DymoLabelPreview = memo(({xml, statusDymoService, loadingComponent, errorComponent}) => {
  const {label, statusOpenLabel} = useDymoOpenLabel(statusDymoService, xml);
  const style = {background: "hsla(0, 0%, 50%, 0.66)", padding: 7};
  if (statusOpenLabel === "loading") {
    return loadingComponent;
  } else if (statusOpenLabel === "error") {
    return errorComponent;
  } else if (statusOpenLabel === "success") {
    return (
      <React.Fragment>
        <img src={"data:image/png;base64," + label} alt="dymo label preview" style={style} />
      </React.Fragment>
    );
  }
});

export default function App() {
  const statusDymoService = useDymoCheckService();
  const [name, setName] = useState("Antonio Peña Batista");
  const [address, setAddress] = useState("Headquarters 1120 N Street Sacramento");
  const {statusFetchPrinters, printers} = useDymoFetchPrinters(statusDymoService);

  const xmlMemo = useMemo(() => generateXmlExample(name, address), [address, name]);
  return (
    <div>
      {statusDymoService === "loading" && <h1>Checking dymo web service...</h1>}
      {statusDymoService === "error" && <h1>Error</h1>}
      {statusDymoService === "success" && (
        <React.Fragment>
          <h3 style={{color: "green"}}>DYMO service is running in your PC.</h3>
          <input value={name} title="Name" onChange={(e) => setName(e.target.value)} />
          <br />
          <br />
          <input value={address} title="Address" onChange={(e) => setAddress(e.target.value)} />
          <br />
          <br />
        </React.Fragment>
      )}
      <DymoLabelPreview
        xml={xmlMemo}
        statusDymoService={statusDymoService}
        loadingComponent={<h4>Loading Preview...</h4>}
        errorComponent={<h4>Error..</h4>}
      />
      {statusFetchPrinters === "loading" && <h4>Loading printers..</h4>}
      {statusFetchPrinters === "success" && (
        <React.Fragment>
          <h4>Printers:</h4>
          <ul>
            {printers.map((printer) => (
              <li key={printer.name}>{printer.name}</li>
            ))}
          </ul>
        </React.Fragment>
      )}
    </div>
  );
}
