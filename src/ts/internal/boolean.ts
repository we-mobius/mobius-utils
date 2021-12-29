import { isNormalFunction } from './base'
import { curry, looseCurryN } from '../functional/helpers'

import type { AnyFunctionOfReturn, InvertBoolean, CastBoolean } from '../@types/index'

/**
 * Convert any value to `true` or `false`.
 *
 * @refer https://developer.mozilla.org/en-US/docs/Glossary/Truthy
 * @refer https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 */
export const bool = Boolean

/**
 * Logic `NOT`, invert a boolean value to its opposite.
 *
 * @param b - The boolean value to invert.
 *
 * @example
 * ```md
 * | Input A | Output Q |
 * |    0    |    1     |
 * |    1    |    0     |
 * ```
 *
 * @refer https://en.wikipedia.org/wiki/Logic_gate
 */
export function not (b: true): false
export function not (b: false): true
// catch all overload, used in `pipe` or `compose` or likewise situations.
export function not (b: boolean): boolean
export function not (b: any): boolean
export function not (b: any): boolean { return !bool(b) }

/**
 * Logic `AND`.
 *
 * @example
 * ```md
 * | Input A | Input B | Output Q |
 * |    0    |    0    |    0     |
 * |    0    |    1    |    0     |
 * |    1    |    0    |    0     |
 * |    1    |    1    |    1     |
 * ```
 * ```ts
 * const x = true
 * const y = false
 * const z = and(x, y) // false
 * ```
 *
 * @refer https://en.wikipedia.org/wiki/Logic_gate
 */
export const and = (x: any, y: any): boolean => bool(x) && bool(y)
/**
 * @see {@link and}
 */
export const and_ = curry(and)

/**
 * Logic `OR`.
 *
 * @example
 * ```md
 * | Input A | Input B | Output Q |
 * |    0    |    0    |    0     |
 * |    0    |    1    |    1     |
 * |    1    |    0    |    1     |
 * |    1    |    1    |    1     |
 * ```
 * ```ts
 * const x = true
 * const y = false
 * const z = or(x, y) // true
 * ```
 *
 * @refer https://en.wikipedia.org/wiki/Logic_gate
 */
export const or = (x: any, y: any): boolean => bool(x) || bool(y)
/**
 * @see {@link or}
 */
export const or_ = curry(or)

/**
 * Logic `NAND`.
 *
 * @example
 * ```md
 * | Input A | Input B | Output Q |
 * |    0    |    0    |    1     |
 * |    0    |    1    |    1     |
 * |    1    |    0    |    1     |
 * |    1    |    1    |    0     |
 * ```
 * ```ts
 * const x = true
 * const y = false
 * const z = nand(x, y) // true
 * ```
 *
 * @refer https://en.wikipedia.org/wiki/Logic_gate
 */
export const nand = (x: any, y: any): boolean => !and(x, y)
/**
 * @see {@link nand}
 */
export const nand_ = curry(nand)

/**
 * Logic `NOR`.
 *
 * @example
 * ```md
 * | Input A | Input B | Output Q |
 * |    0    |    0    |    1     |
 * |    0    |    1    |    0     |
 * |    1    |    0    |    0     |
 * |    1    |    1    |    0     |
 * ```
 * ```ts
 * const x = true
 * const y = false
 * const z = nor(x, y) // false
 * ```
 *
 * @refer https://en.wikipedia.org/wiki/Logic_gate
 */
export const nor = (x: any, y: any): boolean => !or(x, y)
/**
 * @see {@link nor}
 */
export const nor_ = curry(nor)

/**
 * Logic `XOR`.
 *
 * @example
 * ```md
 * | Input A | Input B | Output Q |
 * |    0    |    0    |    0     |
 * |    0    |    1    |    1     |
 * |    1    |    0    |    1     |
 * |    1    |    1    |    0     |
 * ```
 * ```ts
 * const x = true
 * const y = false
 * const z = xor(x, y) // true
 * ```
 *
 * @refer https://en.wikipedia.org/wiki/Logic_gate
 */
export const xor = (x: any, y: any): boolean => bool(x) !== bool(y)
/**
 * @see {@link xor}
 */
