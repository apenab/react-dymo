declare module 'react-xml-parser'

type WEB_SERVICE_PROTOCOL = 'http' | 'https'
type WEB_SERVICE_HOST = '127.0.0.1' | 'localhost'
type WEB_SERVICE_ACTION =
  | 'StatusConnected'
  | 'GetPrinters'
  | 'OpenLabelFile'
  | 'PrintLabel'
  | 'PrintLabel2'
  | 'RenderLabel'
  | 'LoadImageAsPngBase64'
  | 'GetJobStatus'
type DYMO_REQUEST = {
  wsProtocol?: WEB_SERVICE_PROTOCOL
  wsHost?: WEB_SERVICE_HOST
  wsPort?: number
  wsPath?: string
  wsAction: WEB_SERVICE_ACTION
}
