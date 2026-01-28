// Hooks
export {
  useData,
  useDymoCheckService,
  useDymoFetchPrinters,
  useDymoOpenLabel,
} from "./hooks";

// Types
export type {
  ServiceStatus,
  FetchPrintersResult,
  OpenLabelResult,
} from "./types";

// Re-export everything from core for convenience
export {
  // Constants
  WS_PROTOCOL,
  WS_START_PORT,
  WS_END_PORT,
  WS_CHECK_TIMEOUT,
  WS_COMMAND_TIMEOUT,
  WS_SVC_HOST,
  WS_SVC_HOST_LEGACY,
  WS_SVC_PATH,
  WS_ACTIONS,
  // Storage utilities
  localStore,
  localRetrieve,
  // DYMO service functions
  dymoRequestBuilder,
  dymoUrlBuilder,
  getDymoPrintersFromXml,
  printLabel,
  isRequestCancelled,
  RequestCancelledError,
} from "@dymo-print-suite/core";

// Re-export types from core
export type {
  DymoPrinter,
  DymoRequestParams,
  DymoResponse,
  DymoRequestConfig,
  WsAction,
  WsActionValue,
} from "@dymo-print-suite/core";
