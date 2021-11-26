import { isFunction, isPlainObject } from '../../internal'
import { looseCurryN } from '../../functional'
import { Mutation, isMutation, Data, isData, isAtom } from '../atoms'
import { isReplayMediator, replayWithLatest } from '../mediators'

import type { MutatorTransformation, LiftBothTransformation, LiftLeftTransformation, LiftRightTransformation } from '../particles'
import type { DataOptions, MutationOptions } from '../atoms'
import type { ReplayDataMediator, ReplayMutationMediator } from '../mediators'

interface IMutationToDataS {
  <P, C>(mutation: Mutation<P, C>, options?: DataOptions): Data<C>
  <P, C>(mutation: ReplayMutationMediator<Mutation<P, C>>, options?: DataOptions): ReplayDataMediator<Data<C>>
}
/**
 * @param mutation Mutation
 * @return atom Data
 */
export const mutationToDataS: IMutationToDataS = (mutation: any, options: any = {}): any => {
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" is expected to be type of "Mutation".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const _data = Data.empty(options)
  // mutation -> _data
  _data.observe(mutation)

  if (isReplayMediator(mutation)) {
    return replayWithLatest(1, _data)
  } else {
    return _data
  }
}
export const mutationToDataS_ = looseCurryN(1, mutationToDataS)

interface IMutationToData {
  <P, C, C2>(
    transformation: MutatorTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<P, C>
  ): Data<C2>
  <P, C, C2>(
    transformation: LiftBothTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<P, C>
  ): Data<C2>
  <P, C, C2>(
    transformation: LiftLeftTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<P, C>
  ): Data<C2>
  <P, C, C2>(
    transformation: LiftRightTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<P, C>
  ): Data<C2>
  <P, C, C2>(
    transformation: MutatorTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<P, C>
  ): ReplayDataMediator<Data<C2>>
  <P, C, C2>(
    transformation: LiftBothTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<P, C>
  ): ReplayDataMediator<Data<C2>>
  <P, C, C2>(
    transformation: LiftLeftTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<P, C>
  ): ReplayDataMediator<Data<C2>>
  <P, C, C2>(
    transformation: LiftRightTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<P, C>
  ): ReplayDataMediator<Data<C2>>
}
/**
 * @param transform Function
 * @param mutation Mutation
 * @param options Object, optional
 * @return atom Data | ReplayMediator, same type of param "mutation"
 */
export const mutationToData: IMutationToData = (transformation: any, mutation: any, options: any = { }): any => {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" is expected to be type of "Mutation".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const _data = Data.empty()
  const _mutation = Mutation.ofLift(transformation, options)
  const _data2 = Data.empty()

  // mutation -> _data -> _mutation -> _data2
  _data2.observe(_mutation)
  _mutation.observe(_data)
  _data.observe(mutation)

  if (isReplayMediator(mutation)) {
    return replayWithLatest(1, _data2)
  } else {
    return _data2
  }
}
export const mutationToData_ = looseCurryN(2, mutationToData)

interface IDataToData {
  <V1, V2>(
    transformation: MutatorTransformation<V1, V2>, data: Data<V1>, options?: MutationOptions<V1, V2>
  ): Data<V2>
  <V1, V2>(
    transformation: LiftBothTransformation<V1, V2>, data: Data<V1>, options?: MutationOptions<V1, V2>
  ): Data<V2>
  <V1, V2>(
    transformation: LiftLeftTransformation<V1, V2>, data: Data<V1>, options?: MutationOptions<V1, V2>
  ): Data<V2>
  <V1, V2>(
    transformation: LiftRightTransformation<V1, V2>, data: Data<V1>, options?: MutationOptions<V1, V2>
  ): Data<V2>
  <V1, V2>(
    transformation: MutatorTransformation<V1, V2>, data: ReplayDataMediator<Data<V1>>, options?: MutationOptions<V1, V2>
  ): ReplayDataMediator<Data<V2>>
  <V1, V2>(
    transformation: LiftBothTransformation<V1, V2>, data: ReplayDataMediator<Data<V1>>, options?: MutationOptions<V1, V2>
  ): ReplayDataMediator<Data<V2>>
  <V1, V2>(
    transformation: LiftLeftTransformation<V1, V2>, data: ReplayDataMediator<Data<V1>>, options?: MutationOptions<V1, V2>
  ): ReplayDataMediator<Data<V2>>
  <V1, V2>(
    transformation: LiftRightTransformation<V1, V2>, data: ReplayDataMediator<Data<V1>>, options?: MutationOptions<V1, V2>
  ): ReplayDataMediator<Data<V2>>
}
/**
 * @param transform Function
 * @param data Data | ReplayMediator
 * @param options Object, optional
 * @return atom Data | ReplayMediator, same type of param "data"
 */
