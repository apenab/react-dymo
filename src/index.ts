import { useState, useEffect, useRef } from "react";

import { useData } from "./hooks";
import {
  dymoUrlBuilder as innerDymoUrlBuilder,
  getDymoPrintersFromXml as innerGetDymoPrintersFromXml,
  dymoRequestBuilder as innerDymoRequestBuilder,
  printLabel as innerPrintSingleLabel,
  isRequestCancelled,
  DymoPrinter,
} from "./dymo_utils";

// Re-export utility functions
export const dymoUrlBuilder = innerDymoUrlBuilder;
export const dymoRequestBuilder = innerDymoRequestBuilder;
export const getDymoPrintersFromXml = innerGetDymoPrintersFromXml;
export const printLabel = innerPrintSingleLabel;

// Re-export types and utilities
export type { DymoPrinter, DymoRequestParams, DymoRequestConfig, DymoResponse } from "./dymo_utils";
export { RequestCancelledError, isRequestCancelled } from "./dymo_utils";

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
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    setStatus("loading");

    dymoRequestBuilder({
      method: "GET",
      wsAction: "status",
      signal: abortController.current.signal,
    })
      .then(() => {
        abortController.current = null;
        setStatus("success");
      })
      .catch((error) => {
        if (!isRequestCancelled(error)) {
          setStatus("error");
        }
      });

    return () => {
      if (abortController.current) {
        abortController.current.abort();
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
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (statusDymoService === "success") {
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();
      setData({ statusFetchPrinters: "loading" });

      dymoRequestBuilder({
        method: "GET",
        wsAction: "getPrinters",
        signal: abortController.current.signal,
      })
        .then((response) => {
          abortController.current = null;
          setData({
            statusFetchPrinters: "success",
            printers: getDymoPrintersFromXml(response.data, modelPrinter),
            error: null,
          });
        })
        .catch((error) => {
          if (!isRequestCancelled(error)) {
            setData({ statusFetchPrinters: "error", printers: [], error: error });
          }
        });
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
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
  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    if (statusDymoService === "success") {
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();
      setData({ statusOpenLabel: "loading" });

      dymoRequestBuilder({
        method: "POST",
        wsAction: "renderLabel",
        signal: abortController.current.signal,
        fetchOptions: {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `labelXml=${encodeURIComponent(labelXML)}&renderParamsXml=&printerName=`,
        },
      })
        .then((response) => {
          abortController.current = null;
          setData({ statusOpenLabel: "success", label: response.data, error: null });
        })
        .catch((error) => {
          if (!isRequestCancelled(error)) {
            setData({ statusOpenLabel: "error", label: null, error: error });
          }
        });
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [statusDymoService, labelXML, setData, port]);

  return data;
}
