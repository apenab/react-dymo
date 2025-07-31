import XMLParser from "react-xml-parser";
import { createFetchInstance, isAbortError } from "./fetchUtils";

import {
  WS_PROTOCOL,
  WS_SVC_HOST,
  WS_SVC_HOST_LEGACY,
  WS_START_PORT,
  WS_END_PORT,
  WS_SVC_PATH,
  WS_ACTIONS,
} from "./constants";
import {localRetrieve, localStore} from "./storage";

async function storeDymoRequestParams() {
  let activeHost, activePort;
  if (localRetrieve("dymo-ws-request-params")) {
    activeHost = localRetrieve("dymo-ws-request-params").activeHost;
    activePort = localRetrieve("dymo-ws-request-params").activePort;
    window.localStorage.removeItem("dymo-ws-request-params");
  }
  const hostList = [WS_SVC_HOST, WS_SVC_HOST_LEGACY];
  loop1: for (let currentHostIndex = 0; currentHostIndex < hostList.length; currentHostIndex++) {
    loop2: for (let currentPort = WS_START_PORT; currentPort <= WS_END_PORT; currentPort++) {
      if (hostList[currentHostIndex] === activeHost && currentPort === Number.parseInt(activePort)) {
        continue loop2;
      }
      try {
        const url = dymoUrlBuilder(WS_PROTOCOL, hostList[currentHostIndex], currentPort, WS_SVC_PATH, "status");
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const [successRequestHost, successRequestPort] = url.split("/")[2].split(":");
        localStore("dymo-ws-request-params", {activeHost: successRequestHost, activePort: successRequestPort});
        break loop1;
      } catch (error) {}
    }
  }
}

export async function dymoRequestBuilder({
  wsProtocol = WS_PROTOCOL,
  wsPath = WS_SVC_PATH,
  wsAction,
  method,
  signal,
  data,
  headers = {},
}) {
  if (!localRetrieve("dymo-ws-request-params")) {
    await storeDymoRequestParams();
  }
  const {activeHost, activePort} = localRetrieve("dymo-ws-request-params");

  const dymoFetchInstance = createFetchInstance();
  
  // Add response interceptor for retry logic
  dymoFetchInstance.interceptors.response.push({
    onFulfilled: (response) => response,
    onRejected: async (error) => {
      if (isAbortError(error) || (error.response && error.response.status === 500)) {
        throw error;
      }
      
      await storeDymoRequestParams();
      if (!localRetrieve("dymo-ws-request-params")) {
        throw error;
      }
      
      try {
        const {activeHost, activePort} = localRetrieve("dymo-ws-request-params");
        const response = await fetch(
          dymoUrlBuilder(wsProtocol, activeHost, activePort, wsPath, wsAction),
          {
            method,
            signal,
            body: data,
            headers
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (retryError) {
        throw retryError;
      }
    }
  });
  const response = await dymoFetchInstance.request({
    url: dymoUrlBuilder(wsProtocol, activeHost, activePort, wsPath, wsAction),
    method,
    signal,
    data,
    headers
  });
  
  // Parse response based on content type
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    response.data = await response.json();
  } else {
    response.data = await response.text();
  }
  
  return response;
}

export function dymoUrlBuilder(wsProtocol, wsHost, wsPort, wsPath, wsAction) {
  return `${wsProtocol}${wsHost}:${wsPort}/${wsPath}/${WS_ACTIONS[wsAction]}`;
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

/**
 * Print dymo labels
 *
 * @param {string} printerName - The Dymo Printer to print on
 * @param {string} labelXml - Label XML parsed to string
 * @param {string} labelSetXml - LabelSet to print. LabelSet is used to print multiple labels with same layout but different data, e.g. multiple addresses.
 * @returns AxiosResponse
 */
export function printLabel(printerName, labelXml, labelSetXml) {
  return dymoRequestBuilder({
    method: "POST",
    wsAction: "printLabel",
    data: `printerName=${encodeURIComponent(printerName)}&printParamsXml=&labelXml=${encodeURIComponent(
      labelXml
    )}&labelSetXml=${labelSetXml || ""}`,
  });
}
