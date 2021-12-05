/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  isPlainObject, asIs,
  getPropByPath, deepMerge
} from '../internal'
import { flip } from '../functional'
import { isSuccessResponse, errorToResponse } from './response'
import { adaptMultiPlatformAsync } from './environment'

import axios from 'axios'

import type { WXMINAContexts } from './environment'
import type { ResponseUnion } from './response'
import type { AxiosRequestConfig } from 'axios'

// reference: https://fetch.spec.whatwg.org/
// reference: https://axios-http.com/
// reference: https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html

interface WXRequestResult {
  data: any
}

interface BiuRequestConfig extends AxiosRequestConfig {
  responseModifier: (response: ResponseUnion) => any
  withDataExtracted: boolean
}

const commonConfig = {
  withCredentials: true,
  withDataExtracted: false,
  headers: {
    'Content-Type': 'application/json'
  }
}

/******************************************************************************************************
 *
 *                                                biu
 *
 ******************************************************************************************************/

/**
 * - use wx.request for wechat miniapp environment
 * - use axios for web or node environment
 *
 * @param config request config
 */
export const biu = async (config: BiuRequestConfig): Promise<any> => {
  if (!isPlainObject(config)) {
    throw (new TypeError('"config" is expected to be type of "object".'))
  }
  config = { ...commonConfig, ...config }

  return await adaptMultiPlatformAsync({
    forWXMINA: async ({ wxmina }: WXMINAContexts): Promise<any> => {
      return await new Promise<WXRequestResult>((resolve, reject) => {
        wxmina.request({
          dataType: 'json',
          responseType: 'text',
          ...config,
          header: {
            ...(config.headers ?? {})
          },
          success: resolve,
          fail: reject
        })
      }).then((result) => {
        return result.data
      })
    },
    forDefault: async () => await axios({
      ...config
    }).then(response => {
      if (response.status !== 200) {
        throw (new Error(`${response.status}: ${response.statusText}`))
      } else {
        return response.data
      }
    })
  })
    .then((mobiusFlavorResponse) => {
      if (!config.withDataExtracted) return mobiusFlavorResponse

      // Mobius 的 API 规范中，success 响应的数据存在深层嵌套，如：
      //  -> { status: 'success', data: { [REQUEST_TYPE]: actualData } }
      if (isSuccessResponse(mobiusFlavorResponse)) {
        // TODO: 适配多接口返回值捆绑的情况（far away | nerver）
        const type: string = getPropByPath('data.payload.type', config)
        const actualData = getPropByPath(`data.${type}`, mobiusFlavorResponse)
        mobiusFlavorResponse.data = actualData
        return { ...mobiusFlavorResponse, origin: mobiusFlavorResponse, data: actualData }
      } else {
        return mobiusFlavorResponse
      }
    })
    .then(response => {
      const responseModifier = config.responseModifier ?? asIs
      return responseModifier(response)
    })
    .catch(errorToResponse)
}

export const modifyBiuConfig = flip(deepMerge)
export const asPostRequest = modifyBiuConfig({ method: 'POST' })
export const asGetRequest = modifyBiuConfig({ method: 'GET' })
export const withJSONContent = modifyBiuConfig({ headers: { 'Content-Type': 'application/json' } })
export const withCredentials = modifyBiuConfig({ withCredentials: true })
export const withoutCredentials = modifyBiuConfig({ withCredentials: false })

/**
 * Remove redundant nestings of response data
 */
export const withDataExtracted = modifyBiuConfig({ withDataExtracted: true })
