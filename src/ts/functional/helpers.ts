/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

// use '../internal/base' instead of '../internal' to avoid ↓
//   - ReferenceError: Cannot access '***' before initialization
//   - because some of internal modules import the "../functional"

/**
 * 在 TypeScript 里实现通用的柯里化函数是一件比较困难的事情。
 *
 * 以下是一些讨论：
 *
 * - [Generic curry function with TypeScript 3 - stack overflow](https://stackoverflow.com/questions/51859461/generic-curry-function-with-typescript-3)
 * - [TypeScript and currying - GitHub Gist](https://gist.github.com/donnut/fd56232da58d25ceecf1)
 *
 * 这是目前为止我找到的最好的一个解决方案，我大幅度借鉴了这个方案，感谢 Mills：
 *
 * - [How to master advanced TypeScript patterns - Pierre-Antoine Mills](https://www.freecodecamp.org/news/typescript-curry-ramda-types-f747e99744ab/)
 *   - [Related Repo](https://github.com/pirix-gh/medium/blob/master/types-curry-ramda/src/index.ts)
 *
 * 这个也不错：
 *
 * - [Currying in TypeScript - Jamie Pennell](https://medium.com/codex/currying-in-typescript-ca5226c85b85)
 *
 * 这是相关的 PR、Proposal、Updates：
 *
 * - [[Ramda] Generic types for curry #33628](https://github.com/DefinitelyTyped/DefinitelyTyped/pull/33628)
 * - [Proposal: Variadic Kinds -- Give specific types to variadic functions #5453](https://github.com/Microsoft/TypeScript/issues/5453)
 * - [Variadic tuple types #39094](https://github.com/microsoft/TypeScript/pull/39094)
 * - [Variadic Tuple Types - TypeScript 4.0](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types)
 */

import { asIs, isObject, isFunction } from '../internal/base'

// NOTE: 重复实现了 boolean 中的 complement 以避免循环引用
type FunctionReturnBoolean = (...args: any[]) => boolean
const complement = (fn: FunctionReturnBoolean): FunctionReturnBoolean => (...args) => !fn(...args)

interface ArgPlaceholder {
  '@@functional/placeholder': true
  isArgPlaceholder: true
}
export const argPlaceholder: ArgPlaceholder = {
  // be compatible with ramda
  '@@functional/placeholder': true,
  isArgPlaceholder: true
}
/**
 * 判断一个参数是否是 ArgPlaceHolder
 */
export const isArgPlaceholder = (tar: any): tar is ArgPlaceholder =>
  isObject(tar) && (tar.isArgPlaceholder === true || tar['@@functional/placeholder'] === true)

/******************************************************************************************************
 *
 *                                      Simple Curry Function
 *
 ******************************************************************************************************/

type Loose<T extends any[]> = [...T, ...any[]]

type PartialTuple<TUPLE extends any[], EXTRACTED extends any[] = []> =
  // If the tuple provided has at least one required value
  TUPLE extends [infer NEXT_PARAM, ...infer REMAINING] ?
    // recurse back in to this type with one less item
    // in the original tuple, and the latest extracted value
    // added to the extracted list as optional
    PartialTuple<REMAINING, [...EXTRACTED, NEXT_PARAM?]> :
    // else if there are no more values,
    // return an empty tuple so that too is a valid option
      [...EXTRACTED, ...TUPLE]
type NonNull<T extends any[]> = { [K in keyof T]: NonNullable<T[K]> }
type PartialParameters<FN extends (...args: any[]) => any> = NonNull<PartialTuple<Parameters<FN>>>

type RemainingParameters<PROVIDED extends any[], EXPECTED extends any[], LOOSE extends boolean = false> =
  // if the expected array has any required items
  EXPECTED extends [infer E1, ...infer EX] ? (
    // if the provided array has at least one required item
    PROVIDED extends [infer P1, ...infer PX] ? (
      // if the type is correct, recurse with one item less in each array type,
      // else return this as invalid
      P1 extends E1 ? RemainingParameters<PX, EX, LOOSE> : never
    )
      // else the remaining args is unchanged
      : (LOOSE extends true ? Loose<EXPECTED> : EXPECTED)
  )
    // else there are no more arguments
    : (LOOSE extends true ? Loose<[]> : [])

type SimpleCurriedFunctionOrReturnValue<
  PROVIDED extends any[], FN extends (...args: any[]) => any, LOOSE extends boolean = false
