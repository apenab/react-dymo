import {useState, useEffect, useRef} from "react";
import axios from "axios";

import {useData, getDymoUrl, getDymoPrintersFromXml} from "./utils";

export function useDymoCheckService(port) {
  const [status, setStatus] = useState("initial");
  const tokenSource = useRef();

  useEffect(() => {
    if (tokenSource.current) {
      tokenSource.current.cancel();
    }
    tokenSource.current = axios.CancelToken.source();
    setStatus("loading");
    axios
      .get(getDymoUrl("StatusConnected", port), {cancelToken: tokenSource.current.token})
      .then(() => {
        tokenSource.current = null;
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
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
      axios
        .get(getDymoUrl("GetPrinters", port), {cancelToken: tokenSource.current.token})
        .then((response) => {
          tokenSource.current = null;
          setData({
            statusFetchPrinters: "success",
            printers: getDymoPrintersFromXml(response.data, modelPrinter),
            error: null,
          });
        })
        .catch((error) => {
          setData({statusFetchPrinters: "error", printers: [], error: error});
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
      axios
        .request({
          method: "POST",
          url: getDymoUrl("RenderLabel", port),
          data: `labelXml=${encodeURIComponent(labelXML)}&renderParamsXml=&printerName=`,
          cancelToken: tokenSource.current.token,
        })
        .then((response) => {
          tokenSource.current = null;
          setData({statusOpenLabel: "success", label: response.data, error: null});
        })
        .catch((error) => {
          setData({statusOpenLabel: "error", label: null, error: error});
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
