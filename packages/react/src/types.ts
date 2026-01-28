import type { DymoPrinter } from "@dymo-print-suite/core";

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
