import { isArray, isPlainObject, isFunction } from '../../internal/base'
import { looseCurryN } from '../../functional'
import { isMutator } from '../particles'
import { Data, Mutation, isData, isMutation, isAtom } from '../atoms'
import { mutationToDataS, dataToMutationS } from './transform.helpers'

import type { Mutator } from '../particles'
import type { DataLike, MutationLike } from '../atoms'
import type { ReplayDataMediator, ReplayMutationMediator } from '../mediators'

interface BatchCreateOptions {
  forceWrap: boolean
}
const DEFAULT_BATCH_CREATE_OPTIONS: BatchCreateOptions = {
  forceWrap: false
}

/**
 * items will be wrapped in Data.
 */
const forceWrapToData = <V>(item: V): Data<V> => Data.of(item)

interface IWrapToData {
  <V>(item: Data<V>): Data<V>
  <V>(item: ReplayDataMediator<V>): ReplayDataMediator<V>
  <P, C>(item: Mutation<P, C>): Data<C>
  <P, C>(item: ReplayMutationMediator<P, C>): ReplayDataMediator<C>
  <V>(item: V): Data<V>
}
/**
 * Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */
const wrapToData: IWrapToData = (item: any): any => isData(item) ? item : (isMutation(item) ? mutationToDataS(item) : Data.of(item))

/**
 * forceWrap - true: items will be wrapped in Data.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */
export const createDataInArray = <V>(
  arr: V[], options: BatchCreateOptions = DEFAULT_BATCH_CREATE_OPTIONS
): Array<DataLike<any>> => {
  if (!isArray(arr)) {
    throw new TypeError('"arr" is expected to be type of "Array".')
  }

  const { forceWrap } = { ...DEFAULT_BATCH_CREATE_OPTIONS, ...options }

  const wrapFn = forceWrap ? forceWrapToData : wrapToData
  return arr.map(wrapFn)
}
export const createDataInArray_ = looseCurryN(1, createDataInArray)

/**
 * forceWrap - true: items will be wrapped in Data.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */
export const createDataInObject = <V>(
  obj: Record<string, V>, options: BatchCreateOptions = DEFAULT_BATCH_CREATE_OPTIONS
): Record<string, DataLike<any>> => {
  if (!isPlainObject(obj)) {
    throw new TypeError('"obj" is expected to be type of "PlainObjcet".')
  }

  const { forceWrap } = { ...DEFAULT_BATCH_CREATE_OPTIONS, ...options }

  const result: Record<string, any> = {}

  const wrapFn = forceWrap ? forceWrapToData : wrapToData
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = wrapFn(value)
  })

  return result
}
export const createDataInObject_ = looseCurryN(1, createDataInObject)

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
  arr: V[], options: BatchCreateOptions = DEFAULT_BATCH_CREATE_OPTIONS
): Array<MutationLike<any, any>> => {
  if (!isArray(arr)) {
    throw new TypeError('"arr" is expected to be type of "Array".')
  }
  const { forceWrap } = { ...DEFAULT_BATCH_CREATE_OPTIONS, ...options }

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
  obj: Record<string, V>, options: BatchCreateOptions = DEFAULT_BATCH_CREATE_OPTIONS
): Record<string, MutationLike<any, any>> => {
  if (!isPlainObject(obj)) {
    throw new TypeError('"obj" is expected to be type of "PlainObjcet"')
  }

  const { forceWrap } = { ...DEFAULT_BATCH_CREATE_OPTIONS, ...options }

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
  arr: V[], options: BatchCreateOptions = DEFAULT_BATCH_CREATE_OPTIONS
): Array<DataLike<any> | MutationLike<any, any>> => {
  if (!isArray(arr)) {
    throw new TypeError('"arr" is expected to be type of "Array".')
  }

  const { forceWrap } = { ...DEFAULT_BATCH_CREATE_OPTIONS, ...options }

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
  obj: Record<string, V>, options: BatchCreateOptions = DEFAULT_BATCH_CREATE_OPTIONS
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