> =
  RemainingParameters<PROVIDED, Parameters<FN>, LOOSE> extends [any, ...any[]] ?
    SimpleCurriedFunction<PROVIDED, FN, LOOSE> : ReturnType<FN>
type SimpleCurriedFunction<
  PROVIDED extends any[], FN extends (...args: any[]) => any, LOOSE extends boolean = false
> =
  <APPENDING_ARGS extends NonNull<PartialTuple<RemainingParameters<PROVIDED, Parameters<FN>, LOOSE>>>>
  (...args: APPENDING_ARGS) => SimpleCurriedFunctionOrReturnValue<[...PROVIDED, ...APPENDING_ARGS], FN, LOOSE>

type LooseCurryS =
  <FN extends (...args: any[]) => any, EXISTING_ARGS extends [...PartialParameters<FN>, ...any[]]>
  (targetFn: FN, ...existingArgs: EXISTING_ARGS) => SimpleCurriedFunction<EXISTING_ARGS, FN, true>

type HPLooseCurryS = (fn: AnyFunction, ...args: any[]) => AnyFunction
/**
 * Simple curry function - loose version
 *
 * Loose simple curry will pass all of the args it received to target function,
 * even if the arg's length is greater than target function's arity.
 */
export const looseCurryS: LooseCurryS = (fn, ...existingArgs) => {
  return (...appendingArgs) => {
    const totalArgs = [...existingArgs, ...appendingArgs]
    if (totalArgs.length < fn.length) {
      return looseCurryS(fn, ...totalArgs as PartialParameters<typeof fn>) // as PartialParameters<typeof fn>
    }
    return fn(...totalArgs)
  }
}

type CurryS =
  <FN extends (...args: any[]) => any, EXISTING_ARGS extends PartialParameters<FN>>
  (targetFn: FN, ...existingArgs: EXISTING_ARGS) => SimpleCurriedFunction<EXISTING_ARGS, FN, false>

type HPCurryS = (fn: AnyFunction, ...args: any[]) => AnyFunction
/**
 * Simple curry function - strict version
 *
 * Strict simple curry will take exactly the required args that target function needs,
 * redundant args will be ignored.
 */
export const curryS: CurryS = (fn, ...existingArgs) => {
  return (...appendingArgs) => {
    const targetArity = fn.length
    const totalArgs = [...existingArgs, ...appendingArgs]
    if (totalArgs.length < targetArity) {
      return curryS(fn, ...totalArgs as PartialParameters<typeof fn>) //  as PartialParameters<typeof fn>
    } else {
      return fn(...totalArgs.slice(0, targetArity))
    }
  }
}

/******************************************************************************************************
 *
 *                                            Curry Function
 *
 ******************************************************************************************************/

type Head<T extends any[]> = T extends [any, ...any[]] ? T[0] : never
type Tail<T extends any[]> = ((...t: T) => any) extends ((_: any, ...tail: infer TT) => any) ? TT : []
type HasTail<T extends any[]> = T extends ([] | [any]) ? false : true
type Last<T extends any[]> = { 0: Last<Tail<T>>, 1: Head<T>}[ HasTail<T> extends true ? 0 : 1 ]

type Length<T extends any[]> = T['length']

type Prepend<E, T extends any[]> = [E, ...T]
type Drop<N extends number, T extends any[], I extends any[] = []> = {
  0: Drop<N, Tail<T>, Prepend<any, I>>
  1: T
}[ Length<I> extends N ? 1 : 0]

type Cast<X, Y> = X extends Y ? X : Y

type Pos<I extends any[]> = Length<I>
type Next<I extends any[]> = Prepend<any, I>
type Prev<I extends any[]> = Tail<I>
type Iterator<Index extends number = 0, From extends any[] = [], I extends any[] = []> = {
  0: Iterator<Index, Next<From>, Next<I>>
  1: From
}[ Pos<I> extends Index ? 1 : 0 ]
type Minus<Base extends number, Delta extends number> =
  Iterator<Base> extends infer target ? Drop<Delta, Cast<target, any[]>> : never

type Reverse<T extends any[], R extends any[] = [], I extends any[] = []> = {
  0: Reverse<T, Prepend<T[Pos<I>], R>, Next<I>>
  1: R
}[ Pos<I> extends Length<T> ? 1 : 0 ]
type Concat<T1 extends any[], T2 extends any[]> = Reverse<Reverse<T1> extends infer R ? Cast<R, any[]> : never, T2>
type Append<E, T extends any[]> = Concat<T, [E]>

