import {useState, useEffect, useRef} from "react";
import { isAbortError } from "./fetchUtils";

import {useData} from "./hooks";
import {
  dymoUrlBuilder as innerDymoUrlBuilder,
  getDymoPrintersFromXml as innerGetDymoPrintersFromXml,
  dymoRequestBuilder as innerDymoRequestBuilder,
  printLabel as innerPrintSingleLabel,
} from "./dymo_utils";

export const dymoUrlBuilder = innerDymoUrlBuilder;
export const dymoRequestBuilder = innerDymoRequestBuilder;
export const getDymoPrintersFromXml = innerGetDymoPrintersFromXml;
export const printLabel = innerPrintSingleLabel;

export function useDymoCheckService(port) {
  const [status, setStatus] = useState("initial");
  const abortControllerRef = useRef();

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setStatus("loading");
    dymoRequestBuilder({method: "GET", wsAction: "status", signal: abortControllerRef.current.signal})
      .then(() => {
        abortControllerRef.current = null;
        setStatus("success");
      })
      .catch((error) => {
        if (!isAbortError(error)) {
          setStatus("error");
        }
      });
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [port]);

  return status;
}

export function useDymoFetchPrinters(statusDymoService, modelPrinter = "LabelWriterPrinter", port) {
  const [data, setData] = useData({statusFetchPrinters: "initial", printers: [], error: null});
  const abortControllerRef = useRef();

  useEffect(() => {
    if (statusDymoService === "success") {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setData({statusFetchPrinters: "loading"});

      dymoRequestBuilder({method: "GET", wsAction: "getPrinters", signal: abortControllerRef.current.signal})
        .then((response) => {
          abortControllerRef.current = null;
          setData({
            statusFetchPrinters: "success",
            printers: getDymoPrintersFromXml(response.data, modelPrinter),
            error: null,
          });
        })
        .catch((error) => {
          if (!isAbortError(error)) {
            setData({statusFetchPrinters: "error", printers: [], error: error});
          }
        });
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [modelPrinter, port, setData, statusDymoService]);

  return data;
}

export function useDymoOpenLabel(statusDymoService, labelXML, port) {
  const [data, setData] = useData({statusOpenLabel: "initial", label: null, error: null});
  const abortControllerRef = useRef();

  useEffect(() => {
    if (statusDymoService === "success") {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setData({statusOpenLabel: "loading"});
      dymoRequestBuilder({
        method: "POST",
        wsAction: "renderLabel",
        signal: abortControllerRef.current.signal,
        data: `labelXml=${encodeURIComponent(labelXML)}&renderParamsXml=&printerName=`,
        headers: {"Access-Control-Request-Private-Network": true, "Access-Control-Allow-Origin": "*"},
      })
        .then((response) => {
          abortControllerRef.current = null;
          setData({statusOpenLabel: "success", label: response.data, error: null});
        })
        .catch((error) => {
          if (!isAbortError(error)) {
            setData({statusOpenLabel: "error", label: null, error: error});
          }
        });
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [statusDymoService, labelXML, setData, port]);

  return data;
}
