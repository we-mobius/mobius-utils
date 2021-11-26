/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { isNumber, isString, isPlainObject } from '../internal/base'

export enum ResponseStatus {
  success = 'success',
  fail = 'fail',
  error = 'error',
  unknown = 'unknown'
}
export interface ResponseCode {
  code: number
  codeMessage: string
}
export interface BaseResponse extends ResponseCode {
  status: ResponseStatus
  statusMessage: string
  data: Record<string, any>
}
export interface SuccessResponse extends BaseResponse {
  status: ResponseStatus.success
}
export interface FailResponse extends BaseResponse {
  status: ResponseStatus.fail
}
export interface ErrorResponse extends BaseResponse {
  status: ResponseStatus.error
}
export interface UnknownResponse extends BaseResponse {
  status: ResponseStatus.unknown
}
export type ResponseUnion = SuccessResponse | FailResponse | ErrorResponse | UnknownResponse
interface StatusSpecifiedResponse extends Omit<BaseResponse, 'status'> {
  [key: string]: any
}
type PartialStatusSpecifiedResponse = Partial<StatusSpecifiedResponse>

const DEFAULT_STATUS_MESSAGE = ''
export const DEFAULT_SUCCESS_RESPONSE_CODE: ResponseCode = { code: 0, codeMessage: 'SUCCESS' }
export const DEFAULT_FAIL_RESPONSE_CODE: ResponseCode = { code: 1, codeMessage: 'FAIL' }
export const DEFAULT_ERROR_RESPONSE_CODE: ResponseCode = { code: 2, codeMessage: 'UNDEFINED_RUNTIME_ERROR' }
export const DEFAULT_UNKNOWN_RESPONSE_CODE: ResponseCode = { code: 3, codeMessage: 'UNKNOWN_RESPONSE' }
const DEFAULT_DATA = {}

export const isResponseCode = (tar: any): tar is ResponseCode =>
  isPlainObject(tar) && isNumber(tar.code) && isString(tar.codeMessage)
export const isResponse = (tar: any): tar is ResponseUnion =>
  isPlainObject(tar) && tar.status in ResponseStatus && isString(tar.statusMessage) && isPlainObject(tar.data)
export const isResponseLike = (tar: any): boolean =>
  isPlainObject(tar) && isString(tar.status) && isString(tar.statusMessage) && isPlainObject(tar.data)
export const isSuccessResponse = (tar: any): tar is SuccessResponse =>
  isResponse(tar) && tar.status === ResponseStatus.success
export const isFailResponse = (tar: any): tar is FailResponse =>
  isResponse(tar) && tar.status === ResponseStatus.fail
export const isErrorResponse = (tar: any): tar is ErrorResponse =>
  isResponse(tar) && tar.status === ResponseStatus.error
export const isUnknowResponse = (tar: any): tar is UnknownResponse =>
  isResponse(tar) && tar.status === ResponseStatus.unknown

export const makeSuccessResponse = ({ statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse): SuccessResponse => ({
  status: ResponseStatus.success,
  statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
  code: code ?? DEFAULT_SUCCESS_RESPONSE_CODE.code,
  codeMessage: codeMessage ?? DEFAULT_SUCCESS_RESPONSE_CODE.codeMessage,
  data: data ?? DEFAULT_DATA
})
export const makeFailResponse = ({ statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse): FailResponse => ({
  status: ResponseStatus.fail,
  statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
  code: code ?? DEFAULT_FAIL_RESPONSE_CODE.code,
  codeMessage: codeMessage ?? DEFAULT_FAIL_RESPONSE_CODE.codeMessage,
  data: data ?? DEFAULT_DATA
})
export const makeErrorResponse = ({ statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse): ErrorResponse => ({
  status: ResponseStatus.error,
  statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
  code: code ?? DEFAULT_ERROR_RESPONSE_CODE.code,
  codeMessage: codeMessage ?? DEFAULT_ERROR_RESPONSE_CODE.codeMessage,
  data: data ?? DEFAULT_DATA
})
export const makeUnknownResponse = ({ statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse): UnknownResponse => {
  console.warn(`[MobiusUtils][data] makeUnknownResponse: unknown response detected, ${JSON.stringify({ code, codeMessage, statusMessage, data })}`)
  return {
    status: ResponseStatus.unknown,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_UNKNOWN_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_UNKNOWN_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA
  }
}

export const dataToResponse = (data: Record<string, any>): SuccessResponse => {
  return makeSuccessResponse({ data })
}
export const errorToResponse = (error: Error): ErrorResponse => {
  const response = makeErrorResponse({})
  response.statusMessage = error.message
  response.data.error = error
  return response
}
