export type WEB_SERVICE_PROTOCOL = 'http' | 'https'

export type WEB_SERVICE_HOST = '127.0.0.1' | 'localhost'

export type WebServiceAction =
  | 'StatusConnected'
  | 'GetPrinters'
  | 'OpenLabelFile'
  | 'PrintLabel'
  | 'PrintLabel2'
  | 'RenderLabel'
  | 'LoadImageAsPngBase64'
  | 'GetJobStatus'

export type DYMO_REQUEST = {
  protocol?: WEB_SERVICE_PROTOCOL
  host?: WEB_SERVICE_HOST
  port?: number
  path?: string
  options?: RequestInit
  action: WebServiceAction
}

export interface JSONResponse<TData> {
  data?: TData | null
  errors?: Array<{ message: string }> | null
}
