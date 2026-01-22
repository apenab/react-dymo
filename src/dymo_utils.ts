import axios, { AxiosRequestConfig, AxiosResponse, CancelToken } from "axios";
import XMLParser from "react-xml-parser";

import {
  WS_PROTOCOL,
  WS_SVC_HOST,
  WS_SVC_HOST_LEGACY,
  WS_START_PORT,
  WS_END_PORT,
  WS_SVC_PATH,
  WS_ACTIONS,
  WsAction,
} from "./constants";
import { localRetrieve, localStore } from "./storage";

/**
 * Represents a DYMO printer with its properties
 */
export interface DymoPrinter {
  name: string;
  modelName: string;
  isLocal: boolean;
  isTwinTurbo: boolean;
  isConnected: boolean;
}

/**
 * Stored connection parameters for DYMO web service
 */
export interface DymoRequestParams {
  activeHost: string;
  activePort: string;
}

/**
 * Configuration options for building DYMO requests
 */
export interface DymoRequestConfig {
  wsProtocol?: string;
  wsPath?: string;
  wsAction: WsAction;
  method: "GET" | "POST";
  cancelToken?: CancelToken;
  axiosOtherParams?: Partial<AxiosRequestConfig>;
}

/**
 * Discovers and stores the active DYMO web service host and port
 * Tries multiple hosts and ports until a successful connection is made
 */
async function storeDymoRequestParams(): Promise<void> {
  let activeHost: string | undefined;
  let activePort: string | undefined;

  const cachedParams = localRetrieve<DymoRequestParams>("dymo-ws-request-params");
  if (cachedParams) {
    activeHost = cachedParams.activeHost;
    activePort = cachedParams.activePort;
    window.localStorage.removeItem("dymo-ws-request-params");
  }

  const hostList = [WS_SVC_HOST, WS_SVC_HOST_LEGACY];

  loop1: for (
    let currentHostIndex = 0;
    currentHostIndex < hostList.length;
    currentHostIndex++
  ) {
    loop2: for (let currentPort = WS_START_PORT; currentPort <= WS_END_PORT; currentPort++) {
      if (
        hostList[currentHostIndex] === activeHost &&
        currentPort === Number.parseInt(activePort || "0")
      ) {
        continue loop2;
      }

      try {
        const response = await axios.get<string>(
          dymoUrlBuilder(WS_PROTOCOL, hostList[currentHostIndex], currentPort, WS_SVC_PATH, "status")
        );

        const [successRequestHost, successRequestPort] = response.config.url!.split("/")[2].split(":");
        localStore("dymo-ws-request-params", {
          activeHost: successRequestHost,
          activePort: successRequestPort,
        });
        break loop1;
      } catch (error) {
        // Continue trying other hosts/ports
      }
    }
  }
}

/**
 * Builds and executes axios requests to the DYMO web service
 * Automatically discovers the service location and retries on failure
 * @param config - Request configuration
 * @returns Axios response
 */
export async function dymoRequestBuilder(
  config: DymoRequestConfig
): Promise<AxiosResponse<any>> {
  const {
    wsProtocol = WS_PROTOCOL,
    wsPath = WS_SVC_PATH,
    wsAction,
    method,
    cancelToken,
    axiosOtherParams = {},
  } = config;

  if (!localRetrieve<DymoRequestParams>("dymo-ws-request-params")) {
    await storeDymoRequestParams();
  }

  const params = localRetrieve<DymoRequestParams>("dymo-ws-request-params");
  if (!params) {
    throw new Error("Unable to connect to DYMO web service");
  }

  const { activeHost, activePort } = params;

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

      const retryParams = localRetrieve<DymoRequestParams>("dymo-ws-request-params");
      if (!retryParams) {
        return Promise.reject(error);
      }

      try {
        const { activeHost, activePort } = retryParams;
        const response = await axios.request({
          url: dymoUrlBuilder(wsProtocol, activeHost, Number(activePort), wsPath, wsAction),
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
    url: dymoUrlBuilder(wsProtocol, activeHost, Number(activePort), wsPath, wsAction),
    method,
    cancelToken,
    ...axiosOtherParams,
  });

  return request;
}

/**
 * Builds a URL for the DYMO web service
 * @param wsProtocol - Protocol (http:// or https://)
 * @param wsHost - Host address
 * @param wsPort - Port number
 * @param wsPath - API path
 * @param wsAction - Action name
 * @returns Complete URL string
 */
export function dymoUrlBuilder(
  wsProtocol: string,
  wsHost: string,
  wsPort: number,
  wsPath: string,
  wsAction: WsAction
): string {
  return `${wsProtocol}${wsHost}:${wsPort}/${wsPath}/${WS_ACTIONS[wsAction]}`;
}

/**
 * Converts XML response from DYMO GetPrinters endpoint to an array of printer objects
 * @param xml - XML string response from DYMO service
 * @param modelPrinter - Printer model type to filter (e.g., "LabelWriterPrinter")
 * @returns Array of printer objects with boolean properties
 */
export function getDymoPrintersFromXml(xml: string, modelPrinter: string): DymoPrinter[] {
  const xmlParse = new XMLParser().parseFromString(xml);
  const labelWritersPrinters = xmlParse.getElementsByTagName(modelPrinter);
  const printers: DymoPrinter[] = [];

  labelWritersPrinters.map((printer) => {
    const printerDetails: Record<string, any> = {};
    printer.children.map((item) => {
      const key = item.name.charAt(0).toLowerCase() + item.name.slice(1);
      // Convert "True"/"False" strings to actual booleans
      if (item.value === "True" || item.value === "False") {
        printerDetails[key] = item.value === "True";
      } else {
        printerDetails[key] = item.value;
      }
    });
    printers.push(printerDetails as DymoPrinter);
  });

  return printers;
}

/**
 * Print DYMO labels
 * @param printerName - The DYMO Printer to print on
 * @param labelXml - Label XML parsed to string
 * @param labelSetXml - LabelSet to print. LabelSet is used to print multiple labels with same layout but different data
 * @returns Axios response
 */
export function printLabel(
  printerName: string,
  labelXml: string,
  labelSetXml?: string
): Promise<AxiosResponse<any>> {
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
