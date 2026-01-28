import { useState, useEffect, useRef } from "react";
import { dymoRequestBuilder, isRequestCancelled } from "@dymo-print-suite/core";
import type { ServiceStatus } from "../types";

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
