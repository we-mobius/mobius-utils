import { isObject, isPlainObject } from '../../internal/base'
import { isResponse, dataToResponse } from '../response'

import type { AnyStringRecord, ConstructorOf } from '../../@types'
import type { BiuRequestSupportEnvironments } from './const.request'
import type { ResponseUnion, ErrorResponseData } from '../response'
import type { BiuOptions } from './base.request'

interface StaticRequestEngineClass {
  /**
   * Indicate whether the class(constructor) is a request engine subclass.
   */
  isRequestEngineClass: true
  /**
   * Indicate which environment the request engine subclass is designed for.
   */
  environment: BiuRequestSupportEnvironments
}

export type ConstructorOfRequestEngine<
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
> = ConstructorOf<RequestEngine, [
  options: Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>,
  contexts: RequestEngineContexts<SuccessData, FailData, ErrorData, SendData>
]> & StaticRequestEngineClass

/**
 * @param tar anything
 * @return whether the target is a RequestEngine Class
 */
export const isRequestEngineClass = <
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
>(tar: any): tar is ConstructorOfRequestEngine<SuccessData, FailData, ErrorData, SendData> => isObject(tar) && tar.isRequestEngineClass

/**
 * @param tar anything
 * @return whether the target is a RequestEngine instance
 */
export const isRequestEngine = <
SuccessData extends AnyStringRecord = AnyStringRecord,
FailData extends AnyStringRecord = AnyStringRecord,
ErrorData extends ErrorResponseData = ErrorResponseData,
SendData = any
>(tar: any): tar is RequestEngine<SuccessData, FailData, ErrorData, SendData> => isObject(tar) && tar.isRequestEngine

export interface RequestEngineContexts<SuccessData, FailData, ErrorData, SendData> {
  resolve: (
    value: ResponseUnion<SuccessData, FailData, ErrorData> | PromiseLike<ResponseUnion<SuccessData, FailData, ErrorData>>
  ) => void
  reject: (reason?: any) => void
}

/**
 * The Request Engine base class. Every Request Engine class should extend this class.
 *
 * There are four required properties or methods to be implemented:
 *
 * @member isRequestEngineClass - should be a `static get` property that always returns `true`.
 * @member environment - should be a `static get` property that indicates which environment the engine is designed for.
 * @member environment - should be a `get` property that indicates which environment the engine is designed for.
 * @member sendRequest - should be a `method` that actually handle the request, send request described by `this._options`,
 *                       then invoke `this._resolve` or `this._reject` according to the response.
 */
export abstract class RequestEngine<
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
> {
  _options: Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>
  _resolve: RequestEngineContexts<SuccessData, FailData, ErrorData, SendData>['resolve']
  _reject: RequestEngineContexts<SuccessData, FailData, ErrorData, SendData>['reject']

  constructor (
    options: Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>,
    contexts: RequestEngineContexts<SuccessData, FailData, ErrorData, SendData>
  ) {
    this._options = options
    this._resolve = contexts.resolve
    this._reject = contexts.reject
  }

  static get isRequestEngineClass (): true { return true }
  get isRequestEngine (): true { return true }

  abstract get environment (): BiuRequestSupportEnvironments
  abstract sendRequest (): this

  formatParsedDataToResponse (parsedData: any): ResponseUnion<SuccessData, FailData, ErrorData> {
    let formattedResponse: ResponseUnion<SuccessData, FailData, ErrorData>
    if (isResponse(parsedData)) {
      formattedResponse = parsedData as ResponseUnion<SuccessData, FailData, ErrorData>
    } else if (isPlainObject(parsedData)) {
      formattedResponse = dataToResponse(parsedData as SuccessData)
    } else {
      formattedResponse = dataToResponse({ value: parsedData } as unknown as SuccessData)
    }
    return formattedResponse
  }
}
