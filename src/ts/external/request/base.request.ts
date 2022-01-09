import {
  isPlainObject, isUndefined, asIs,
  deepMerge, once
} from '../../internal'
import { flip } from '../../functional'
import {
  isSuccessResponse, isFailResponse, isErrorResponse
} from '../response'
import {
  isInWXMINAEnvironment, isInWebEnvironment, isInNodeEnvironment,
  adaptMultipleEnvironments
} from '../environment'
import { isRequestEngineClass } from './engine.request'
import { initializeBiutor } from './initialize.request'

import type { AnyStringRecord } from '../../@types'
import type { ResponseUnion, ErrorResponseData } from '../response'
import type { BiuRequestSupportEnvironments } from './const.request'
import type { ConstructorOfRequestEngine } from './engine.request'

export type BiuRequestResource = string
export type BiuRequestMethod
  = 'get' | 'GET'
  | 'delete' | 'DELETE'
  | 'head' | 'HEAD'
  | 'options' | 'OPTIONS'
  | 'post' | 'POST'
  | 'put' | 'PUT'
  | 'patch' | 'PATCH'
  | 'purge' | 'PURGE'
  | 'link' | 'LINK'
  | 'unlink' | 'UNLINK'
export type BiuRequestHeaders = Record<string, string>
export type BiuRequestBody = ReadableStream | Blob | BufferSource | FormData | URLSearchParams | string
export type BiuRequestMode = 'cors' | 'navigate' | 'no-cors' | 'same-origin'
export type BiuRequestCredentials = 'include' | 'omit' | 'same-origin'
export type BiuResponseType = 'text' | 'json' | 'arraybuffer' | 'formdata' | 'blob' | 'stream'
export type BiuReceivedDataType = 'json' | 'custom' | 'other'

export interface BiuOptions<
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
> {
  resource: BiuRequestResource
  method?: BiuRequestMethod
  headers?: BiuRequestHeaders
  body?: BiuRequestBody
  mode?: BiuRequestMode
  credentials?: BiuRequestCredentials
  data?: SendData
  responseType?: BiuResponseType
  dataType?: BiuReceivedDataType
  dataParser?: (data: any) => SuccessData
  responseModifier?: (response: ResponseUnion<SuccessData, FailData, ErrorData>) => any
}

const DEFAULT_BIU_OPTIONS: Omit<Required<BiuOptions<any, any, any, any>>, 'resource'> = {
  method: 'GET',
  headers: { },
  body: '',
  mode: 'same-origin',
  credentials: 'include',
  data: {},
  responseType: 'json',
  dataType: 'json',
  dataParser: JSON.parse,
  responseModifier: asIs
}

/******************************************************************************************************
 *
 *                                                Biutor
 *
 ******************************************************************************************************/

/**
 *
 */
const GLOBAL_REQUEST_ENGINES: Map<BiuRequestSupportEnvironments, ConstructorOfRequestEngine> = new Map()

/**
 *
 */
