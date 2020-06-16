import XMLParser from "react-xml-parser";

export function getDymoUrl(typeDymoFunction, port = 41951) {
  return `https://localhost:${port}/DYMO/DLS/Printing/${typeDymoFunction}`;
}

// Converts the XML response thrown by the dymo service for GetPrinters in a object with the following structure
// Only return the printers type => "LabelWriterPrinters"
//   {
//      name: "",
//      modelName: "",
//      isLocal: "",
//      isTwinTurbo: "",
//      isConnected: "",
//   }
//
export function getDymoPrintersFromXml(xml, modelPrinter) {
  const xmlParse = new XMLParser().parseFromString(xml);
  const labelWritersPrinters = xmlParse.getElementsByTagName(modelPrinter);
  var printers = [];
  labelWritersPrinters.map((printer) => {
    const printerDetails = {};
    printer.children.map((item) => {
      printerDetails[item.name.charAt(0).toLowerCase() + item.name.slice(1)] = item.value;
    });
    printers.push(printerDetails);
  });
  return printers;
}
