import { useEffect, useRef } from "react";
import { dymoRequestBuilder, getDymoPrintersFromXml, isRequestCancelled } from "@dymo-print-suite/core";
import { useData } from "./use-data";
import type { ServiceStatus, FetchPrintersResult } from "../types";

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
    } else {
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      setData({ statusFetchPrinters: "initial", printers: [], error: null });
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [modelPrinter, port, setData, statusDymoService]);

  return data;
}
