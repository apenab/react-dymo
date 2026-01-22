import { useState, useEffect, useRef } from "react";
import axios, { CancelTokenSource } from "axios";

import { useData } from "./hooks";
import {
  dymoUrlBuilder as innerDymoUrlBuilder,
  getDymoPrintersFromXml as innerGetDymoPrintersFromXml,
  dymoRequestBuilder as innerDymoRequestBuilder,
  printLabel as innerPrintSingleLabel,
  DymoPrinter,
} from "./dymo_utils";

// Re-export utility functions
export const dymoUrlBuilder = innerDymoUrlBuilder;
export const dymoRequestBuilder = innerDymoRequestBuilder;
export const getDymoPrintersFromXml = innerGetDymoPrintersFromXml;
export const printLabel = innerPrintSingleLabel;

// Re-export types
export type { DymoPrinter, DymoRequestParams, DymoRequestConfig } from "./dymo_utils";

/**
 * Status of an asynchronous operation
 */
export type ServiceStatus = "initial" | "loading" | "success" | "error";

/**
 * Return type for useDymoFetchPrinters hook
 */
export interface FetchPrintersResult {
  statusFetchPrinters: ServiceStatus;
  printers: DymoPrinter[];
  error: Error | null;
}

/**
 * Return type for useDymoOpenLabel hook
 */
export interface OpenLabelResult {
  statusOpenLabel: ServiceStatus;
  label: string | null;
  error: Error | null;
}

/**
 * Hook to check if DYMO web service is running
 * @param port - Optional port number (deprecated, included for backward compatibility)
 * @returns Status of the service check
 */
export function useDymoCheckService(port?: number): ServiceStatus {
  const [status, setStatus] = useState<ServiceStatus>("initial");
  const tokenSource = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    if (tokenSource.current) {
      tokenSource.current.cancel();
    }
    tokenSource.current = axios.CancelToken.source();
    setStatus("loading");

    dymoRequestBuilder({
      method: "GET",
      wsAction: "status",
      cancelToken: tokenSource.current.token,
    })
      .then(() => {
        tokenSource.current = null;
        setStatus("success");
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setStatus("error");
        }
      });

    return () => {
      if (tokenSource.current) {
        tokenSource.current.cancel();
      }
    };
  }, [port]);

  return status;
}

/**
 * Hook to fetch available DYMO printers
 * @param statusDymoService - Status from useDymoCheckService
 * @param modelPrinter - Printer model type to filter (default: "LabelWriterPrinter")
 * @param port - Optional port number (deprecated, included for backward compatibility)
 * @returns Object containing fetch status, printers array, and error
 */
export function useDymoFetchPrinters(
  statusDymoService: ServiceStatus,
  modelPrinter: string = "LabelWriterPrinter",
  port?: number
): FetchPrintersResult {
  const [data, setData] = useData<FetchPrintersResult>({
    statusFetchPrinters: "initial",
    printers: [],
    error: null,
  });
  const tokenSource = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    if (statusDymoService === "success") {
      if (tokenSource.current) {
        tokenSource.current.cancel();
      }
      tokenSource.current = axios.CancelToken.source();
      setData({ statusFetchPrinters: "loading" });

      dymoRequestBuilder({
        method: "GET",
        wsAction: "getPrinters",
        cancelToken: tokenSource.current.token,
      })
        .then((response) => {
          tokenSource.current = null;
          setData({
            statusFetchPrinters: "success",
            printers: getDymoPrintersFromXml(response.data, modelPrinter),
            error: null,
          });
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            setData({ statusFetchPrinters: "error", printers: [], error: error });
          }
        });
    }

    return () => {
      if (tokenSource.current) {
        tokenSource.current.cancel();
      }
    };
  }, [modelPrinter, port, setData, statusDymoService]);

  return data;
}

/**
 * Hook to render a label preview
 * @param statusDymoService - Status from useDymoCheckService
 * @param labelXML - Label XML string
 * @param port - Optional port number (deprecated, included for backward compatibility)
 * @returns Object containing render status, base64 PNG label, and error
 */
export function useDymoOpenLabel(
  statusDymoService: ServiceStatus,
  labelXML: string,
  port?: number
): OpenLabelResult {
  const [data, setData] = useData<OpenLabelResult>({
    statusOpenLabel: "initial",
    label: null,
    error: null,
  });
  const tokenSource = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    if (statusDymoService === "success") {
      if (tokenSource.current) {
        tokenSource.current.cancel();
      }
      tokenSource.current = axios.CancelToken.source();
      setData({ statusOpenLabel: "loading" });

      dymoRequestBuilder({
        method: "POST",
        wsAction: "renderLabel",
        cancelToken: tokenSource.current.token,
        axiosOtherParams: {
          data: `labelXml=${encodeURIComponent(labelXML)}&renderParamsXml=&printerName=`,
        },
      })
        .then((response) => {
          tokenSource.current = null;
          setData({ statusOpenLabel: "success", label: response.data, error: null });
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            setData({ statusOpenLabel: "error", label: null, error: error });
          }
        });
    }

    return () => {
      if (tokenSource.current) {
        tokenSource.current.cancel();
      }
    };
  }, [statusDymoService, labelXML, setData, port]);

  return data;
}
