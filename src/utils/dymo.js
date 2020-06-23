import XMLParser from "react-xml-parser";

var WS_PROTOCOL = "https://",
  WS_START_PORT = 41951,
  WS_END_PORT = 41960,
  WS_CHECK_TIMEOUT = 3e3,
  WS_COMMAND_TIMEOUT = 1e4,
  WS_SVC_HOST = "127.0.0.1",
  WS_SVC_HOST_LEGACY = "localhost",
  WS_SVC_PATH = "DYMO/DLS/Printing",
  WS_CMD_STATUS = "StatusConnected",
  WS_CMD_GET_PRINTERS = "GetPrinters",
  WS_CMD_OPEN_LABEL = "OpenLabelFile",
  WS_CMD_PRINT_LABEL = "PrintLabel",
  WS_CMD_PRINT_LABEL2 = "PrintLabel2",
  WS_CMD_RENDER_LABEL = "RenderLabel",
  WS_CMD_LOAD_IMAGE = "LoadImageAsPngBase64",
  WS_CMD_GET_JOB_STATUS = "GetJobStatus";

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
