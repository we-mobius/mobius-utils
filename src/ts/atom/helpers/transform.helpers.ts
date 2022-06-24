import { isFunction, isPlainObject } from '../../internal'
import { looseCurryN } from '../../functional'
import {
  Mutation, isMutation, Data, isData, isAtomLike,
  DEFAULT_DATA_OPTIONS, DEFAULT_MUTATION_OPTIONS
} from '../atoms'
import { isReplayMediator, replayWithLatest } from '../mediators'

import type {
  MutatorOriginalTransformationUnion
} from '../particles'
import type { DataOptions, MutationOptions } from '../atoms'
import type { ReplayDataMediator, ReplayMutationMediator } from '../mediators'

export type MutationToData<Target = any> = Target extends Mutation<any, infer C>
  ? Data<C>
  : Target extends ReplayMutationMediator<any, infer C>
    ? ReplayDataMediator<C>
    : never
export function mutationToDataS <P = any, C = any> (
  mutationLike: Mutation<P, C>, options?: DataOptions
): Data<C>
export function mutationToDataS <P = any, C = any> (
  mutationLike: ReplayMutationMediator<P, C>, options?: DataOptions
): ReplayDataMediator<C>
export function mutationToDataS <P = any, C = any> (
  mutationLike: Mutation<P, C> | ReplayMutationMediator<P, C>, options: DataOptions = DEFAULT_DATA_OPTIONS
): Data<C> | ReplayDataMediator<C> {
  if (!isMutation(mutationLike)) {
    throw (new TypeError('"mutation" is expected to be type of "MutationLike".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions = { ...DEFAULT_DATA_OPTIONS, ...options }

  const finalData = Data.empty<C>(preparedOptions)
  // mutation -> finalData
  finalData.observe(mutationLike)

  if (isReplayMediator(mutationLike)) {
    return replayWithLatest(1, finalData)
  } else {
    return finalData
  }
}
/**
 * Curried version of {@link mutationToDataS}.
 */
export const mutationToDataS_ = looseCurryN(1, mutationToDataS)

export function mutationToData <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: Mutation<P, C>, options?: MutationOptions<C, C2>
): Data<C2>
export function mutationToData <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: ReplayMutationMediator<P, C>, options?: MutationOptions<C, C2>
): ReplayDataMediator<C2>
export function mutationToData <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>,
  mutationLike: Mutation<P, C> | ReplayMutationMediator<P, C>,
  options: MutationOptions<C, C2> = DEFAULT_MUTATION_OPTIONS
): Data<C2> | ReplayDataMediator<C2> {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isMutation(mutationLike)) {
    throw (new TypeError('"mutation" is expected to be type of "Mutation".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions = { ...DEFAULT_MUTATION_OPTIONS, ...options }

  const _data = Data.empty<C>()
  const _mutation = Mutation.ofLift<C, C2>(transformation, preparedOptions)
  const _data2 = Data.empty<C2>()

  // mutation -> _data -> _mutation -> _data2
  _data2.observe(_mutation)
  _mutation.observe(_data)
  _data.observe(mutationLike)

  if (isReplayMediator(mutationLike)) {
    return replayWithLatest(1, _data2)
  } else {
    return _data2
  }
}
/**
 * Curried version of {@link mutationToData}.
 */
export const mutationToData_ = looseCurryN(2, mutationToData)

export function dataToData <V1 = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V1, V2>, dataLike: Data<V1>, options?: MutationOptions<V1, V2>
): Data<V2>
export function dataToData <V1 = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V1, V2>, dataLike: ReplayDataMediator<V1>, options?: MutationOptions<V1, V2>
): ReplayDataMediator<V2>
export function dataToData <V1 = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V1, V2>,
  dataLike: Data<V1> | ReplayDataMediator<V1>,
  options: MutationOptions<V1, V2> = DEFAULT_MUTATION_OPTIONS
): Data<V2> | ReplayDataMediator<V2> {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isData(dataLike)) {
    throw (new TypeError('"data" is expected to be type of "DataLike".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions = { ...DEFAULT_MUTATION_OPTIONS, ...options }

  const _mutation = Mutation.ofLift<V1, V2>(transformation, preparedOptions)
  const _data = Data.empty<V2>()

  // data -> _mutation -> _data
  _data.observe(_mutation)
  _mutation.observe(dataLike)

  if (isReplayMediator(dataLike)) {
    return replayWithLatest(1, _data)
  } else {
    return _data
  }
}
/**
 * Curried version of {@link dataToData}.
 */
export const dataToData_ = looseCurryN(2, dataToData)

export function atomToData <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: Mutation<P, C>, options?: MutationOptions<C, C2>
): Data<C2>
export function atomToData <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: ReplayMutationMediator<P, C>, options?: MutationOptions<C, C2>
): ReplayDataMediator<C2>
export function atomToData <V1 = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V1, V2>, dataLike: Data<V1>, options?: MutationOptions<V1, V2>
): Data<V2>
export function atomToData <V1 = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V1, V2>, dataLike: ReplayDataMediator<V1>, options?: MutationOptions<V1, V2>
): ReplayDataMediator<V2>
export function atomToData (transformation: any, atomLike: any, options: any = {}): any {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isAtomLike(atomLike)) {
    throw (new TypeError('"atom" is expected to be type of "AtomLike".'))
  }

  if (isMutation(atomLike)) {
    return mutationToData(transformation, atomLike, options)
  } else if (isData(atomLike)) {
    return dataToData(transformation, atomLike, options)
  } else {
    throw (new TypeError('Unrecognized type of "Atom" received in atomToData, expected "AtomLike".'))
  }
}
/**
 * Curried version of {@link atomToData}.
 */
