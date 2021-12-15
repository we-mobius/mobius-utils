/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { isNumber, isString, isPlainObject } from '../internal/base'

type AnyStringRecord = Record<string, any>

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
export interface BaseResponse<D extends AnyStringRecord = AnyStringRecord> extends ResponseCode {
  status: ResponseStatus
  statusMessage: string
  data: D
}
export interface SuccessResponse<D extends AnyStringRecord = AnyStringRecord> extends BaseResponse<D> {
  status: ResponseStatus.success
}
export interface FailResponse<D extends AnyStringRecord = AnyStringRecord> extends BaseResponse<D> {
  status: ResponseStatus.fail
}
export interface ErrorResponse<D extends AnyStringRecord = AnyStringRecord> extends BaseResponse<D> {
  status: ResponseStatus.error
}
export interface UnknownResponse<D extends AnyStringRecord = AnyStringRecord> extends BaseResponse<D> {
  status: ResponseStatus.unknown
}
export type ResponseUnion<D extends AnyStringRecord = AnyStringRecord>
  = SuccessResponse<D>
  | FailResponse<D>
  | ErrorResponse<D>
  | UnknownResponse<D>
interface StatusSpecifiedResponse<D extends AnyStringRecord = AnyStringRecord> extends Omit<BaseResponse<D>, 'status'> {
  [key: string]: any
}
type PartialStatusSpecifiedResponse<D extends AnyStringRecord = AnyStringRecord> = Partial<StatusSpecifiedResponse<D>>

const DEFAULT_STATUS_MESSAGE = ''
export const DEFAULT_SUCCESS_RESPONSE_CODE: ResponseCode = { code: 0, codeMessage: 'SUCCESS' }
export const DEFAULT_FAIL_RESPONSE_CODE: ResponseCode = { code: 1, codeMessage: 'FAIL' }
export const DEFAULT_ERROR_RESPONSE_CODE: ResponseCode = { code: 2, codeMessage: 'UNDEFINED_RUNTIME_ERROR' }
export const DEFAULT_UNKNOWN_RESPONSE_CODE: ResponseCode = { code: 3, codeMessage: 'UNKNOWN_RESPONSE' }
const DEFAULT_DATA: AnyStringRecord = {}

export const isResponseCode = (tar: any): tar is ResponseCode =>
  isPlainObject(tar) && isNumber(tar.code) && isString(tar.codeMessage)
export const isResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is ResponseUnion<D> =>
  isPlainObject(tar) && tar.status in ResponseStatus && isString(tar.statusMessage) && isPlainObject(tar.data)
export const isResponseLike = (tar: any): boolean =>
  isPlainObject(tar) && isString(tar.status) && isString(tar.statusMessage) && isPlainObject(tar.data)
export const isSuccessResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is SuccessResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.success
export const isFailResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is FailResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.fail
export const isErrorResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is ErrorResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.error
export const isUnknowResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is UnknownResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.unknown

export const makeSuccessResponse = <D extends AnyStringRecord = AnyStringRecord>(
  { statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse<D>
): SuccessResponse<D> => ({
    status: ResponseStatus.success,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_SUCCESS_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_SUCCESS_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA as D
  })
export const makeFailResponse = <D extends AnyStringRecord = AnyStringRecord>(
  { statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse<D>
): FailResponse<D> => ({
    status: ResponseStatus.fail,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_FAIL_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_FAIL_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA as D
  })
export const makeErrorResponse = <D extends AnyStringRecord = AnyStringRecord>(
  { statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse<D>
): ErrorResponse<D> => ({
    status: ResponseStatus.error,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_ERROR_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_ERROR_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA as D
  })
export const makeUnknownResponse = <D extends AnyStringRecord = AnyStringRecord>(
  { statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse<D>
): UnknownResponse<D> => {
  console.warn(`[MobiusUtils][data] makeUnknownResponse: unknown response detected, ${JSON.stringify({ code, codeMessage, statusMessage, data })}`)
  return {
    status: ResponseStatus.unknown,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_UNKNOWN_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_UNKNOWN_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA as D
  }
}

export const dataToResponse = <D extends AnyStringRecord = AnyStringRecord>(data: D): SuccessResponse<D> => {
  return makeSuccessResponse({ data })
}
export const errorToResponse = <E extends Error>(error: E): ErrorResponse<{ error: E }> => {
  const response = makeErrorResponse<{ error: E }>({})
  response.statusMessage = error.message
  response.data.error = error
  return response
}
