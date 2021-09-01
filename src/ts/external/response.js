/* eslint-disable camelcase */
import {
  isString, isObject, isError,
  hasOwnProperty, propEq,
  allPass
} from '../internal.js'
import { compose } from '../functional.js'

export const makeBaseResponse = ({ code, code_message, status, status_message, data }) => ({
  code: code,
  code_message: code_message,
  status: status,
  status_message: status_message || '',
  data: data || {}
})

export const formatResponseMakerFlattenArgs = (...args) => {
  const objectArgs = args.reduce((res, arg) => {
    // isError 检测应该在 isString 之前，即对于 ErrorResponse，自定义的 status_message 优先级大于 error.message
    // 检测顺序： isResponse -> isResponseCode -> isObject
    if (isResponse(arg)) {
      res = { ...arg }
    } else if (isResponseCode(arg)) {
      res = { ...res, ...arg }
    } else if (isError(arg)) {
      // 避免覆盖自定义 status_message
      res = { ...res, status_message: res.status_message || arg.message, data: { error: arg } }
    } else if (isString(arg)) {
      // 自定义 status_message 可以覆盖 error.message
      res = { ...res, status_message: arg }
    } else if (isObject(arg)) {
      res.data = res.data || {}
      res = { ...res, data: { ...res.data, ...arg } }
    } else {
      res.data = res.data || {}
      res.data.response = res.data.response || []
      res.data.response.push(arg)
    }
    return res
  }, {})
  return objectArgs
}

export const makeSuccessResponse = ({ code, code_message, status_message, data }) =>
  makeBaseResponse({ code, code_message, status: 'success', status_message, data })

export const makeFailResponse = ({ code, code_message, status_message, data }) =>
  makeBaseResponse({ code, code_message, status: 'fail', status_message, data })

export const makeErrorResponse = ({ code, code_message, status_message, data }) =>
  makeBaseResponse({ code, code_message, status: 'error', status_message, data })

export const makeUnknownResponse = ({ code, code_message, status_message, data }) => {
  console.warn(`[MobiusUtils][data] makeUnknownResponse: unknown response detected, ${JSON.stringify({ code, code_message, status_message, data })}`)
  return makeBaseResponse({ code, code_message, status: 'unknown', status_message, data })
}
export const makeSuccessResponseF = compose(makeSuccessResponse, formatResponseMakerFlattenArgs)
export const makeFailResponseF = compose(makeFailResponse, formatResponseMakerFlattenArgs)
export const makeErrorResponseF = compose(makeErrorResponse, formatResponseMakerFlattenArgs)
export const makeUnknownResponseF = compose(makeUnknownResponse, formatResponseMakerFlattenArgs)

const propStatusEq = propEq('status')
export const isResponseCode = allPass([isObject, hasOwnProperty('code'), hasOwnProperty('code_message')])
export const hasValidResponseCode = isResponseCode
export const isResponse = allPass([
  isObject,
  // hasOwnProperty('code'), hasOwnProperty('code_message'), // response code is not required
  hasOwnProperty('status'), hasOwnProperty('status_message'),
  hasOwnProperty('data')
])
export const isSuccessResponse = allPass([isResponse, propStatusEq('success')])
export const isFailResponse = allPass([isResponse, propStatusEq('fail')])
export const isErrorResponse = allPass([isResponse, propStatusEq('error')])
export const isUnknowResponse = allPass([isResponse, propStatusEq('unknown')])

export const DEFAULT_SUCCESS_RESPONSE_CODE = { code: 0, code_message: 'SUCCESS' }
export const DEFAULT_FAIL_RESPONSE_CODE = { code: 2, code_message: 'FAIL' }
export const DEFAULT_ERROR_RESPONSE_CODE = { code: 1, code_message: 'UNDIFINED_RUNTIME_ERROR' }
export const DEFAULT_UNKNOWN_RESPONSE_CODE = { code: 3, code_message: 'UNKNOWN_RESPONSE' }
export const formatSuccessResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response, ...DEFAULT_SUCCESS_RESPONSE_CODE }
  }
  return response
}
export const formatFailResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response, ...DEFAULT_FAIL_RESPONSE_CODE }
  }
  return response
}
export const formatErrorResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response, ...DEFAULT_ERROR_RESPONSE_CODE }
  }
  return response
}
export const formatUnknownResponse = response => {
  if (!hasValidResponseCode(response)) {
    response = { ...response, ...DEFAULT_UNKNOWN_RESPONSE_CODE }
  }
  return response
}
export const formatResponse = response => {
  if (isResponse(response)) {
    if (isSuccessResponse(response)) return formatSuccessResponse(response)
    if (isFailResponse(response)) return formatFailResponse(response)
    if (isErrorResponse(response)) return formatErrorResponse(response)
    if (isUnknowResponse(response)) return formatUnknownResponse(response)
  }
  if (isObject(response)) {
    return makeSuccessResponse({ ...DEFAULT_SUCCESS_RESPONSE_CODE, status_message: 'success response', data: { ...response } })
  }
  if (isString(response)) {
    return makeFailResponse({ ...DEFAULT_FAIL_RESPONSE_CODE, status_message: response, data: { response: {} } })
  }
  if (isError(response)) {
    return makeErrorResponse({ ...DEFAULT_ERROR_RESPONSE_CODE, status_message: response.message, data: { error: response } })
  }
  return makeUnknownResponse({
    ...DEFAULT_UNKNOWN_RESPONSE_CODE,
    status_message: 'So sad, unknown response occurred ;(',
    data: { response: [response] }
  })
}
