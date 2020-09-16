const { isObject, isError } = require('./base.js')
const { hasOwnProperty, propEq } = require('./object.js')
const { allPass } = require('./boolean.js')

exports.isPhoneNum = v => /^1[3-9]\d{9}$/.test(v)
exports.isTelNum = v => /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(v)
exports.isQQId = v => /^[1-9][0-9]{4,10}$/.test(v)
exports.isEmailAddress = v => /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(v)

const makeBaseResponse = status => ({
  status: status,
  status_message: '',
  data: {}
})
exports.makeBaseResponse = makeBaseResponse

const makeSuccessResponse = (data, message = '') => {
  const response = makeBaseResponse('success')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}
exports.makeSuccessResponse = makeSuccessResponse

const makeFailResponse = (message, data = {}) => {
  const response = makeBaseResponse('fail')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}
exports.makeFailResponse = makeFailResponse

const makeErrorResponse = (message, data = {}) => {
  const response = makeBaseResponse('error')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}
exports.makeErrorResponse = makeErrorResponse

const makeUnknownResponse = (message, data = {}) => {
  const response = makeBaseResponse('unknown')
  response.status_message = message
  response.data = { ...response.data, ...data }
  return response
}
exports.makeUnknownResponse = makeUnknownResponse

const propStatusEq = propEq('status')
const isResponse = allPass([isObject, hasOwnProperty('status'), hasOwnProperty('status_message'), hasOwnProperty('data')])
exports.isSuccessResponse = allPass([isResponse, propStatusEq('success')])
exports.isFailResponse = allPass([isResponse, propStatusEq('fail')])
exports.isErrorResponse = allPass([isResponse, propStatusEq('error')])
exports.isUnknowResponse = allPass([isResponse, propStatusEq('unknown')])

exports.formatResponse = response => {
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