export const xor_ = curry(xor)

/**
 * Logic `XNOR`.
 *
 * @example
 * ```md
 * | Input A | Input B | Output Q |
 * |    0    |    0    |    1     |
 * |    0    |    1    |    0     |
 * |    1    |    0    |    0     |
 * |    1    |    1    |    1     |
 * ```
 * ```ts
 * const x = true
 * const y = false
 * const z = xnor(x, y) // false
 * ```
 *
 * @refer https://en.wikipedia.org/wiki/Logic_gate
 */
export const xnor = (x: any, y: any): boolean => !xor(x, y)
/**
 * @see {@link xnor}
 */
export const xnor_ = curry(xnor)

export type InvertFunctionReturn<FN extends AnyFunctionOfReturn<boolean>> =
  FN extends (...args: any[]) => infer R ? (...args: Parameters<FN>) => InvertBoolean<CastBoolean<R>> : never
/**
 * Take a function that returns a boolean value, return a complement function that return the opposite boolean value.
 * i.e. whenever target function return `true`, the complement function will return `false`, and vice versa.
 *
 * @param fn - The function returns boolean.
 *
 * @typeParam FN - The target function's type.
 */
export const complement = <FN extends AnyFunctionOfReturn<boolean>>(fn: FN): InvertFunctionReturn<FN> =>
  ((...args: any) => not(fn(...args))) as any

/**
 * Predicate whether the target value is exactly `true`.
 */
export const isTrue = (v: any): boolean => v === true
/**
 * Predicate whether the target value is exactly `false`.
 */
export const isFalse = (v: any): boolean => v === false

/**
 * Predicate whether the target value is a truthy value.
 *
 * @refer https://developer.mozilla.org/en-US/docs/Glossary/Truthy
 * @see {@link isFalsy}
 */
export const isTruthy = (v: any): boolean => Boolean(v)
/**
 * Predicate whether the target value is a falsy value.
 *
 * @refer https://developer.mozilla.org/en-US/docs/Glossary/Falsy
 * @see {@link isTruthy}
 */
export const isFalsy = (v: any): boolean => !isTruthy(v)

/**
 * Use `===` to check whether two value are equal.
 *
 * @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
 */
export const isStrictEqual = (v1: any, v2: any): boolean => v1 === v2
/**
 * @see {@link isStrictEqual}
 */
export const isStrictEqual_ = curry(isStrictEqual)

/**
 * Use `==` to check whether two value are equal.
 *
 * @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
 */
// eslint-disable-next-line eqeqeq
export const isLooseEqual = (v1: any, v2: any): boolean => v1 == v2
/**
 * @see {@link isLooseEqual}
 */
export const isLooseEqual_ = curry(isLooseEqual)

/**
 * Use `Object.is` to check whether two value are equal.
 *
 * @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
 * @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
export const isObjetEqual = (v1: any, v2: any): boolean => Object.is(v1, v2)
/**
 * @see {@link isObjetEqual}
 */
export const isObjectEqual_ = curry(isObjetEqual)

/**
 * Invoke the conditional function with the target value, according to the predicate result.
 *
 * @param pred - Value of type `any`, the value will be converted to `boolean` using `bool` function.
 *               If `pred` is of type `NormalFunction`, it will be invoked with provided `x`.
 *               then the invoke result will be converted to `boolean` using `bool` function.
 * @param thenFn - The function to be invoked if `pred` result is truthy.
 * @param elseFn - The function to be invoked if `pred` result is falsy.
 * @param x - The target value, which will be pass to `pred` | `thenFn` | `elseFn`.
 *
 * @typeParam T - The type of the target value.
 * @typeParam TR - The return type of `thenFn`.
 * @typeParam ER - The return type of `elseFn`.
 */
export const ifElse = <X = any, TR = any, ER = any>(
  pred: any, thenFn: (x?: X) => TR, elseFn: (x?: X) => ER, x?: X
): TR | ER =>
    bool(isNormalFunction(pred) ? pred(x) : pred) ? thenFn(x) : elseFn(x)
/**
 * @see {@link ifElse}
 */
export const ifElse_ = looseCurryN(3, ifElse)

