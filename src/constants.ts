export const WS_PROTOCOL = "https://" as const;
export const WS_START_PORT = 41951 as const;
export const WS_END_PORT = 41953 as const;
export const WS_CHECK_TIMEOUT = 3e3 as const;
export const WS_COMMAND_TIMEOUT = 1e4 as const;
export const WS_SVC_HOST = "127.0.0.1" as const;
export const WS_SVC_HOST_LEGACY = "localhost" as const;
export const WS_SVC_PATH = "DYMO/DLS/Printing" as const;

export const WS_ACTIONS = {
  status: "StatusConnected",
  getPrinters: "GetPrinters",
  openLabel: "OpenLabelFile",
  printLabel: "PrintLabel",
  printLabel2: "PrintLabel2",
  renderLabel: "RenderLabel",
  loadImage: "LoadImageAsPngBase64",
  getJobStatus: "GetJobStatus",
} as const;

export type WsAction = keyof typeof WS_ACTIONS;
export type WsActionValue = typeof WS_ACTIONS[WsAction];
