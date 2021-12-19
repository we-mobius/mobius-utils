/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  isString, isPlainObject, isUndefined, deepMerge
} from '../internal'
import { flip } from '../functional'
import {
  isResponse, isSuccessResponse, isFailResponse, isErrorResponse,
  dataToResponse, errorToResponse
} from './response'
import {
  isInWXMINAEnvironment, isInWebEnvironment, isInNodeEnvironment,
  WXMINA_ENV_CONTEXTS,
  adaptMultipleEnvironments
} from './environment'

import axios from 'axios'

import type { AnyStringRecord } from '../@types/index'
import type { ResponseUnion, ErrorResponse, ErrorResponseData } from './response'
import type { AxiosRequestConfig } from 'axios'

// @refer https://fetch.spec.whatwg.org/
// @refer https://axios-http.com/
//        https://github.com/axios/axios
// @refer https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html

interface WXRequestResult<T = any> {
  statusCode: number
  data: T
}

export type responseTypeOfWXRequest = 'text' | 'arraybuffer'
export type responseType = 'text' | 'json' | 'arraybuffer'
export type dataType = 'json' | 'custom' | 'other'

interface BiuOptions<SuccessData extends AnyStringRecord = AnyStringRecord, SendData = any> extends AxiosRequestConfig<SendData> {
  url: string
  data?: SendData
  responseType?: responseType
  dataType?: dataType
  dataParser?: (data: any) => SuccessData
  responseModifier?: (response: ResponseUnion<SuccessData>) => any
}

const DEFAULT_BIU_OPTIONS: Omit<BiuOptions, 'url'> = {
  responseType: 'json',
  dataType: 'json',
  dataParser: JSON.parse,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
}

/******************************************************************************************************
 *
 *                                                Biutor
 *
 ******************************************************************************************************/

/**
 *
 */
