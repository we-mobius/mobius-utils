import { isString } from '../../internal/base'
import { errorToResponse } from '../response'
import { RequestEngine } from './engine.request'
import { WEB_ENV_CONTEXTS } from '../environment'

import type { AnyStringRecord, AnyFunction } from '../../@types'
import type { ErrorResponseData, ErrorResponse } from '../response'
import type { BiuRequestSupportEnvironments } from './const.request'
import type { BiuOptions } from './base.request'
import type { ConstructorOfRequestEngine } from './engine.request'

type FetchLike = AnyFunction | typeof fetch
type FetchOptions = RequestInit & { resource: string }

const prepareFetchOptions = <
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
>(options: Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>): FetchOptions => {
  const preparedOptions: FetchOptions = { resource: '' }
  const { resource, method, headers, body, mode, credentials, data } = options

  preparedOptions.resource = resource
  preparedOptions.method = method
  preparedOptions.headers = headers
  preparedOptions.body = ['get', 'head'].includes(method.toLowerCase()) ? undefined : body
  preparedOptions.mode = mode
  preparedOptions.credentials = credentials

  return preparedOptions
}

/**
 * @refer https://fetch.spec.whatwg.org/
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 * @refer https://developer.mozilla.org/en-US/docs/Web/API/fetch
 * @refer https://undici.nodejs.org/#/?id=undicifetchinput-init-promise
 */
export const createFetchRequestEngine = <
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
>(
    fetchLike: FetchLike, environment: BiuRequestSupportEnvironments
  ): ConstructorOfRequestEngine<SuccessData, FailData, ErrorData, SendData> => {
  const realFetch: typeof fetch = fetchLike

  return class FetchRequestEngine<
    SuccessData extends AnyStringRecord = AnyStringRecord,
    FailData extends AnyStringRecord = AnyStringRecord,
    ErrorData extends ErrorResponseData = ErrorResponseData,
    SendData = any
  > extends RequestEngine<SuccessData, FailData, ErrorData, SendData> {
    static get isRequestEngineClass (): true { return true }
    static get environment (): BiuRequestSupportEnvironments { return environment }

    get environment (): BiuRequestSupportEnvironments { return environment }

    sendRequest (): this {
      const { responseType, dataType, dataParser } = this._options

      const preparedOptions = prepareFetchOptions(this._options)

      void realFetch(preparedOptions.resource, {
        ...preparedOptions
      }).then(async (fetchResponse) => {
        const { status, statusText, ok } = fetchResponse
        if (!ok) {
          throw (new Error(`fetch is not ok: ${status} ${statusText}`))
        }
        if (status !== 200) {
          throw (new Error(`Non 200 statusCode: ${status} - ${statusText}`))
        }

        try {
          switch (responseType.toLowerCase()) {
            case 'json':
              return await fetchResponse.json()
            case 'text':
              return await fetchResponse.text()
            case 'blob':
              return await fetchResponse.blob()
            case 'arraybuffer':
              return await fetchResponse.arrayBuffer()
            case 'formdata':
              return await fetchResponse.formData()
            case 'stream':
              return fetchResponse.body
            default:
              return await fetchResponse.text()
          }
        } catch (error: any) {
          throw (new TypeError(`Response extract failed, please specify the correct "responseType". (${error.message as string})`))
        }
      }).then((exactResponse) => {
        try {
          if (dataType === 'json') {
            return isString(exactResponse) ? dataParser(exactResponse) : exactResponse
          } else if (dataType === 'custom') {
            return dataParser(exactResponse)
          } else {
            return exactResponse
          }
        } catch (error: any) {
          throw (new TypeError(`Data(${dataType}) parse failed, please check "dataType" or "dataParser". (${error.message as string})`))
        }
      }).then(this.formatParsedDataToResponse).catch((reason) => {
        return errorToResponse(reason) as ErrorResponse<ErrorData>
      }).then((processedResponse) => {
        this._resolve(processedResponse)
      })

      return this
    }
  } as any
}

export const WebFetchRequestEngine = createFetchRequestEngine(WEB_ENV_CONTEXTS.fetch, 'web')

export const createNodeFetchRequestEngine = (fetchLike: FetchLike): ConstructorOfRequestEngine =>
  createFetchRequestEngine(fetchLike, 'node')
