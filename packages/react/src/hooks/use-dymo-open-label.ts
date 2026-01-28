import { useEffect, useRef } from "react";
import { dymoRequestBuilder, isRequestCancelled } from "@dymo-print-suite/core";
import { useData } from "./use-data";
import type { ServiceStatus, OpenLabelResult } from "../types";

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
    } else {
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
      setData({ statusOpenLabel: "initial", label: null, error: null });
    }

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [statusDymoService, labelXML, setData, port]);

  return data;
}