export class Biutor<
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
> {
  _options: BiuOptions<SuccessData, SendData>
  _response: Promise<ResponseUnion<SuccessData, FailData, ErrorData>>

  private readonly _resolve: (
    value: ResponseUnion<SuccessData, FailData, ErrorData> | PromiseLike<ResponseUnion<SuccessData, FailData, ErrorData>>
  ) => void

  private readonly _reject: (reason?: any) => void

  constructor (options: BiuOptions<SuccessData, SendData>) {
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }
    const preparedOptions = { ...DEFAULT_BIU_OPTIONS as BiuOptions<SuccessData, SendData>, ...options }
    this._options = preparedOptions

    let _resolve: (
      value: ResponseUnion<SuccessData, FailData, ErrorData> | PromiseLike<ResponseUnion<SuccessData, FailData, ErrorData>>
    ) => void
    let _reject: (reason?: any) => void
    this._resolve = value => _resolve(value)
    this._reject = reason => _reject(reason)
    this._response = new Promise((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })
  }

  get options (): BiuOptions<SuccessData, SendData> { return this._options }

  get response (): Promise<ResponseUnion<SuccessData>> { return this._response }
  get modifiedResponse (): Promise<any> {
    const { responseModifier } = this._options
    if (isUndefined(responseModifier)) {
      return this._response
    } else {
      return this._response.then(responseModifier)
    }
  }

  get data (): Promise<any> {
    return this._response.then(response => {
      return response.data
    })
  }

  get successData (): Promise<SuccessData> {
    let _resolve: (value: SuccessData | PromiseLike<SuccessData>) => void
    const promise = new Promise<SuccessData>((resolve, reject) => {
      _resolve = resolve
    })
    void this._response.then(response => {
      if (isSuccessResponse(response)) {
        _resolve(response.data)
      }
    })
    return promise
  }

  get failData (): Promise<FailData> {
    let _resolve: (value: FailData | PromiseLike<FailData>) => void
    const promise = new Promise<FailData>((resolve, reject) => {
      _resolve = resolve
    })
    void this._response.then(response => {
      if (isFailResponse(response)) {
        _resolve(response.data)
      }
    })
    return promise
  }

  get errorData (): Promise<ErrorData> {
    let _resolve: (value: ErrorData | PromiseLike<ErrorData>) => void
    const promise = new Promise<ErrorData>((resolve, reject) => {
      _resolve = resolve
    })
    void this._response.then(response => {
      if (isErrorResponse(response)) {
        _resolve(response.data)
      }
    })
    return promise
  }

  /**
   * Set options by key.
   */
  setOptions <K extends keyof BiuOptions<SuccessData, SendData>>(
    key: keyof BiuOptions<SuccessData, SendData>, value: BiuOptions<SuccessData, SendData>[K]
  ): this {
    this._options[key] = value
    return this
  }

  /**
   * @typeParam TD - The type of received data
   * @typeParam SD - The type of data to send
   */
  static of <
    SuccessData extends AnyStringRecord = AnyStringRecord,
    FailData extends AnyStringRecord = AnyStringRecord,
    ErrorData extends ErrorResponseData = ErrorResponseData,
    SendData = any
  >(
    options: BiuOptions<SuccessData, SendData>
  ): Biutor<SuccessData, FailData, ErrorData, SendData> {
    return new Biutor(options)
  }

  sendWXMINARequest (): this {
    if (!isInWXMINAEnvironment()) {
      throw (new Error('WXMINA environment is not detected.'))
    }
    const { wxmina } = WXMINA_ENV_CONTEXTS

    const { responseType } = this._options
    let preparedResponseType: responseTypeOfWXRequest
    if (!isUndefined(responseType) && ['text', 'arraybuffer'].includes(responseType)) {
      preparedResponseType = responseType as responseTypeOfWXRequest
    } else {
      console.warn(`"${responseType!}" is not a valid responseType for "wx.request", fallback to "text" instead.`)
      preparedResponseType = 'text'
    }

    void new Promise<WXRequestResult<ResponseUnion<SuccessData, FailData, ErrorData>>>((resolve, reject) => {
      // @refer https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
      wxmina.request({
        ...this._options,
        responseType: preparedResponseType,
        header: {
          ...(this._options.headers ?? {})
        },
        success: resolve,
        fail: reject
      } as any)
    }).then((response) => {
      const { statusCode, data } = response
      if (statusCode !== 200) {
        throw (new Error(`Non 200 statusCode: ${response.statusCode}`))
      }
      return isResponse(data) ? data : dataToResponse(data)
    }).catch(reason => {
      return errorToResponse(reason) as ErrorResponse<ErrorData>
    }).then((formattedResponse) => {
      this._resolve(formattedResponse)
    })

    return this
  }

  sendWebRequest (): this {
    if (!isInWebEnvironment()) {
      throw (new Error('Web environment is not detected.'))
    }
    this.sendDefaultRequest()
    return this
  }

  sendNodeRequest (): this {
    if (!isInNodeEnvironment()) {
      throw (new Error('Web environment is not detected.'))
    }
    this.sendDefaultRequest()
    return this
  }

  sendDefaultRequest (): this {
    const { dataType = 'json', dataParser = JSON.parse } = this._options

    const parseData = (data: any): SuccessData => {
      if (dataType === 'json' && isString(data)) {
        try {
          return dataParser(data)
        } catch (error) {
          throw (new TypeError('"data" is cannot be parsed to "JSON", please specify a different "dataType" in request options.'))
        }
      } else if (dataType === 'custom') {
        try {
          return dataParser(data)
        } catch (error) {
          throw (new TypeError('"data" of "custom" type is cannot be parsed, please specify a correct "dataParser" in request options.'))
        }
      } else {
        return data
      }
    }

    void axios.request({
      ...this._options
    }).then(axiosResponse => {
      const { status, statusText, data } = axiosResponse
      // @refer https://github.com/axios/axios#response-schema
      if (status !== 200 && statusText !== 'OK') {
        throw (new Error(`Non 200 statusCode: ${axiosResponse.status} - ${axiosResponse.statusText}`))
      }

      let formattedResponse: ResponseUnion<SuccessData, FailData, ErrorData>
      if (isResponse<SuccessData, FailData, ErrorData>(data)) {
        formattedResponse = data
      } else if (isPlainObject(data)) {
        formattedResponse = dataToResponse(data as SuccessData)
      } else {
        const parsedData = parseData(data)
        if (isPlainObject(parsedData)) {
          formattedResponse = dataToResponse(parsedData)
        } else {
          formattedResponse = dataToResponse({ value: parsedData } as unknown as SuccessData)
        }
      }

      return formattedResponse
    }).catch(reason => {
      return errorToResponse(reason) as ErrorResponse<ErrorData>
    }).then((formattedResponse) => {
      this._resolve(formattedResponse)
    })
    return this
  }

  sendRequest (): this {
    adaptMultipleEnvironments({
      forWXMINA: this.sendWXMINARequest.bind(this),
      forWeb: this.sendWebRequest.bind(this),
      forNode: this.sendNodeRequest.bind(this),
      forDefault: this.sendDefaultRequest.bind(this)
    })
    return this
  }
}

/******************************************************************************************************
 *
 *                                                biu
 *
 ******************************************************************************************************/

/**
 * - use axios for web or node environment
 * - use wx.request for wechat miniapp environment
 */
export const biu = async <SuccessData extends AnyStringRecord = AnyStringRecord, SendData extends AnyStringRecord = AnyStringRecord>(
  options: BiuOptions<SuccessData, SendData>
): Promise<ResponseUnion<SuccessData>> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"config" is expected to be type of "object".'))
  }
  const preparedOptions = { ...DEFAULT_BIU_OPTIONS as BiuOptions<SuccessData, SendData>, ...options }
  const biutor = Biutor.of(preparedOptions)

  return await biutor.sendRequest().modifiedResponse
}

export const modifyBiuConfig = flip(deepMerge)
export const asPostRequest = modifyBiuConfig({ method: 'POST' })
export const asGetRequest = modifyBiuConfig({ method: 'GET' })
export const withJSONContent = modifyBiuConfig({ headers: { 'Content-Type': 'application/json' } })
export const withCredentials = modifyBiuConfig({ withCredentials: true })
export const withoutCredentials = modifyBiuConfig({ withCredentials: false })
