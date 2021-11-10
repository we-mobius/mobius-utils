import {
  isObject, isFunction, asIs,
  get, hardDeepMerge
} from '../internal'
import { flip } from '../functional'
import { isSuccessResponse, makeErrorResponseF } from './response'
import { wxmina, adaptMultiPlatform } from './environment'
import axios from 'axios'

export { axios }

/***************************************************************
 *                            biu
 ***************************************************************/

const _commonDefaultConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
}

// biu(config)
// biu(modifier, config)
// biu(config, modifier)
// NOTE: 在没有指定 responseModifier 的情况下，通过 biu 拿到的一定是格式良好的 response
// WARN: 即使是指定 responseModifier，也并不推荐 modifier 修改 response 的数据结构
export const biu = (config, _) => {
  if (isFunction(_)) {
    config = _(config || {})
  }
  if (isFunction(config)) {
    config = config(_ || {})
  }
  if (!isObject(config)) {
    throw TypeError('Config is expected to be an object, please check your config or config modifier whick should return an config object.')
  }
  config = { ..._commonDefaultConfig, ...config }
  return new Promise((resolve, reject) => {
    const _useAxios = () => {
      axios({
        ...config
      })
        .then(response => {
          if (response.status !== 200) {
            reject(new Error(`${response.status}: ${response.statusText}`))
          }
          return response
        })
        .then(resolve)
        .catch(reject)
    }
    const _useWxRequest = () => {
      try {
        // @see https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html
        wxmina.request({
          dataType: 'json',
          responseType: 'text',
          ...config,
          header: {
            ...(config.headers || {})
          },
          success: resolve,
          fail: reject
        })
      } catch (e) {
        reject(e)
      }
    }
    adaptMultiPlatform({
      webFn: _useAxios,
      nodeFn: _useAxios,
      wxminaFn: _useWxRequest
    })
  })
    .then(result => {
      if (!config.withDataExtracted) return result
      if (!result.data) return makeErrorResponseF(new Error('There is no "data" field in request result.'))

      const response = result.data
      if (isSuccessResponse(response)) {
        // TODO: 适配多接口返回值捆绑的情况（far away | nerver）
        const type = get(config, 'data.payload.type')
        const actualData = get(response, `data.${type}`)
        if (type && actualData) {
          response.data = actualData
        }
      }

      return response
    })
    .then(response => {
      const responseModifier = config.responseModifier || asIs
      return responseModifier(response)
    })
    .catch(makeErrorResponseF)
}
export const modifyBiuConfig = flip(hardDeepMerge) // or: obj => hardDeepMerge(_, obj)
// biu(equiped(asPostRequest)({ url: 'https://example.com' }))
// biu(equiped(asPostRequest), { url: 'https://example.com' })
// biu({ url: 'https://example.com' }, equiped(asPostRequest))
export const asPostRequest = modifyBiuConfig({ method: 'POST' })
export const asGetRequest = modifyBiuConfig({ method: 'GET' })
export const withJSONContent = modifyBiuConfig({ headers: { 'Content-Type': 'application/json' } })
export const withCredentials = modifyBiuConfig({ withCredentials: true })
export const withoutCredentials = modifyBiuConfig({ withCredentials: false })

// Mobius 的 API 规范中，success 响应的数据存在深层嵌套，如:
//  -> { status: 'success', data: { [REQUEST_TYPE]: actualData } }
// withDataExtracted 可以将冗余嵌套移除
export const withDataExtracted = modifyBiuConfig({ withDataExtracted: true })