export const dataToData: IDataToData = (transformation: any, data: any, options: any = {}): any => {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isData(data)) {
    throw (new TypeError('"data" is expected to be type of "Data".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const _mutation = Mutation.ofLift(transformation, options)
  const _data = Data.empty()

  // data -> _mutation -> _data
  _data.observe(_mutation)
  _mutation.observe(data)

  if (isReplayMediator(data)) {
    return replayWithLatest(1, _data)
  } else {
    return _data
  }
}
export const dataToData_ = looseCurryN(2, dataToData)

interface IAtomToData extends IMutationToData, IDataToData {}
/**
 * @param transform Function
 * @param atom Atom
 * @param options Object, optional
 * @return atom Data
 */
export const atomToData: IAtomToData = (transformation: any, atom: any, options: any = {}): any => {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isAtom(atom)) {
    throw (new TypeError('"atom" is expected to be type of "Mutation" | "Data".'))
  }

  if (isMutation(atom)) {
    return mutationToData(transformation, atom, options)
  } else if (isData(atom)) {
    return dataToData(transformation, atom, options)
  } else {
    throw (new TypeError('Unrecognized type of "Atom" received in atomToData, expected "Mutation" | "Data".'))
  }
}
export const atomToData_ = looseCurryN(2, atomToData)

interface IDataToMutationS {
  <V>(data: Data<V>, options?: MutationOptions<V, V>): Mutation<V, V>
  <V>(data: ReplayDataMediator<Data<V>>, options?: MutationOptions<V, V>): ReplayMutationMediator<Mutation<V, V>>
}
/**
 * @param data Data
 * @return atom Mutation
 */
export const dataToMutationS: IDataToMutationS = (data: any, options: any = {}): any => {
  if (!isData(data)) {
    throw (new TypeError('"data" is expected to be type of "Data".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  // TODO: nosense now
  const _mutation = Mutation.ofLiftBoth(prev => prev, options)

  // data -> _mutation
  _mutation.observe(data)

  if (isReplayMediator(data)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
}
export const dataToMutationS_ = looseCurryN(1, dataToMutationS)

interface IDataToMutation {
  <V, V2>(transformation: MutatorTransformation<V, V2>, data: Data<V>, options?: MutationOptions<V, V2>): Mutation<V, V2>
  <V, V2>(transformation: LiftBothTransformation<V, V2>, data: Data<V>, options?: MutationOptions<V, V2>): Mutation<V, V2>
  <V, V2>(transformation: LiftLeftTransformation<V, V2>, data: Data<V>, options?: MutationOptions<V, V2>): Mutation<V, V2>
  <V, V2>(transformation: LiftRightTransformation<V, V2>, data: Data<V>, options?: MutationOptions<V, V2>): Mutation<V, V2>
  <V, V2>(
    transformation: MutatorTransformation<V, V2>, data: ReplayDataMediator<Data<V>>, options?: MutationOptions<V, V2>
  ): ReplayMutationMediator<Mutation<V, V2>>
  <V, V2>(
    transformation: LiftBothTransformation<V, V2>, data: ReplayDataMediator<Data<V>>, options?: MutationOptions<V, V2>
  ): ReplayMutationMediator<Mutation<V, V2>>
  <V, V2>(
    transformation: LiftLeftTransformation<V, V2>, data: ReplayDataMediator<Data<V>>, options?: MutationOptions<V, V2>
  ): ReplayMutationMediator<Mutation<V, V2>>
  <V, V2>(
    transformation: LiftRightTransformation<V, V2>, data: ReplayDataMediator<Data<V>>, options?: MutationOptions<V, V2>
  ): ReplayMutationMediator<Mutation<V, V2>>
}
/**
 * @param transformation Function
 * @param data Atom
 * @param options Object, optional
 * @retrun atom Mutation
 */
export const dataToMutation: IDataToMutation = (transformation: any, data: any, options: any = {}): any => {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isData(data)) {
    throw (new TypeError('"data" is expected to be type of "Data".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const _mutation = Mutation.ofLift(transformation, options)

  // data -> _mutation
  _mutation.observe(data)

  if (isReplayMediator(data)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
}
export const dataToMutation_ = looseCurryN(2, dataToMutation)

interface IMutationToMutation {
  <P, C, C2>(transformation: MutatorTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<C, C2>): Mutation<C, C2>
  <P, C, C2>(transformation: LiftBothTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<C, C2>): Mutation<C, C2>
  <P, C, C2>(transformation: LiftLeftTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<C, C2>): Mutation<C, C2>
  <P, C, C2>(transformation: LiftRightTransformation<C, C2>, mutation: Mutation<P, C>, options?: MutationOptions<C, C2>): Mutation<C, C2>

  <P, C, C2>(
    transformation: MutatorTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<C, C2>
  ): ReplayMutationMediator<Mutation<C, C2>>
  <P, C, C2>(
    transformation: LiftBothTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<C, C2>
  ): ReplayMutationMediator<Mutation<C, C2>>
  <P, C, C2>(
    transformation: LiftLeftTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<C, C2>
  ): ReplayMutationMediator<Mutation<C, C2>>
  <P, C, C2>(
    transformation: LiftRightTransformation<C, C2>, mutation: ReplayMutationMediator<Mutation<P, C>>, options?: MutationOptions<C, C2>
  ): ReplayMutationMediator<Mutation<C, C2>>
}
/**
 * @param transformation Function
 * @param mutation Mutation
 * @param options Object, optional
 * @return atom Mutation
 */
export const mutationToMutation: IMutationToMutation = (transformation: any, mutation: any, options: any = {}): any => {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" is expected to be type of "Mutation".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const _data = Data.empty()
  const _mutation = Mutation.ofLift(transformation, options)

  // mutation -> _data -> _mutation
  _mutation.observe(_data)
  _data.observe(mutation)

  if (isReplayMediator(mutation)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
}
export const mutationToMutation_ = looseCurryN(2, mutationToMutation)

interface IAtomToMutation extends IDataToMutation, IMutationToMutation {}
/**
 * @param transform Function
 * @param atom Atom
 * @param options Object, optional
 * @param atom Mutation
 */
export const atomToMutation: IAtomToMutation = (transform: any, atom: any, options: any = {}): any => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" is expected to be type of "Function".'))
  }
  if (!isAtom(atom)) {
    throw (new TypeError('"atom" is expected to be type of "Mutation" | "Data".'))
  }

  if (isMutation(atom)) {
    return mutationToMutation(transform, atom, options)
  }
  if (isData(atom)) {
    return dataToMutation(transform, atom, options)
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToMutation, expected "Mutation" | "Data".'))
}
export const atomToMutation_ = looseCurryN(2, atomToMutation)
