import { useEffect, useCallback, useReducer } from 'react'
import produce from 'immer'

import { buildDymoRequest, getDymoPrintersFromXml } from './dymo'

type DymoRenderLabel = {
  onSuccess?: (arg0: any) => any
  onError?: (arg0: any) => any
}

interface DymoRenderLabelResponse extends FetchState {
  rawLabel: string
  imageLabel: string
  renderLabel: (arg0: string) => void
}

type WebServiceAction =
  | 'StatusConnected'
  | 'GetPrinters'
  | 'OpenLabelFile'
  | 'PrintLabel'
  | 'PrintLabel2'
  | 'RenderLabel'
  | 'LoadImageAsPngBase64'
  | 'GetJobStatus'

interface FetchState {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: any
  error: any
}

interface FetchAction {
  type: 'ON_START_FETCH' | 'ON_SUCCESS_FETCH' | 'ON_FAIL_FETCH'
  data?: any
}

const initialState: FetchState = {
  status: 'idle',
  data: null,
  error: null
}

export function reducer(state: FetchState, action: FetchAction) {
  switch (action.type) {
    case 'ON_START_FETCH':
      return produce(state, (draftState: FetchState) => {
        draftState.status = 'loading'
        draftState.error = null
        draftState.data = null
      })
    case 'ON_SUCCESS_FETCH':
      return produce(state, (draftState: FetchState) => {
        draftState.status = 'success'
        draftState.error = null
        draftState.data = action.data
      })
    case 'ON_FAIL_FETCH':
      return produce(state, (draftState: FetchState) => {
        draftState.status = 'error'
        draftState.error = action.data
        draftState.data = null
      })
    default:
      throw new Error()
  }
}

export function useDymoQuery(action: WebServiceAction) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const execute = useCallback(async () => {
    dispatch({ type: 'ON_START_FETCH' })
    try {
      const response = await buildDymoRequest({
        action: action
      })
      dispatch({
        type: 'ON_SUCCESS_FETCH',
        data: response
      })
    } catch (error) {
      dispatch({ type: 'ON_FAIL_FETCH', data: error })
    }
  }, [action])

  useEffect(() => {
    execute()
  }, [execute])

  const isLoading = ['idle', 'loading'].includes(state.status)
  const isSuccess = state.status === 'success'
  const isError = state.status === 'error'

  return { ...state, isLoading, isSuccess, isError }
}

export function useDymoCheckService() {
  return useDymoQuery('StatusConnected')
}

export function useDymoFetchPrinters(modelPrinter = 'LabelWriterPrinter') {
  const response = useDymoQuery('GetPrinters')
  let newData = null
  if (response.isSuccess) {
    newData = getDymoPrintersFromXml(response.data, modelPrinter)
  }
  return { ...response, data: newData || [] }
}

export function useDymoRenderLabel({
  onSuccess = (value) => value,
  onError = (value) => value
}: DymoRenderLabel): DymoRenderLabelResponse {
  const [state, dispatch] = useReducer(reducer, initialState)

  async function renderLabel(xml: string) {
    dispatch({ type: 'ON_START_FETCH' })
    try {
      const response = await buildDymoRequest({
        action: 'RenderLabel',
        options: {
          method: 'POST',
          body: `labelXml=${encodeURIComponent(
            xml
          )}&renderParamsXml=&printerName=`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      })
      dispatch({
        type: 'ON_SUCCESS_FETCH',
        data: response
      })
      onSuccess(response)
    } catch (error) {
      dispatch({ type: 'ON_FAIL_FETCH', data: error })
      onError(error)
    }
  }

  return {
    rawLabel: state.data,
    imageLabel: `data:image/png;base64,${state.data}`,
    renderLabel,
    ...state
  }
}
