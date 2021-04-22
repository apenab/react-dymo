import React, { useState } from 'react'
import {
  useDymoCheckService,
  useDymoFetchPrinters,
  useDymoRenderLabel
} from 'react-dymo'

export default function App() {
  const [name, setName] = useState('Antonio Peña Batista')
  const [address, setAddress] = useState(
    'Headquarters 1120 N Street Sacramento'
  )

  const { isLoading, isSuccess, isError } = useDymoCheckService()
  const {
    isLoading: isLoadingPrinters,
    isSuccess: isSuccessPrinters,
    data: printers
  } = useDymoFetchPrinters()
  const {} = useDymoRenderLabel()

  // const xmlMemo = useMemo(() => generateXmlExample(name, address), [address, name]);
  return (
    <div>
      {isLoading && <h1>Checking dymo web service...</h1>}
      {isError && <h1>Error</h1>}
      {isSuccess && (
        <React.Fragment>
          <h3 style={{ color: 'green' }}>
            DYMO service is running in your PC.
          </h3>
          <input
            value={name}
            title='Name'
            onChange={(e) => setName(e.target.value)}
          />
          <br />
          <br />
          <input
            value={address}
            title='Address'
            onChange={(e) => setAddress(e.target.value)}
          />
          <br />
          <br />
        </React.Fragment>
      )}
      {isLoadingPrinters && <h4>Loading printers..</h4>}
      {isSuccessPrinters && (
        <React.Fragment>
          <h4>Printers:</h4>
          <ul>
            {printers.map((printer, key) => (
              <li key={key}>{printer.name}</li>
            ))}
          </ul>
        </React.Fragment>
      )}
    </div>
  )
}
