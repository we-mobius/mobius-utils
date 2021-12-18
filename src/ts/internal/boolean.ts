/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-redeclare */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { compose, curry } from '../functional/helpers'
import { isFunction } from './base'

type FunctionReturnBoolean = (...args: any[]) => boolean

export const bool = Boolean

export const and = curry((x: any, y: any): boolean => Boolean(x) && Boolean(y))
export const or = curry((x: any, y: any): boolean => Boolean(x) || Boolean(y))
export const not = (x: boolean): boolean => !x
export const complement = (fn: FunctionReturnBoolean): FunctionReturnBoolean => compose(not, fn)

export const isTrue = (v: any): boolean => v === true
export const isFalse = (v: any): boolean => v === false

// @refer https://developer.mozilla.org/en-US/docs/Glossary/Truthy
export const isTruthy = (v: any): boolean => Boolean(v)
export const isFalsy = (v: any): boolean => !isTruthy(v)

// @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
export const isStrictEqual = curry((v1: any, v2: any): boolean => v1 === v2)
// eslint-disable-next-line eqeqeq
export const isLooseEqual = curry((v1: any, v2: any): boolean => v1 == v2)
// @refer // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
export const isObjetEqual = curry((v1: any, v2: any): boolean => Object.is(v1, v2))

type GeneralFunction = (...args: any[]) => any
export const ifElse = curry(
  (pred: FunctionReturnBoolean, thenFn: GeneralFunction, elseFn: GeneralFunction, x: any): any =>
    pred(x) ? thenFn(x) : elseFn(x)
)
export const when = curry((pred: FunctionReturnBoolean, f: GeneralFunction, x: any): any =>
  pred(x) ? f(x) : x)
export const unless = curry((pred: FunctionReturnBoolean, f: GeneralFunction, x: any): any =>
  !pred(x) ? f(x) : x)
// IIF: Immediate If Function
export const iif = curry(
  (cond: any, x: any, y: any): any => bool(isFunction(cond) ? cond(x) : cond) ? x : y
)

// @refer https://hackage.haskell.org/package/Boolean-0.2.4/candidate/docs/Data-Boolean.html
// @refer https://hackage.haskell.org/package/Boolean-0.2.4/candidate/docs/src/Data-Boolean.html#guardedB
type GuardCondition = [judgement: boolean, value: any]
export const guards = (conditions: GuardCondition[], defaultValue: any): any => {
  for (const [judgement, value] of conditions) {
    if (judgement) return value
  }
  return defaultValue
}
// @refer https://hackage.haskell.org/package/Boolean-0.2.4/candidate/docs/src/Data-Boolean.html#caseB
type CaseCondition = [predicate: FunctionReturnBoolean, value: any]
export const cases = (predicated: any, conditions: CaseCondition[], defaultValue: any): any => {
  for (const [predicate, value] of conditions) {
    if (predicate(predicated)) {
      return value
    }
  }
  return defaultValue
}
