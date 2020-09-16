import { isObject, isError } from './base.js'
import { hasOwnProperty, propEq } from './object.js'
import { allPass } from './boolean.js'

export const isPhoneNum = v => /^1[3-9]\d{9}$/.test(v)
export const isTelNum = v => /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(v)
export const isQQId = v => /^[1-9][0-9]{4,10}$/.test(v)
export const isEmailAddress = v => /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(v)

export const makeBaseResponse = status => ({
  status: status,
  status_message: '',
  data: {}
})

export const makeSuccessResponse = (data, message = '') => {
  const response = makeBaseResponse('success')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}

export const makeFailResponse = (message, data = {}) => {
  const response = makeBaseResponse('fail')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}

export const makeErrorResponse = (message, data = {}) => {
  const response = makeBaseResponse('error')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}

export const makeUnknownResponse = (message, data = {}) => {
  const response = makeBaseResponse('unknown')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}

const propStatusEq = propEq('status')
export const isResponse = allPass([isObject, hasOwnProperty('status'), hasOwnProperty('status_message'), hasOwnProperty('data')])
export const isSuccessResponse = allPass([isResponse, propStatusEq('success')])
export const isFailResponse = allPass([isResponse, propStatusEq('fail')])
export const isErrorResponse = allPass([isResponse, propStatusEq('error')])
export const isUnknowResponse = allPass([isResponse, propStatusEq('unknown')])

export const formatResponse = response => {
  if (isResponse(response)) {
    return response
  }
  if (isError(response)) {
    return makeErrorResponse(response.message)
  }
  if (isObject(response)) {
    return makeSuccessResponse(response)
  }
  return makeUnknownResponse('So sad, unknown response occurred ;(', { details: response })
}
