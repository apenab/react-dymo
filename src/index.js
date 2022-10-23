import {useState, useEffect, useRef} from "react";
import axios from "axios";

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
  const tokenSource = useRef();

  useEffect(() => {
    if (tokenSource.current) {
      tokenSource.current.cancel();
    }
    tokenSource.current = axios.CancelToken.source();
    setStatus("loading");
    dymoRequestBuilder({method: "GET", wsAction: "status", cancelToken: tokenSource.current.token})
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

export function useDymoFetchPrinters(statusDymoService, modelPrinter = "LabelWriterPrinter", port) {
  const [data, setData] = useData({statusFetchPrinters: "initial", printers: [], error: null});
  const tokenSource = useRef();

  useEffect(() => {
    if (statusDymoService === "success") {
      if (tokenSource.current) {
        tokenSource.current.cancel();
      }
      tokenSource.current = axios.CancelToken.source();
      setData({statusFetchPrinters: "loading"});

      dymoRequestBuilder({method: "GET", wsAction: "getPrinters", cancelToken: tokenSource.current.token})
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
            setData({statusFetchPrinters: "error", printers: [], error: error});
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

export function useDymoOpenLabel(statusDymoService, labelXML, port) {
  const [data, setData] = useData({statusOpenLabel: "initial", label: null, error: null});
  const tokenSource = useRef();

  useEffect(() => {
    if (statusDymoService === "success") {
      if (tokenSource.current) {
        tokenSource.current.cancel();
      }
      tokenSource.current = axios.CancelToken.source();
      setData({statusOpenLabel: "loading"});
      dymoRequestBuilder({
        method: "POST",
        wsAction: "renderLabel",
        cancelToken: tokenSource.current.token,
        axiosOtherParams: {data: `labelXml=${encodeURIComponent(labelXML)}&renderParamsXml=&printerName=`},
        headers: {"Access-Control-Request-Private-Network": true, "Access-Control-Allow-Origin": "*"},
      })
        .then((response) => {
          tokenSource.current = null;
          setData({statusOpenLabel: "success", label: response.data, error: null});
        })
        .catch((error) => {
          if (!axios.isCancel(error)) {
            setData({statusOpenLabel: "error", label: null, error: error});
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
