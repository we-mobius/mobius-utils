import { isString, isError, isPlainObject } from '../../internal/base'
import { WXMINA_ENV_CONTEXTS } from '../environment'
import { errorToResponse } from '../response'
import { RequestEngine } from './engine.request'

import type { AnyStringRecord } from '../../@types/index'
import type { ErrorResponseData, ErrorResponse } from '../response'
import type { BiuRequestSupportEnvironments } from './const.request'
import type { BiuOptions } from './base.request'

type WXMINARequestMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE'
type WXMINARequestResponseType = 'text' | 'arraybuffer'
type WXMINARequestDataType = 'json' | 'other'

const validWXMINARequestMethod: WXMINARequestMethod[] = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE']
const validWXMINARequestResponseType: WXMINARequestResponseType[] = ['text', 'arraybuffer']
const validWXMINARequestDataType: WXMINARequestDataType[] = ['json', 'other']

const prepareWXRequestOptions = <
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
>(options: Required<BiuOptions<SuccessData, FailData, ErrorData, SendData>>): WechatMiniprogram.RequestOption => {
  const preparedOptions: WechatMiniprogram.RequestOption = { url: '' }
  const { resource, method, headers, data, responseType, dataType } = options

  preparedOptions.url = resource
  // validate method
  if (validWXMINARequestMethod.includes(method.toUpperCase() as WXMINARequestMethod)) {
    preparedOptions.method = method.toUpperCase() as WXMINARequestMethod
  } else {
    throw (new Error(`Invalid request method for "wx.request": ${method}.`))
  }
  // validata header
  preparedOptions.header = Object.entries(headers).reduce<AnyStringRecord>((acc, [name, value]) => {
    acc[name.toUpperCase()] = value
    return acc
  }, {})
  if (Object.keys(preparedOptions.header).length === 0) {
    preparedOptions.header['content-type'] = 'application/json'
  }
  // validate data
  preparedOptions.data = data
  // validate responseType
  if (validWXMINARequestResponseType.includes(responseType as WXMINARequestResponseType)) {
    preparedOptions.responseType = responseType.toLowerCase() as WXMINARequestResponseType
  } else {
    throw (new Error(`Invalid responseType for "wx.request": ${responseType}.`))
  }

  if (validWXMINARequestDataType.includes(dataType as WXMINARequestDataType)) {
    preparedOptions.dataType = dataType.toLowerCase() === 'json' ? 'json' : '其他'
  } else {
    throw (new Error(`Invalid dataType for "wx.request": ${dataType}.`))
  }

  return preparedOptions
}

/**
 * @refer https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
 */
export class WXRequestEngine<
  SuccessData extends AnyStringRecord = AnyStringRecord,
  FailData extends AnyStringRecord = AnyStringRecord,
  ErrorData extends ErrorResponseData = ErrorResponseData,
  SendData = any
> extends RequestEngine<SuccessData, FailData, ErrorData, SendData> {
  static get isRequestEngineClass (): true { return true }
  static get environment (): BiuRequestSupportEnvironments { return 'wxmina' }

  get environment (): BiuRequestSupportEnvironments { return 'wxmina' }
  sendRequest (): this {
    const { wxmina } = WXMINA_ENV_CONTEXTS
    const { dataParser, dataType: originDataType } = this._options
    const preparedOptions = prepareWXRequestOptions(this._options)

    // use validated "dataType"
    const { responseType, dataType } = preparedOptions

    void new Promise<WechatMiniprogram.RequestSuccessCallbackResult>((resolve, reject) => {
      // @refer https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
      wxmina.request({
        ...preparedOptions,
        success: resolve,
        fail: reject
      })
    }).then((response) => {
      const { cookies, data, header, profile, statusCode, errMsg } = response
      if (statusCode !== 200) {
        throw (new Error(`Non 200 statusCode: ${response.statusCode}, ${errMsg}`))
      }

      try {
        if (responseType === 'text' && dataType === 'json') {
          return data
        } else if (responseType === 'text' && dataType === '其他') {
          if (originDataType === 'json' || originDataType === 'custom') {
            return dataParser(data)
          } else {
            return data
          }
        } else if (responseType === 'arraybuffer') {
          if (originDataType === 'custom') {
            return dataParser(data)
          } else {
            return data
          }
        }
      } catch (error) {
        throw (new TypeError('Response data process failed, please check "responseType" & "dataType" & "dataParser".'))
      }
    }).then(this.formatParsedDataToResponse).catch((reason) => {
      if (isError(reason)) {
        return errorToResponse(reason) as ErrorResponse<ErrorData>
      } else if (isPlainObject(reason) && isString(reason.errMsg)) {
        return errorToResponse(new Error(reason.errMsg)) as ErrorResponse<ErrorData>
      } else {
        return errorToResponse(new Error(`Unknown error: ${String(reason)}`)) as ErrorResponse<ErrorData>
      }
    }).then((processedResponse) => {
      this._resolve(processedResponse)
    })

    return this
  }
}
