import { isArray, isPlainObject, isFunction } from '../../internal/base'
import { looseCurryN } from '../../functional'
import { isMutator } from '../particles'
import { Data, Mutation, isData, isMutation, isAtom } from '../atoms'
import { mutationToDataS, dataToMutationS } from './transform.helpers'

import type { IsArray, IsTuple, ObjectPrettify } from '../../@types/index'
import type { Mutator } from '../particles'
import type { DataLike, MutationLike } from '../atoms'
import type { ReplayDataMediator, ReplayMutationMediator } from '../mediators'

interface BatchMakeOptions {
  forceWrap: boolean
}
const DEFAULT_BATCH_MAKE_OPTIONS: Required<BatchMakeOptions> = {
  forceWrap: false
}

/**
 * Items will be wrapped in `Data`.
 */
function forceWrapToData <V = any> (target: V): Data<V> {
  return Data.of(target)
}

type WrapToData<Target = any> = Target extends Data<infer V>
  ? Data<V>
  : Target extends ReplayDataMediator<infer V>
    ? ReplayDataMediator<V>
    : Target extends Mutation<any, infer C>
      ? Data<C>
      : Target extends ReplayMutationMediator<any, infer C>
        ? ReplayDataMediator<C>
        : Data<Target>
/**
 * Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */
function wrapToData <V = any> (target: Data<V>): Data<V>
function wrapToData <V = any> (target: ReplayDataMediator<V>): ReplayDataMediator<V>
function wrapToData <P = any, C = any> (target: Mutation<P, C>): Data<C>
function wrapToData <P = any, C = any> (target: ReplayMutationMediator<P, C>): ReplayDataMediator<C>
function wrapToData <V = any> (target: V): Data<V>
function wrapToData (target: any): any {
  return isData(target) ? target : (isMutation(target) ? mutationToDataS(target) : Data.of(target))
}

export type WrapDataInArray<T extends readonly any[]> = IsArray<T> extends true
  // check whether the array is readonly
  ? T extends any[]
    ? (T extends Array<infer U> ? Array<WrapToData<U>> : never)
    : (T extends ReadonlyArray<infer U> ? ReadonlyArray<WrapToData<U>> : never)
  : IsTuple<T> extends true
    // check whether the tuple is readonly
    ? T extends any[]
      ? T extends [infer First, ...infer Rest] ? [WrapToData<First>, ...WrapDataInArray<Rest>] : []
      : T extends readonly [infer First, ...infer Rest] ? readonly [WrapToData<First>, ...WrapDataInArray<Rest>] : readonly []
    : never
export type ForceWrapDataInArray<T extends readonly any[]> = IsArray<T> extends true
  // check whether the array is readonly
  ? T extends any[]
    ? (T extends Array<infer U> ? Array<Data<U>> : never)
    : (T extends ReadonlyArray<infer U> ? ReadonlyArray<Data<U>> : never)
  : IsTuple<T> extends true
    // check whether the tuple is readonly
    ? T extends any[]
      ? T extends [infer First, ...infer Rest] ? [Data<First>, ...ForceWrapDataInArray<Rest>] : []
      : T extends readonly [infer First, ...infer Rest] ? readonly [Data<First>, ...ForceWrapDataInArray<Rest>] : readonly []
    : never
/**
 * forceWrap - true: items will be wrapped in Data. See {@link forceWrapToData}.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled,
 *                    other values will be wrapped in Data. See {@link wrapToData}.
 * @example
 * ```
 *   const tupleA: [number, Data<number>, number] = [1, Data.of(2), 3]
 *   const arrayA = [1, 2, 3]
 *   // Expect: [Data<number>, Data<number>, Data<number>]
 *   const dataInTupleA = makeDataInArray(tupleA)
 *   // Expect: Data<number>[]
 *   const dataInArrayA = makeDataInArray(arrayA)
 * ```
 */