type LoosePlaceholder = [] & { __TYPE__: 'LoosePlaceholder' }
// type example_ = GapOf<[ArgPlaceholder, number, ArgPlaceholder], [string, number, boolean], [], []> // [string]
// type example_ = GapOf<[ArgPlaceholder, number, ArgPlaceholder], [string, number, boolean], [], [any, any]> // [boolean]
// type example_ = GapOf<[ArgPlaceholder, number, ArgPlaceholder], [string, number], [], [any, any], true> // [LoosePlaceholder]
// type example_ = GapOf<[ArgPlaceholder, number, ArgPlaceholder], [string, number], [], [any, any], false> // []
type GapOf<
  T1 extends any[],
  T2 extends any[],
  TN extends any[],
  I extends any[],
  LOOSE extends boolean = false
> =
  T1[Pos<I>] extends ArgPlaceholder ? (
    LOOSE extends true ?
        (T2[Pos<I>] extends undefined ? [...TN, LoosePlaceholder] : [...TN, T2[Pos<I>]]) :
        (T2[Pos<I>] extends undefined ? TN : [...TN, T2[Pos<I>]])
  ) : TN

type GapsOf<
  T1 extends any[],
  T2 extends any[],
  LOOSE extends boolean = false,
  TN extends any[] = [],
  I extends any[] = []
> = {
  0: GapsOf<T1, T2, LOOSE, Cast<GapOf<T1, T2, TN, I, LOOSE>, any[]>, Next<I>>
  1: Concat<TN, Drop<Pos<I>, T2> extends infer D ? Cast<D, any[]> : never>
}[ Pos<I> extends Length<T1> ? 1 : 0 ]

// 使用 T2 填 T1 的空位，返回填充后的结果
// 在严格模式中，T2 中多余的参数会被丢弃，在宽松模式中会被保留
type ConcatGaps<
  T1 extends any[], T2 extends any[], LOOSE extends boolean = false, TN extends any[] = []
> = {
  0: ConcatGaps<
  Tail<T1>,
  T1[0] extends ArgPlaceholder ? (Length<T2> extends 0 ? [] : Tail<T2>) : T2,
  LOOSE,
  T1[0] extends ArgPlaceholder ? (Length<T2> extends 0 ? [...TN, T1[0]] : [...TN, T2[0]]) : [...TN, T1[0]]
  >
  1: LOOSE extends true ? [...TN, ...T2] : TN
}[ Length<T1> extends 0 ? 1 : 0 ]

// 使被柯里化的函数参数可以接受 argPlaceholder
type PartialGaps<T extends any[]> = {
  [K in keyof T]?: T[K] extends LoosePlaceholder ? any : (T[K] | ArgPlaceholder)
}
type CleanedGaps<T extends any[]> = {
  [K in keyof T]: NonNullable<T[K]>
}
type Gaps<T extends any[]> = CleanedGaps<PartialGaps<T>>

// 柯里化函数的基础类型
type CurriedFunctionOrReturnValue<
  PROVIDED extends any[], FN extends (...args: any[]) => any, LOOSE extends boolean = false
> =
  // 判断柯里化函数的返回值需要准确的必需参数列表，所以这里的 GapsOf 始终是严格模式
  GapsOf<PROVIDED, Parameters<FN>, false> extends [any, ...any[]] ?
    CurriedFunction<PROVIDED, FN, LOOSE> : ReturnType<FN>

type CurriedFunction<
  PROVIDED extends any[], FN extends (...args: any[]) => any, LOOSE extends boolean = false
> =
  <APPENDING_ARGS extends
  (
    GapsOf<PROVIDED, Parameters<FN>, LOOSE> extends
    infer _ ?
        (LOOSE extends true ? Gaps<Loose<Cast<_, any[]>>> : Gaps<Cast<_, any[]>>) : never
  )
  >
  // ConcatGaps 应该始终使用严格模式，以使后续追加的参数能够正确地被记录到 Provide 中
  (...args: APPENDING_ARGS) => ConcatGaps<PROVIDED, APPENDING_ARGS, true> extends infer ___ ?
    CurriedFunctionOrReturnValue<Cast<___, any[]>, FN, LOOSE> : never

