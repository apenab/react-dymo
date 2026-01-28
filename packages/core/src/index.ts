// Constants
export {
  WS_PROTOCOL,
  WS_START_PORT,
  WS_END_PORT,
  WS_CHECK_TIMEOUT,
  WS_COMMAND_TIMEOUT,
  WS_SVC_HOST,
  WS_SVC_HOST_LEGACY,
  WS_SVC_PATH,
  WS_ACTIONS,
} from "./constants";

// Storage utilities
export { localStore, localRetrieve } from "./storage";

// DYMO service functions
export {
  dymoRequestBuilder,
  dymoUrlBuilder,
  getDymoPrintersFromXml,
  printLabel,
  isRequestCancelled,
  RequestCancelledError,
} from "./dymo-service";

// Types
export type {
  DymoPrinter,
  DymoRequestParams,
  DymoResponse,
  DymoRequestConfig,
  WsAction,
  WsActionValue,
} from "./types";