export function makeDataInArray <V extends readonly any[] = any> (
  targets: V, options?: BatchMakeOptions & { forceWrap: false }
): WrapDataInArray<V>
export function makeDataInArray <V extends readonly any[] = any> (
  targets: V, options?: BatchMakeOptions & { forceWrap: true }
): ForceWrapDataInArray<V>
export function makeDataInArray <V extends readonly any[] = any> (
  targets: V, options: BatchMakeOptions = DEFAULT_BATCH_MAKE_OPTIONS
): Array<DataLike<any>> {
  if (!isArray(targets)) {
    throw new TypeError('"targets" is expected to be type of "Array".')
  }

  const preparedOptions = { ...DEFAULT_BATCH_MAKE_OPTIONS, ...options }
  const { forceWrap } = preparedOptions

  const wrapFn = forceWrap ? forceWrapToData : wrapToData
  return targets.map(wrapFn)
}
/**
 * Curried version of {@link makeDataInArray}.
 */
export const makeDataInArray_ = looseCurryN(1, makeDataInArray)

type WrapDataInObject<T extends Record<any, any>> = ObjectPrettify<{
  [Key in keyof T]: WrapToData<T[Key]>
}>
type ForceWrapDataInObject<T extends Record<any, any>> = ObjectPrettify<{
  [Key in keyof T]: Data<T[Key]>
}>
/**
 * forceWrap - true: items will be wrapped in Data. See {@link forceWrapToData}.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled,
 *                    other values will be wrapped in Data. See {@link wrapToData}.
 * @example
 * ```
 *   const indexedObject: { [key: string]: number } = { a: 1, b: 2, c: 3 }
 *   // Expect: Record<string, Data<number>>
 *   const dataInIndexedObject = makeDataInObject(indexedObject)
 *   const namedObject = { a: 1, b: Data.of(2), c: 3 }
 *   // Expect: { a: Data<number>, b: Data<number>, c: Data<number> }
 *   const dataInNamedObject = makeDataInObject(namedObject)
 * ```
 */
export function makeDataInObject <V extends Record<any, any>> (
  targets: V, options?: BatchMakeOptions & { forceWrap: false }
): WrapDataInObject<V>
export function makeDataInObject <V extends Record<any, any>> (
  targets: V, options?: BatchMakeOptions & { forceWrap: true }
): ForceWrapDataInObject<V>
export function makeDataInObject <V extends Record<any, any> = any> (
  targets: Record<string, V>, options: BatchMakeOptions = DEFAULT_BATCH_MAKE_OPTIONS
): Record<string, DataLike<any>> {
  if (!isPlainObject(targets)) {
    throw new TypeError('"targets" is expected to be type of "PlainObject".')
  }

  const preparedOptions = { ...DEFAULT_BATCH_MAKE_OPTIONS, ...options }
  const { forceWrap } = preparedOptions

  const result: Record<string, any> = { }

  const wrapFn = forceWrap ? forceWrapToData : wrapToData
  Object.entries(targets).forEach(([key, value]) => {
    result[key] = wrapFn(value)
  })

  return result
}
/**
 * Curried version of {@link makeDataInObject}.
 */
export const makeDataInObject_ = looseCurryN(1, makeDataInObject)

/**
 * Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */
const forceWrapToMutation = <V>(item: V): Mutation<any, V> => Mutation.of(() => item)

interface IWrapToMutation {
  <V>(item: Data<V>): Mutation<any, V>
  <V>(item: ReplayDataMediator<V>): ReplayMutationMediator<any, V>
  <P, C>(item: Mutation<P, C>): Mutation<P, C>
  <P, C>(item: ReplayMutationMediator<P, C>): ReplayMutationMediator<P, C>
  <P, C>(item: Mutator<P, C>): Mutation<P, C>
  <P, C>(item: (prev?: P, cur?: C, ...args: any[]) => C): Mutation<P, C>
  <V>(item: V): Mutation<any, V>
}
/**
 * Item will be wrapped in Mutation.
 */
const wrapToMutation: IWrapToMutation = (item: any): any => {
  if (isData(item)) {
    return dataToMutationS(item)
  } else if (isMutation(item)) {
    return item
  } else if (isMutator(item)) {
    return Mutation.of(item)
  } else if (isFunction(item)) {
    return Mutation.ofLiftBoth(item)
  } else {
    return Mutation.of(() => item)
  }
}