type LooseCurry =
  <FN extends (...args: any[]) => any, EXISTING_ARGS extends Loose<Cast<Gaps<Parameters<FN>>, any[]>>>
  (fn: FN, ...existingArgs: EXISTING_ARGS) => CurriedFunction<EXISTING_ARGS, FN, true>

type HPLooseCurry = (fn: AnyFunction, ...args: any[]) => AnyFunction
/**
 * Internal curry function - loose version
 *
 * Loose internal curry will pass all of the args it received to target function,
 * even if the arg's length is greater than target function's arity.
 */
export const looseCurry: HPLooseCurry = (fn, ...existingArgs) => {
  return (...appendingArgs) => {
    const totalArgs = existingArgs.map(arg =>
      isArgPlaceholder(arg) ? (appendingArgs.length > 0 ? appendingArgs.shift() : arg) : arg
    )
    totalArgs.push(...appendingArgs)

    const targetArity = fn.length
    const validArgs = totalArgs.slice(0, targetArity)
    const validLen = validArgs.filter(complement(isArgPlaceholder)).length
    if (validLen < targetArity) {
      return looseCurry(fn, ...totalArgs) // as (typeof existingArgs)
    } else {
      return fn(...totalArgs)
    }
  }
}

type Curry =
  <FN extends (...args: any[]) => any, EXISTING_ARGS extends Cast<Gaps<Parameters<FN>>, any[]>>
  (fn: FN, ...existingArgs: EXISTING_ARGS) => CurriedFunction<EXISTING_ARGS, FN, false>

type HPCurry = (fn: AnyFunction, ...args: any[]) => AnyFunction
/**
 * Internal curry function - strict version
 *
 * Strict internal curry will take exactly the required args that target function needs,
 * redundant args will be ignored.
 */
export const curry: HPCurry = (fn, ...existingArgs) => {
  return (...appendingArgs) => {
    const totalArgs = existingArgs.map(arg =>
      isArgPlaceholder(arg) ? (appendingArgs.length > 0 ? appendingArgs.shift() : arg) : arg
    )
    totalArgs.push(...appendingArgs)

    const targetArity = fn.length
    const validArgs = totalArgs.slice(0, targetArity)
    const validLen = validArgs.filter(complement(isArgPlaceholder)).length
    if (validLen < targetArity) {
      return curry(fn, ...totalArgs) // as (typeof existingArgs)
    } else {
      return fn(...validArgs)
    }
  }
}
/******************************************************************************************************
 *
 *                                          CurryN Function
 *
 ******************************************************************************************************/

type RestrictParams<
  N extends number,
  Params extends any[],
  TN extends any[] = [],
  I extends any[] = []
> = {
  0: RestrictParams<N, Tail<Params>, [...TN, Params[0]], Next<I>>
  1: TN
}[ Pos<I> extends N ? 1 : 0 ]

type BuildExistingArgs<ARITY extends number, FN extends (...args: any[]) => any, LOOSE extends boolean = false> =
  RestrictParams<ARITY, Parameters<FN>> extends infer _ ?
      (LOOSE extends true ? Gaps<Loose<Cast<_, any[]>>> : Gaps<Cast<_, any[]>>) : never

// 柯里化函数的基础类型
export type CurriedNFunctionOrReturnValue<
  EXPECTED_ARGS extends any[], RETURN_TYPE extends any, PROVIDED extends any[], LOOSE extends boolean = false
> =
  // 判断柯里化函数的返回值需要准确的必需参数列表，所以这里的 GapsOf 始终是严格模式
  GapsOf<PROVIDED, EXPECTED_ARGS, false> extends [any, ...any[]] ?
    CurriedNFunction<EXPECTED_ARGS, RETURN_TYPE, PROVIDED, LOOSE> : RETURN_TYPE

export type CurriedNFunction<
  EXPECTED_ARGS extends any[], RETURN_TYPE extends any, PROVIDED extends any[], LOOSE extends boolean = false
> =
  <APPENDING_ARGS extends
  (
    GapsOf<PROVIDED, EXPECTED_ARGS, LOOSE> extends infer __ ?
        (LOOSE extends true ? Gaps<Loose<Cast<__, any[]>>> : Gaps<Cast<__, any[]>>) : never
  )
  >
  // ConcatGaps 应该始终使用严格模式，以使后续追加的参数能够正确地被记录到 Provide 中
  (...args: APPENDING_ARGS) => ConcatGaps<PROVIDED, APPENDING_ARGS, true> extends infer ___ ?
    CurriedNFunctionOrReturnValue<EXPECTED_ARGS, RETURN_TYPE, Cast<___, any[]>, LOOSE> : never

