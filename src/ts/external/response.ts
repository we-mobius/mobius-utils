/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { isNumber, isString, isPlainObject, isError } from '../internal/base'

import type { AnyStringRecord } from '../@types/index'

export interface ResponseCode {
  code: number
  codeMessage: string
}

export enum ResponseStatus {
  Success = 'success',
  Fail = 'fail',
  Error = 'error',
  Unknown = 'unknown'
}

export interface ErrorResponseData<E extends Error = Error> extends AnyStringRecord {
  error?: E
}

export interface BaseResponse<D extends AnyStringRecord = AnyStringRecord> extends ResponseCode {
  status: ResponseStatus
  statusMessage: string
  data: D
}
export interface SuccessResponse<D extends AnyStringRecord = AnyStringRecord> extends BaseResponse<D> {
  status: ResponseStatus.Success
}
export interface FailResponse<D extends AnyStringRecord = AnyStringRecord> extends BaseResponse<D> {
  status: ResponseStatus.Fail
}
export interface ErrorResponse<D extends ErrorResponseData = ErrorResponseData> extends BaseResponse<D> {
  status: ResponseStatus.Error
}
export interface UnknownResponse<D extends AnyStringRecord = AnyStringRecord> extends BaseResponse<D> {
  status: ResponseStatus.Unknown
}
export type ResponseUnion<
  SD extends AnyStringRecord = AnyStringRecord,
  FD extends AnyStringRecord = AnyStringRecord,
  ED extends ErrorResponseData = ErrorResponseData
>
  = SuccessResponse<SD>
  | FailResponse<FD>
  | ErrorResponse<ED>
  | UnknownResponse<AnyStringRecord>

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

/**
 * Predicate whether the target is type of ResponseCode.
 */
export const isResponseCode = (tar: any): tar is ResponseCode =>
  isPlainObject(tar) && isNumber(tar.code) && isString(tar.codeMessage)
/**
 * @see {@link isResponseLike}
 */
export const isResponse = <
  SD extends AnyStringRecord = AnyStringRecord, FD extends AnyStringRecord = AnyStringRecord,
  ED extends ErrorResponseData = ErrorResponseData
>(tar: any): tar is ResponseUnion<SD, FD, ED> =>
    isPlainObject(tar) && Object.values(ResponseStatus).includes(tar.status) && isString(tar.statusMessage) && isPlainObject(tar.data)
/**
 * @see {@link isResponse}
 */
export const isResponseLike = (tar: any): boolean =>
  isPlainObject(tar) && isString(tar.status) && isString(tar.statusMessage) && isPlainObject(tar.data)

export const isSuccessResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is SuccessResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.Success
export const isFailResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is FailResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.Fail
export const isErrorResponse = <D extends ErrorResponseData = ErrorResponseData>(tar: any): tar is ErrorResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.Error
export const isUnknowResponse = <D extends AnyStringRecord = AnyStringRecord>(tar: any): tar is UnknownResponse<D> =>
  isResponse(tar) && tar.status === ResponseStatus.Unknown

export const makeSuccessResponse = <D extends AnyStringRecord = AnyStringRecord>(
  { statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse<D>
): SuccessResponse<D> => ({
    status: ResponseStatus.Success,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_SUCCESS_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_SUCCESS_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA as D
  })
export const makeFailResponse = <D extends AnyStringRecord = AnyStringRecord>(
  { statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse<D>
): FailResponse<D> => ({
    status: ResponseStatus.Fail,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_FAIL_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_FAIL_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA as D
  })
export const makeErrorResponse = <D extends ErrorResponseData = ErrorResponseData>(
  { statusMessage, code, codeMessage, data }: PartialStatusSpecifiedResponse<D>
): ErrorResponse<D> => ({
    status: ResponseStatus.Error,
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
    status: ResponseStatus.Unknown,
    statusMessage: statusMessage ?? DEFAULT_STATUS_MESSAGE,
    code: code ?? DEFAULT_UNKNOWN_RESPONSE_CODE.code,
    codeMessage: codeMessage ?? DEFAULT_UNKNOWN_RESPONSE_CODE.codeMessage,
    data: data ?? DEFAULT_DATA as D
  }
}

export const dataToResponse = <D extends AnyStringRecord = AnyStringRecord>(data: D): SuccessResponse<D> => {
  if (!isPlainObject(data)) {
    throw (new TypeError('"data" is expected to be type of "PlainObject".'))
  }
  return makeSuccessResponse({ data })
}
export const errorToResponse = <E extends Error>(error: E): ErrorResponse<ErrorResponseData<E>> => {
  const response = makeErrorResponse<ErrorResponseData<E>>({})
  if (!isError(error)) {
    throw (new TypeError('"error" is expected to be type of "Error".'))
  }
  response.statusMessage = error.message
  response.data.error = error
  return response
}
