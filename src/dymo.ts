/* eslint-disable no-labels */
import XMLParser from 'react-xml-parser'

export function lowercaseFirstChar(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

const cartesian = (...a: any[]) =>
  a.reduce((a: any[], b: any[]) =>
    a.flatMap((d: any) => b.map((e: any) => [d, e].flat()))
  )

// Converts the XML response thrown by the dymo service for GetPrinters in a object with the following structure
// Only return the printers type => "LabelWriterPrinters"
//   {
//      name: "",
//      modelName: "",
//      isLocal: "",
//      isTwinTurbo: "",
//      isConnected: "",
//   }
//
type DymoPrinterDetails = {
  name?: string
  modelName?: string
  isConnected?: boolean
  isLocal?: boolean
  isTwinTurbo?: boolean
}

type DymoPrinterItem = {
  name: 'Name' | 'ModelName' | 'IsConnected' | 'IsLocal' | 'IsTwinTurbo'
  value: string
}

type DymoPrinterList = DymoPrinterDetails[]

export function getDymoPrintersFromXml(
  xml: string,
  modelPrinter: string
): DymoPrinterList {
  const xmlParse = new XMLParser().parseFromString(xml)
  const labelWriterPrinters = xmlParse.getElementsByTagName(modelPrinter)
  const printers: DymoPrinterList = []

  labelWriterPrinters.map((printer: { children: DymoPrinterItem[] }) => {
    const printerDetails: DymoPrinterDetails = {}
    printer.children.map((item) => {
      printerDetails[lowercaseFirstChar(item.name)] = item.value
    })
    printers.push(printerDetails)
  })
  return printers
}

export const wsStartPort = 41951
export const wsEndPort = 41953
export const localStorageKey = 'dymo-ws'

export async function buildDymoRequest<TData = { data: any; errors: any }>({
  protocol = 'https',
  host = '127.0.0.1',
  port = wsStartPort,
  path = 'DYMO/DLS/Printing',
  action,
  options
}: DYMO_REQUEST) {
  const getURL = (host: WEB_SERVICE_HOST, port: number) =>
    `${protocol}://${host}:${port}/${path}/${action}`
  const storageHostKey = `${localStorageKey}-host`
  const storagePortKey = `${localStorageKey}-port`

  const defaultHost =
    (window.localStorage.getItem(storageHostKey) as WEB_SERVICE_HOST) || host
  const defaultPort =
    parseInt(window.localStorage.getItem(storagePortKey) || '0') || port

  let response: JSONResponse<TData> = { data: null, errors: null }
  try {
    const request = await fetch(getURL(defaultHost, defaultPort), options)
    response = await request.json()
    window.localStorage.setItem(storageHostKey, `${defaultHost}`)
    window.localStorage.setItem(storagePortKey, `${defaultPort}`)
  } catch (error) {
    const hosts = ['localhost', '127.0.0.1']
    const ports = []
    for (let index = wsStartPort; index <= wsEndPort; index++) {
      ports.push(index)
    }
    const hostsXports = cartesian(hosts, ports) // Cartesian product between two sets AxB
    const promises = hostsXports.map((item: [WEB_SERVICE_HOST, number]) =>
      fetch(getURL(item[0], item[1]))
    )
    try {
      const request = await Promise.any<Response>(promises)
      response = await request.json()
      const url = new URL(request.url)
      window.localStorage.setItem(storageHostKey, `${url.hostname}`)
      window.localStorage.setItem(storagePortKey, `${url.port}`)
    } catch (error) {
      // eslint-disable-next-line promise/param-names
      return new Promise((_resolve, reject) => {
        reject(error)
      })
    }
  }
  return response
}

// function abortableFetch(request: any, opts: any) {
//   const controller = new AbortController()
//   const signal = controller.signal

//   return {
//     abort: () => controller.abort(),
//     ready: fetch(request, { ...opts, signal })
//   }
// }
