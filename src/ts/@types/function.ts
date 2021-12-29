import type { IsUnion } from './base'

export type AnyFunction = (...args: any[]) => any

export type AnyFunctionOfTake<A> = A extends any[] ? (
  IsUnion<A> extends true ? ((...args: [...A]) => any) : ((arg: A) => any)
) : (arg: A) => any
export type AnyFunctionOfReturn<T> = (...args: any[]) => T

/**
 * Predicate whether the target is of type function.
 */
export type IsFunction<T> = T extends AnyFunction ? true : false

export type CastFunction<T> = T extends AnyFunction ? T : AnyFunction