type LooseCurryN =
  <
    ARITY extends number,
    FN extends (...args: any[]) => any,
    EXISTING_ARGS extends (BuildExistingArgs<ARITY, FN, true> | []),
    EXPECTED_ARGS extends RestrictParams<ARITY, Parameters<FN>>,
    RETURN_TYPE extends ReturnType<FN>
  >
  (targetArity: ARITY, fn: FN, ...existingArgs: EXISTING_ARGS) =>
  // TODO: 类型计算性能优化
  // @ts-expect-error TypeScript 出于性能的担忧会提示“可能出错”
  CurriedNFunction<EXPECTED_ARGS, RETURN_TYPE, EXISTING_ARGS, true>

type HPLooseCurryN = (targetArity: number, fn: AnyFunction, ...args: any[]) => AnyFunction
/**
 * Internal curryN function - loose version
 *
 * Loose internal curry will pass all of the args it received to target function,
 * even if the arg's length is greater than specified arity.
 */
export const looseCurryN: HPLooseCurryN = (targetArity, fn, ...existingArgs) => {
  return (...appendingArgs) => {
    const totalArgs = existingArgs.map(innerArg =>
      isArgPlaceholder(innerArg) ? (appendingArgs.length > 0 ? appendingArgs.shift() : innerArg) : innerArg
    )
    totalArgs.push(...appendingArgs)

    const validArgs = totalArgs.slice(0, targetArity)
    const validLen = validArgs.filter(complement(isArgPlaceholder)).length
    if (validLen < targetArity) {
      return looseCurryN(targetArity, fn, ...totalArgs) // as (typeof existingArgs)
    } else {
      return fn(...totalArgs)
    }
  }
}

type CurryN = <
  ARITY extends number,
  FN extends (...args: any[]) => any,
  EXISTING_ARGS extends (BuildExistingArgs<ARITY, FN, false> | []),
  EXPECTED_ARGS extends RestrictParams<ARITY, Parameters<FN>>,
  RETURN_TYPE extends ReturnType<FN>
>
  (targetArity: ARITY, fn: FN, ...existingArgs: EXISTING_ARGS) =>
  // TODO: 类型计算性能优化
  // @ts-expect-error TypeScript 出于性能的担忧会提示“可能出错”
  CurriedNFunction<EXPECTED_ARGS, RETURN_TYPE, EXISTING_ARGS, false>

type HPCurryN = (targetArity: number, fn: AnyFunction, ...args: any[]) => AnyFunction
/**
 * Internal curryN function - strict version
 *
 * Strict internal curry will take exactly the required arity that specified,
 * redundant args will be ignored.
 */
export const curryN: HPCurryN = (targetArity, fn, ...existingArgs) => {
  return (...appendingArgs) => {
    const totalArgs = existingArgs.map(innerArg =>
      isArgPlaceholder(innerArg) ? (appendingArgs.length > 0 ? appendingArgs.shift() : innerArg) : innerArg
    )
    totalArgs.push(...appendingArgs)

    const validArgs = totalArgs.slice(0, targetArity)
    const validLen = validArgs.filter(complement(isArgPlaceholder)).length
    if (validLen < targetArity) {
      return curryN(targetArity, fn, ...totalArgs) // as (typeof existingArgs)
    } else {
      return fn(...validArgs)
    }
  }
}

// export const curry1 = (fn, ...args) => curryN(1, fn, ...args) // just for consistency
// export const curry2 = (fn, ...args) => curryN(2, fn, ...args)
// ...

/******************************************************************************************************
 *
 *                                       Compose and Pipe Function
 *
 ******************************************************************************************************/

type AnyFunction = (...args: any[]) => any
type ExtractFunctionArguments<Fn> = Fn extends (...args: infer P) => any ? P : never
type ExtractFunctionReturnValue<Fn> = Fn extends (...args: any[]) => infer P ? P : never
type Arbitrary = 'Respect: https://github.com/babakness/pipe-and-compose-types/blob/master/index.d.ts'
type IsAny<O, T = true, F = false> = Arbitrary extends O ? any extends O ? T : F : F
type CastFn<FN extends any> = FN extends AnyFunction ? FN : AnyFunction
type CastFns<FNS extends any[]> = FNS extends AnyFunction[] ? FNS : AnyFunction[]
type PipePlaceholder = AnyFunction & { __TYPE__: 'PipePlaceholder' }
type RestrictFNS<
  FNS extends AnyFunction[],
  IsLeftToRight extends boolean = true,
  PreviousFunction extends AnyFunction = PipePlaceholder,
  InitalParams extends any[] = any[],
  ReturnType extends any = any,
  I extends any[] = []
