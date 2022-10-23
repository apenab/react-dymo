import axios from "axios";
import XMLParser from "react-xml-parser";

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
        const response = await axios.get(
          dymoUrlBuilder(WS_PROTOCOL, hostList[currentHostIndex], currentPort, WS_SVC_PATH, "status")
        );
        const [successRequestHost, successRequestPort] = response.config.url.split("/")[2].split(":");
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
  cancelToken,
  axiosOtherParams = {},
}) {
  if (!localRetrieve("dymo-ws-request-params")) {
    await storeDymoRequestParams();
  }
  const {activeHost, activePort} = localRetrieve("dymo-ws-request-params");

  const dymoAxiosInstance = axios.create();
  dymoAxiosInstance.interceptors.response.use(
    function (response) {
      return response;
    },
    async function (error) {
      if (axios.isCancel(error) || error?.response?.status === 500) {
        return Promise.reject(error);
      }
      await storeDymoRequestParams();
      if (!localRetrieve("dymo-ws-request-params")) {
        return Promise.reject(error);
      }
      try {
        const {activeHost, activePort} = localRetrieve("dymo-ws-request-params");
        const response = await axios.request({
          url: dymoUrlBuilder(wsProtocol, activeHost, activePort, wsPath, wsAction),
          method,
          cancelToken,
          ...axiosOtherParams,
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  );
  const request = await dymoAxiosInstance.request({
    url: dymoUrlBuilder(wsProtocol, activeHost, activePort, wsPath, wsAction),
    method,
    cancelToken,
    ...axiosOtherParams,
  });
  return request;
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
    axiosOtherParams: {
      data: `printerName=${encodeURIComponent(printerName)}&printParamsXml=&labelXml=${encodeURIComponent(
        labelXml
      )}&labelSetXml=${labelSetXml || ""}`,
    },
  });
}