/**
 * Invoke the target function with target value, when the predicate result is truthy.
 *
 * @param pred - Value of type `any`, the value will be converted to `boolean` using `bool` function.
 *               If `pred` is of type `NormalFunction`, and `x` is provided, it will be invoked with provided `x`.
 *               then the invoke result will be converted to `boolean` using `bool` function.
 * @param thenFn - The function to be invoked if `pred` result is truthy.
 *                 If `x` is provided, it will be passed to `thenFn`.
 * @param x - The target value, which will be pass to `pred` | `thenFn`.
 *
 * @typeParam X - The type of the target value.
 * @typeParam WR - The return type of `whenFn`.
 */
export function when <X = any, WR = any> (pred: any, whenFn: (x?: X) => WR): WR
export function when <X = any, WR = any> (pred: any, whenFn: (x?: X) => WR, x: X): WR | X
export function when <X = any, WR = any> (pred: any, whenFn: (x?: X) => WR, x?: X): WR | X | undefined {
  return bool(isNormalFunction(pred) ? pred(x) : pred) ? whenFn(x) : x
}
/**
 * @see {@link when}
 */
export const when_ = looseCurryN(2, when)

/**
 * Invoke the target function with target value, unless the predicate result is truthy.
 *
 * @param pred - Value of type `any`, the value will be converted to `boolean` using `bool` function.
 *               If `pred` is of type `NormalFunction`, and `x` is provided, it will be invoked with provided `x`.
 *               then the invoke result will be converted to `boolean` using `bool` function.
 * @param unlessFn - The function to be invoked if `pred` result is falsy.
 *                   If `x` is provided, it will be passed to `unlessFn`.
 * @param x - The target value, which will be pass to `pred` | `unlessFn`.
 *
 * @typeParam X - The type of the target value.
 * @typeParam UR - The return type of `unlessFn`.
 */
export function unless <X = any, UR = any> (pred: any, unlessFn: (x?: X) => UR): UR
export function unless <X = any, UR = any> (pred: any, unlessFn: (x?: X) => UR, x: X): UR
export function unless <X = any, UR = any> (
  pred: any, unlessFn: (x?: X) => UR, x?: X
): UR | X | undefined {
  return !bool(isNormalFunction(pred) ? pred(x) : pred) ? unlessFn(x) : x
}
/**
 * @see {@link unless}
 */
export const unless_ = looseCurryN(2, unless)

/**
 * IIF: Immediate If Function
 *
 * @param cond - Value of type `any`, the value will be converted to `boolean` using `bool` function.
 *               If `cond` is of type `NormalFunction`, it will be invoked with provided `trueValue`
 *               then the invoke result will be converted to `boolean` using `bool` function.
 *
 * @typeParam X - Type of the trueValue.
 * @typeParam Y - Type of the falseValue.
 *
 * @see {@link bool}
 */
export const iif = <X = any, Y = any>(cond: any, trueValue: X, falseValue: Y): X | Y =>
  bool(isNormalFunction(cond) ? cond(trueValue) : cond) ? trueValue : falseValue
/**
 * @see {@link iif}
 */
export const iif_ = curry(iif)

export type GuardCondition<V> = [judgement: boolean, value: V]
/**
 * @refer https://hackage.haskell.org/package/Boolean-0.2.4/candidate/docs/Data-Boolean.html
 * @refer https://hackage.haskell.org/package/Boolean-0.2.4/candidate/docs/src/Data-Boolean.html#guardedB
 */
export const guards = <V = any>(conditions: Array<GuardCondition<V>>, defaultValue: V): V => {
  for (const [judgement, value] of conditions) {
    if (judgement) return value
  }
  return defaultValue
}

export type CaseCondition<P, V> = [predicate: (predicated?: P) => boolean, value: V]
/**
 * @refer https://hackage.haskell.org/package/Boolean-0.2.4/candidate/docs/src/Data-Boolean.html#caseB
 */
export const cases = <P = any, V = any>(
  predicated: P, conditions: Array<CaseCondition<P, V>>, defaultValue: V
): V => {
  for (const [predicate, value] of conditions) {
    if (predicate(predicated)) {
      return value
    }
  }
  return defaultValue
}