> = {
  'next': FNS extends [infer First, ...infer Rest] ?
      (
        PreviousFunction extends PipePlaceholder ?
          // 第一次执行：将第一个函数的参数作为组合后函数的参数，第一个函数的返回值暂时作为组合后函数的返回值，同时可以供后续函数做参数类型判断
          RestrictFNS<
          CastFns<Rest>, IsLeftToRight, CastFn<First>, ExtractFunctionArguments<First>, ExtractFunctionReturnValue<First>, Next<I>
          > :
            (
              // 第二次及之后的执行会到达这里，将返回值与当前的第一个函数的参数做类型判断
              ReturnType extends ExtractFunctionArguments<First>[0] ?
                // 如果当前函数的参数类型与上一个函数的返回值类型一致，则继续往后执行，并将当前函数的返回值作为组合后函数的返回值
                RestrictFNS<CastFns<Rest>, IsLeftToRight, CastFn<First>, InitalParams, ExtractFunctionReturnValue<First>, Next<I>> :
                  (
                    // 如果当前函数的参数类型与上一个函数的返回值类型不一致，进一步判断上一个函数的返回值类型是否为 Any
                    IsAny<ReturnType> extends true ?
                      // 如果上一个函数的返回值类型为 Any，继续往后执行
                      RestrictFNS<CastFns<Rest>, IsLeftToRight, CastFn<First>, InitalParams, ExtractFunctionReturnValue<First>, Next<I>> :
                      // 如果上一个函数的返回值类型不是 Any，则捕获错误
                        {
                          ERROR: ['Return type ', ReturnType, 'doesn\'t comply with the input of', ExtractFunctionArguments<First>[0]]
                          ERROR_FUNCTION: ['( ', ...ExtractFunctionArguments<First>, ' ) => ', ExtractFunctionReturnValue<First>]
                          POSITION: IsLeftToRight extends true ?
                              ['Left to Right: ', Pos<Prev<I>>, ' -> ', Pos<I>] :
                              ['Right to Left: ', Pos<Prev<I>>, ' -> ', Pos<I>]
                        }
                  )
            )
      ) : never
  'done': (...args: InitalParams) => ReturnType
}[FNS extends [] ? 'done' : 'next']
type Pipe<FNS extends AnyFunction[]> = RestrictFNS<FNS, true>
type Compose<FNS extends AnyFunction[]> = Reverse<FNS> extends infer _ ? RestrictFNS<CastFns<Cast<_, any[]>>, false> : never

type ComposeLeft = <FNS extends AnyFunction[]>
  (...fns: FNS & Pipe<FNS> extends AnyFunction ? FNS : never) => Pipe<FNS>

// NOTE: 另外一种 compose 实现
// @refer: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
// const compose = (...args) => value => args.reduceRight((acc, fn) => fn(acc), value)
// 本质是一个闭包，直觉上不喜欢（虽然能够带来一些调试上的好处）
//   -> @refer: https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
// 下面这种更符合函数式思维，实现上更接近数学定义
export const composeL: HPPipe = (...fns: any[]) => {
  const initialFunction = fns.shift() ?? asIs
  const composedFunction = fns.reduce((g, f) => (...args: any[]) => f(g(...args)), initialFunction)
  return composedFunction
}

type ComposeRight = <FNS extends AnyFunction[]>
  (...fns: FNS & Compose<FNS> extends AnyFunction ? FNS : never) => Compose<FNS>

export const composeR: HPCompose = (...fns: any[]) => (composeL as any)(...fns.reverse())

export const pipeL = composeL
export const pipeR = composeR

