import type { IsUnion } from './base'

export type AnyFunction = (...args: any[]) => any

export type AnyFunctionOfTake<A> = A extends any[] ? (
  IsUnion<A> extends true ? ((...args: [...A]) => any) : ((arg: A) => any)
) : (arg: A) => any
export type AnyFunctionOfReturn<T> = (...args: any[]) => T