/**
 * forceWrap - true: items will be wrapped in Mutation.
 *
 * forceWrap - false: Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */
export const createMutationInArray = <V>(
  arr: V[], options: BatchMakeOptions = DEFAULT_BATCH_MAKE_OPTIONS
): Array<MutationLike<any, any>> => {
  if (!isArray(arr)) {
    throw new TypeError('"arr" is expected to be type of "Array".')
  }
  const { forceWrap } = { ...DEFAULT_BATCH_MAKE_OPTIONS, ...options }

  const wrapFn = forceWrap ? forceWrapToMutation : wrapToMutation
  return arr.map(wrapFn)
}
export const createMutationInArray_ = looseCurryN(1, createMutationInArray)

/**
 * forceWrap - true: items will be wrapped in Mutation.
 *
 * forceWrap - false: Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */
export const createMutationInObject = <V>(
  obj: Record<string, V>, options: BatchMakeOptions = DEFAULT_BATCH_MAKE_OPTIONS
): Record<string, MutationLike<any, any>> => {
  if (!isPlainObject(obj)) {
    throw new TypeError('"obj" is expected to be type of "PlainObjcet"')
  }

  const { forceWrap } = { ...DEFAULT_BATCH_MAKE_OPTIONS, ...options }

  const result: Record<string, any> = {}

  const wrapFn = forceWrap ? forceWrapToMutation : wrapToMutation
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = wrapFn(value)
  })

  return result
}
export const createMutationInObject_ = looseCurryN(1, createMutationInObject)

/**
 * functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
const forceWrapToAtom = forceWrapToData

interface IWrapToAtom {
  <V>(item: V): Data<V>
  <V>(item: ReplayDataMediator<V>): ReplayDataMediator<V>
  <P, C>(item: Mutation<P, C>): Mutation<P, C>
  <P, C>(item: ReplayMutationMediator<P, C>): ReplayMutationMediator<P, C>
  <P, C>(item: Mutator<P, C>): Mutation<P, C>
  <P, C>(item: (prev?: P, cur?: C, ...args: any[]) => C): Mutation<P, C>
  <V>(item: V): Data<V>
}
/**
 * Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
const wrapToAtom: IWrapToAtom = (item: any): any => {
  if (isAtom(item)) {
    return item
  } else if (isMutator(item)) {
    return Mutation.of(item)
  } else if (isFunction(item)) {
    return Mutation.ofLiftBoth(item)
  } else {
    return Data.of(item)
  }
}

/**
 * forceWrap - true: functions will be wrapped in Mutation, other values will be wrapped in Data.
 *
 * forceWrap - false: Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
export const createAtomInArray = <V>(
  arr: V[], options: BatchMakeOptions = DEFAULT_BATCH_MAKE_OPTIONS
): Array<DataLike<any> | MutationLike<any, any>> => {
  if (!isArray(arr)) {
    throw new TypeError('"arr" is expected to be type of "Array".')
  }

  const { forceWrap } = { ...DEFAULT_BATCH_MAKE_OPTIONS, ...options }

  const wrapFn = forceWrap ? forceWrapToAtom : wrapToAtom
  return arr.map(wrapFn)
}
export const createAtomInArray_ = looseCurryN(1, createAtomInArray)

/**
 * forceWrap - true: functions will be wrapped in Mutation, other values will be wrapped in Data.
 *
 * forceWrap - false: Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
export const createAtomInObject = <V>(
  obj: Record<string, V>, options: BatchMakeOptions = DEFAULT_BATCH_MAKE_OPTIONS
): Record<string, DataLike<any> | MutationLike<any, any>> => {
  if (!isPlainObject(obj)) {
    throw new TypeError('"obj" is expected to be type of "PlainObject".')
  }

  const { forceWrap = false } = options

  const result: Record<string, any> = {}

  const wrapFn = forceWrap ? forceWrapToAtom : wrapToAtom
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = wrapFn(value)
  })

  return result
}
export const createAtomInObject_ = looseCurryN(1, createAtomInObject)
