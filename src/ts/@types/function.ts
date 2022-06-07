import type { IsUnion } from './base'

export type AnyFunction = (...args: any[]) => any

export type AnyFunctionOfTake<A> = A extends any[] ? (
  IsUnion<A> extends true ? ((...args: [...A]) => any) : ((arg: A) => any)
) : (arg: A) => any
export type AnyFunctionOfReturn<T> = (...args: any[]) => T

export type Noop = (...args: any[]) => void

/**
 * @example
 * ```
 *   type Temp = (a: number, b: string) => string
 *   type Temp2 = (...arg: string[]) => string
 *   // Expect: 2
 *   type test1 = FunctionLength<Temp>
 *   // Expect: number
 *   type test2 = FunctionLength<Temp2>
 * ```
 */
export type FunctionLength<Target> = Target extends (...args: infer Parameters) => any ? Parameters['length'] : never

/**
 * Basic interface for guarded functions that use [predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
 * @see Usecase - {@link https://github.com/ts-essentials/ts-essentials#predicatetype}
 * @see Copyright - Get the idea from {@link https://github.com/ts-essentials/ts-essentials/blob/5aa1f264e77fb36bb3f673c49f00927c7c181a7f/lib/types.ts#L484}
 */
export interface PredicateFunction<Target = unknown> {
  (target: Target, ..._: unknown[]): target is Target
  (target: any, ..._: unknown[]): target is Target
}

/**
  * Extracts the [predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) of a guarded function
  * @see Usecase - {@link https://github.com/ts-essentials/ts-essentials#predicatetype}
  * @see Copyright - Get the idea from {@link https://github.com/ts-essentials/ts-essentials/blob/5aa1f264e77fb36bb3f673c49f00927c7c181a7f/lib/types.ts#L489}
  */
export type PredicateTypeOf<Predicator extends PredicateFunction> =
  Predicator extends (target: unknown, ...rest: any[]) => target is infer P ? P : never

/**
 * @example
 * ```
 *   type Temp = (a: number, b: string) => string
 *   // Expect: (a: number, b: string) => Promise<string>
 *   type test1 = FunctionPromisify<Temp>
 * ```
 */
export type FunctionPromisify<Target extends AnyFunction> = (...args: Parameters<Target>) => Promise<ReturnType<Target>>

// More Features:
// Function parameters narrowing: https://millsp.github.io/ts-toolbelt/modules/function_narrow.html
// No infer: https://millsp.github.io/ts-toolbelt/modules/function_noinfer.html