type NAryF<S extends any[], R = any> = (...args: S) => R
type UnaryF<I, O> = (input: I) => O
interface HPPipe {
  (): typeof asIs
  <A extends any[], B>(fn1: NAryF<A, B>): NAryF<A, B>
  <A extends any[], B, C>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>): NAryF<A, C>
  <A extends any[], B, C, D>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>): NAryF<A, D>
  <A extends any[], B, C, D, E>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>): NAryF<A, E>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>, fn5: UnaryF<E, F>): NAryF<A, F>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>, fn5: UnaryF<E, F>, fn6: UnaryF<F, G>): NAryF<A, G>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>, fn5: UnaryF<E, F>, fn6: UnaryF<F, G>, fn7: UnaryF<G, H>): NAryF<A, H>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H, I>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>, fn5: UnaryF<E, F>, fn6: UnaryF<F, G>, fn7: UnaryF<G, H>, fn8: UnaryF<H, I>): NAryF<A, I>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H, I, J>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>, fn5: UnaryF<E, F>, fn6: UnaryF<F, G>, fn7: UnaryF<G, H>, fn8: UnaryF<H, I>, fn9: UnaryF<I, J>): NAryF<A, J>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H, I, J, K>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>, fn5: UnaryF<E, F>, fn6: UnaryF<F, G>, fn7: UnaryF<G, H>, fn8: UnaryF<H, I>, fn9: UnaryF<I, J>, fn10: UnaryF<J, K>): NAryF<A, K>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H, I, J, K>(fn1: NAryF<A, B>, fn2: UnaryF<B, C>, fn3: UnaryF<C, D>, fn4: UnaryF<D, E>, fn5: UnaryF<E, F>, fn6: UnaryF<F, G>, fn7: UnaryF<G, H>, fn8: UnaryF<H, I>, fn9: UnaryF<I, J>, fn10: UnaryF<J, K>, ...fns: Array<UnaryF<any, any>>): NAryF<A, any>
}
interface HPCompose {
  (): typeof asIs
  <A extends any[], B>(fn1: NAryF<A, B>): NAryF<A, B>
  <A extends any[], B, C>(fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, C>
  <A extends any[], B, C, D>(fn3: UnaryF<C, D>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, D>
  <A extends any[], B, C, D, E>(fn4: UnaryF<D, E>, fn3: UnaryF<C, D>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, E>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F>(fn5: UnaryF<D, E>, fn4: UnaryF<C, D>, fn3: UnaryF<B, C>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, F>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G>(fn6: UnaryF<E, F>, fn5: UnaryF<D, E>, fn4: UnaryF<C, D>, fn3: UnaryF<B, C>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, G>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H>(fn7: UnaryF<F, G>, fn6: UnaryF<E, F>, fn5: UnaryF<D, E>, fn4: UnaryF<C, D>, fn3: UnaryF<B, C>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, H>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H, I>(fn8: UnaryF<G, H>, fn7: UnaryF<F, G>, fn6: UnaryF<E, F>, fn5: UnaryF<D, E>, fn4: UnaryF<C, D>, fn3: UnaryF<B, C>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, I>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H, I, J>(fn9: UnaryF<H, I>, fn8: UnaryF<G, H>, fn7: UnaryF<F, G>, fn6: UnaryF<E, F>, fn5: UnaryF<D, E>, fn4: UnaryF<C, D>, fn3: UnaryF<B, C>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, J>
  // eslint-disable-next-line max-len
  <A extends any[], B, C, D, E, F, G, H, I, J, K>(fn10: UnaryF<I, J>, fn9: UnaryF<H, I>, fn8: UnaryF<G, H>, fn7: UnaryF<F, G>, fn6: UnaryF<E, F>, fn5: UnaryF<D, E>, fn4: UnaryF<C, D>, fn3: UnaryF<B, C>, fn2: UnaryF<B, C>, fn1: NAryF<A, B>): NAryF<A, K>
}
export const compose: HPCompose = composeR
export const pipe: HPPipe = pipeL

/******************************************************************************************************
 *
 *                                       Memorize Function
 *
 ******************************************************************************************************/

type Memorize =
  <FN extends AnyFunction>
  (fn: FN, hasher: (...args: Parameters<FN>) => any) => (...args: Parameters<FN>) => ReturnType<FN>
export const defaultMemorizeHasher = (...args: any[]): string => JSON.stringify(args)
/**
 * Return a new function which bind to a cache map.
 * When the function is called, it will first check the cache map, if the result is found, return it.
 * Otherwise, call the function and cache the result.
 */
export const memorize: Memorize = (fn, hasher = defaultMemorizeHasher) => {
  const cache = new Map()
  hasher = hasher ?? defaultMemorizeHasher
  return (...args) => {
    const hash = hasher(...args)
    if (cache.get(hash) !== undefined) {
      cache.set(hash, fn(...args))
    }
    return cache.get(hash)
  }
}

/******************************************************************************************************
 *
 *                                       Invoker Function
 *
 ******************************************************************************************************/

// // eslint-disable-next-line @typescript-eslint/ban-types
// type getType<KEY extends string, TARGET extends Object> = TARGET[KEY]
// type getTargetArgs<ARITY extends number, KEY extends string, TARGET> =
//   getType<KEY, TARGET> extends
//   infer _ ?
//       // TODO: 类型计算性能优化
//       // @ts-expect-error TypeScript 出于性能的担忧会提示“可能出错”
//       [...RestrictParams<ARITY, Parameters<Cast<_, AnyFunction>>>, TARGET] : never

// type InvokerCore<ARITY extends number, KEY extends string> =
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   <ARGS extends getTargetArgs<ARITY, KEY, TARGET>, TARGET extends Object>
//   (...args: ARGS) =>
//   ReturnType<Cast<getType<KEY, TARGET>, AnyFunction>>

const invokerFactory = (curryFn: AnyFunction) => {
  return (arity: number, key: string) => {
    const invokerCore = (...args: any[]): any => {
      // curry function controlls how many args will be passed in
      const target = args[args.length - 1]
      if (target[key] === undefined) throw Error(`Can not find "${key}" method in target.'`)
      if (!isFunction(target[key])) throw Error(`"${key}" property in target is not a function.`)
      return target[key](...args.slice(0, args.length - 1))
    }
    return curryFn(arity, invokerCore) as AnyFunction
  }
}
export const invoker = invokerFactory(curryN as AnyFunction)
export const looseInvoker = invokerFactory(looseCurryN as AnyFunction)

/******************************************************************************************************
 *
 *                                       Arity Function
 *
 ******************************************************************************************************/

type FallbackType = (fn: AnyFunction) => AnyFunction

export const nAry = curry((n: number, fn) => curryN(n, fn))
export const looseNAry = curry((n, fn) => looseCurryN(n, fn))
export const quaternary: FallbackType = (fn) =>
  curry((x, y, z, a) => fn(x, y, z, a)) // nAry(4, fn)
export const looseQuaternary: FallbackType = (fn) =>
  looseCurry((x, y, z, a, ...args) => fn(x, y, z, a, ...args)) // looseNAry(4, fn)
export const ternary: FallbackType = fn =>
  curry((x, y, z) => fn(x, y, z)) // nAry(3, fn)
export const looseTernary: FallbackType = fn =>
  looseCurry((x, y, z, ...args) => fn(x, y, z, ...args)) // looseNAry(3, fn)
export const binary: FallbackType = fn =>
  curry((x, y) => fn(x, y)) // nAry(2, fn)
export const looseBinary: FallbackType = fn =>
  looseCurry((x, y, ...args) => fn(x, y, ...args)) // looseNAry(2, fn)
export const unary: FallbackType = fn => x => fn(x)
export const looseUnary: FallbackType = fn => (x, ...args) => fn(x, ...args)

type Tap = (fn: AnyFunction) => <T extends any>(...args: [...any[], T]) => T
export const tap: Tap = fn => (...args) => {
  fn(...args)
  return args[0]
}

type Execute = <FN extends AnyFunction>(fn: FN, ...args: [...Parameters<FN>, ...any[]]) => ReturnType<FN>
export const execute: Execute = (fn, ...args) => fn(...args)

/******************************************************************************************************
 *
 *                                            Quick Tests
 *
 ******************************************************************************************************/

/*
                  arguments num controller & curry test
*/
// const add = (x, y, z) => { console.log(x, y, z) }
// unary(add)(1, 2, 3) // 1, undefined, undefined
// binary(add)(1, 2, 3) // 1, 2, undefined
// nAry(1, add)(1, 2, 3) // 1, undefined, undefined
// nAry(2, add)(1, 2, 3) // 1, 2, undefined
// nAry(3, add)(1, 2, 3) // 1, 2, 3
// looseUnary(add)(1, 2, 3) // 1, 2, 3
// looseBinary(add)(1, 2, 3) // 1, 2, 3
// looseNAry(1, add)(1, 2, 3) // 1, 2, 3
// looseNAry(2, add)(1, 2, 3) // 1, 2, 3
// looseNAry(3, add)(1, 2, 3) // 1, 2, 3

// const gg = (a, b) => {
//   console.warn(a, b)
// }

// const ff = (a, b) => {
//   curry(gg)(a)
// }

// ff(1)