export const atomToData_ = looseCurryN(2, atomToData)

export type DataToMutation<Target = any> = Target extends Data<infer V>
  ? Mutation<V, V>
  : Target extends ReplayDataMediator<infer V>
    ? ReplayMutationMediator<V, V>
    : never
export function dataToMutationS <V = any> (
  dataLike: Data<V>, options?: MutationOptions<V, V>
): Mutation<V, V>
export function dataToMutationS <V = any> (
  dataLike: ReplayDataMediator<V>, options?: MutationOptions<V, V>
): ReplayMutationMediator<V, V>
export function dataToMutationS <V = any> (
  dataLike: Data<V> | ReplayDataMediator<V>, options: MutationOptions<V, V> = DEFAULT_MUTATION_OPTIONS
): Mutation<V, V> | ReplayMutationMediator<V, V> {
  if (!isData(dataLike)) {
    throw (new TypeError('"data" is expected to be type of "DataLike".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  // Passby anything received
  const _mutation = Mutation.ofLiftBoth<V, V>(prev => prev as any, options)

  // data -> _mutation
  _mutation.observe(dataLike)

  if (isReplayMediator(dataLike)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
}
/**
 * Curried version of {@link dataToMutationS}.
 */
export const dataToMutationS_ = looseCurryN(1, dataToMutationS)

export function dataToMutation <V = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V, V2>, dataLike: Data<V>, options?: MutationOptions<V, V2>
): Mutation<V, V2>
export function dataToMutation <V = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V, V2>, dataLike: ReplayDataMediator<V>, options?: MutationOptions<V, V2>
): ReplayMutationMediator<V, V2>
export function dataToMutation <V = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V, V2>,
  dataLike: Data<V> | ReplayDataMediator<V>, options: MutationOptions<V, V2> = DEFAULT_MUTATION_OPTIONS
): Mutation<V, V2> | ReplayMutationMediator<V, V2> {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isData(dataLike)) {
    throw (new TypeError('"data" is expected to be type of "DataLike".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions = { ...DEFAULT_MUTATION_OPTIONS, ...options }

  const _mutation = Mutation.ofLift<V, V2>(transformation, preparedOptions)

  // data -> _mutation
  _mutation.observe(dataLike)

  if (isReplayMediator(dataLike)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
}
/**
 * Curried version of {@link dataToMutation}.
 */
export const dataToMutation_ = looseCurryN(2, dataToMutation)

export function mutationToMutation<P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: Mutation<P, C>, options?: MutationOptions<C, C2>
): Mutation<C, C2>
export function mutationToMutation<P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: ReplayMutationMediator<P, C>, options?: MutationOptions<C, C2>
): ReplayMutationMediator<C, C2>
export function mutationToMutation <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>,
  mutationLike: Mutation<P, C> | ReplayMutationMediator<P, C>, options: MutationOptions<C, C2> = DEFAULT_MUTATION_OPTIONS
): Mutation<C, C2> | ReplayMutationMediator<C, C2> {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isMutation(mutationLike)) {
    throw (new TypeError('"mutation" is expected to be type of "MutationLike".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions = { ...DEFAULT_MUTATION_OPTIONS, ...options }

  const _data = Data.empty<C>()
  const _mutation = Mutation.ofLift<C, C2>(transformation, preparedOptions)

  // mutation -> _data -> _mutation
  _mutation.observe(_data)
  _data.observe(mutationLike)

  if (isReplayMediator(mutationLike)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
}
/**
 * Curried version of {@link mutationToMutation}.
 */
export const mutationToMutation_ = looseCurryN(2, mutationToMutation)

export function atomToMutation <V = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V, V2>, dataLike: Data<V>, options?: MutationOptions<V, V2>
): Mutation<V, V2>
export function atomToMutation <V = any, V2 = any> (
  transformation: MutatorOriginalTransformationUnion<V, V2>, dataLike: ReplayDataMediator<V>, options?: MutationOptions<V, V2>
): ReplayMutationMediator<V, V2>
export function atomToMutation <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: Mutation<P, C>, options?: MutationOptions<C, C2>
): Mutation<C, C2>
export function atomToMutation <P = any, C = any, C2 = any> (
  transformation: MutatorOriginalTransformationUnion<C, C2>, mutationLike: ReplayMutationMediator<P, C>, options?: MutationOptions<C, C2>
): ReplayMutationMediator<C, C2>
export function atomToMutation (transform: any, atomLike: any, options: any = {}): any {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isAtomLike(atomLike)) {
    throw (new TypeError('"atom" is expected to be type of "AtomLike".'))
  }

  if (isMutation(atomLike)) {
    return mutationToMutation(transform, atomLike, options)
  }
  if (isData(atomLike)) {
    return dataToMutation(transform, atomLike, options)
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToMutation, expected "AtomLike".'))
}
/**
 * Curried version of {@link atomToMutation}.
 */
export const atomToMutation_ = looseCurryN(2, atomToMutation)