export class Biutor<
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
> {
  _options: Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>
  _response: Promise<ResponseUnion<SuccessData, FailData, ErrorData>>

  private readonly _resolve: (
    value: ResponseUnion<SuccessData, FailData, ErrorData> | PromiseLike<ResponseUnion<SuccessData, FailData, ErrorData>>
  ) => void

  private readonly _reject: (reason?: any) => void

  constructor (options: BiuOptions<SuccessData, FailData, ErrorData, SendData>) {
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }
    const preparedOptions = { ...DEFAULT_BIU_OPTIONS, ...options }
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

  get options (): BiuOptions<SuccessData, FailData, ErrorData, SendData> { return this._options }

  get response (): Promise<ResponseUnion<SuccessData>> { return this._response }
  get modifiedResponse (): Promise<any> {
    const { responseModifier } = this._options
    if (isUndefined(responseModifier)) {
      return this._response
    } else {
      return this._response.then(responseModifier)
    }
  }

  get data (): Promise<SuccessData | FailData | ErrorData | AnyStringRecord> {
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
  setOptions <K extends keyof Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>>(
    key: K, value: Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>[K]
  ): this {
    this._options[key] = value
    return this
  }

  /**
   * The default request engine for environments will be resigtered automatically when script is loaded,
   *   there is no need to invoke `initialize` method manually except for reset engines to defaults.
   */
  static initialize (options: { isForceInitialize?: boolean } = {}): void {
    if (options.isForceInitialize === true) {
      initializeBiutor()
    } else {
      once(initializeBiutor, () => {
        console.warn(
          'Biutor has already been initialized, if you want to "reset" to default engines, please set "isForceInitialize" to true.'
        )
      })()
    }
  }

  static registerGlobalEngine (requestEngine: ConstructorOfRequestEngine, options: { isForceReplace?: boolean } = {}): void {
    if (!isRequestEngineClass(requestEngine)) {
      throw (new TypeError('"requestEngine" is expected to be type of "RequestEngine".'))
    }
    const targetEnvironment = requestEngine.environment
    const { isForceReplace } = options

    const currentEngine = GLOBAL_REQUEST_ENGINES.get(targetEnvironment)

    if (isUndefined(currentEngine)) {
      GLOBAL_REQUEST_ENGINES.set(targetEnvironment, requestEngine)
    } else {
      if (isForceReplace === true) {
        GLOBAL_REQUEST_ENGINES.set(targetEnvironment, requestEngine)
      } else {
        throw (new Error(`Request engine for "${targetEnvironment}" environment has already been registered,if you want to replace it, please set "isForceReplace" to true.`))
      }
    }
  }

  static of <
    SuccessData extends AnyStringRecord = AnyStringRecord,
    FailData extends AnyStringRecord = AnyStringRecord,
    ErrorData extends ErrorResponseData = ErrorResponseData,
    SendData = any
  >(
    options: BiuOptions<SuccessData, FailData, ErrorData, SendData>
  ): Biutor<SuccessData, FailData, ErrorData, SendData> {
    return new Biutor(options)
  }

  sendEnvironmentalRequest (env: BiuRequestSupportEnvironments): this {
    const EnvironmentalRequestEngine =
      GLOBAL_REQUEST_ENGINES.get(env) as ConstructorOfRequestEngine<SuccessData, FailData, ErrorData> | undefined

    if (isUndefined(EnvironmentalRequestEngine)) {
      throw (new Error(`Request engine for "${env}" environment has not been registered.`))
    }

    const engineInstance = new EnvironmentalRequestEngine(this._options, { resolve: this._resolve, reject: this._reject })
    engineInstance.sendRequest()

    return this
  }

  sendWXMINARequest (): this {
    if (!isInWXMINAEnvironment()) {
      throw (new Error('WXMINA environment is not detected.'))
    }
    this.sendEnvironmentalRequest('wxmina')
    return this
  }

  sendWebRequest (): this {
    if (!isInWebEnvironment()) {
      throw (new Error('Web environment is not detected.'))
    }
    this.sendEnvironmentalRequest('web')
    return this
  }

  sendNodeRequest (): this {
    if (!isInNodeEnvironment()) {
      throw (new Error('Node environment is not detected.'))
    }
    try {
      this.sendEnvironmentalRequest('node')
    } catch (error) {
      console.warn('There is no default request engine for "node" environment, please register one manually, "Undici" is recommended.')
      throw error
    }
    return this
  }

  sendDefaultRequest (): this {
    try {
      this.sendEnvironmentalRequest('node')
    } catch (error) {
      console.warn('There is no default request engine for "default"(catch-all) environment, please register one manually.')
      throw error
    }
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
// initialize default request engines for environments automatically
Biutor.initialize()

/******************************************************************************************************
 *
 *                                                biu
 *
 ******************************************************************************************************/

/**
 * - use fetch for web or node environment
 * - use wx.request for wechat miniapp environment
 * - other environment need to register a request engine manually
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
