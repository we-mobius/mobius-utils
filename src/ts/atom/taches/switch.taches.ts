import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput, MutationLike } from '../atoms'

interface WrappedTo<T> {
  type: 'to'
  value: Vacuo | T
}
interface WrappedFrom<F> {
  type: 'from'
  value: Vacuo | F
}

const switchTacheFactory = <F, T>(
  mutationFactory: <iF, iT>() => Mutation<WrappedFrom<iF> | WrappedTo<iT>, iT | Terminator>
) => {
  return (to: AtomLikeOfOutput<T>, from: AtomLikeOfOutput<F>): Data<T> => {
    if (!isAtomLike(to)) {
      throw (new TypeError('"to" is expected to be type of "AtomLike".'))
    }
    if (!isAtomLike(from)) {
      throw (new TypeError('"from" is expected to be type of "AtomLike".'))
    }

    const wrapToM = Mutation.ofLiftLeft<T, WrappedTo<T>>(prev => ({ type: 'to', value: prev }))
    const wrappedToD = Data.empty<WrappedTo<T>>()
    pipeAtom(wrapToM, wrappedToD)

    const wrapFromM = Mutation.ofLiftLeft<F, WrappedFrom<F>>(prev => ({ type: 'from', value: prev }))
    const wrappedFromD = Data.empty<WrappedFrom<F>>()
    pipeAtom(wrapFromM, wrappedFromD)

    // const switchM = Mutation.ofLiftLeft(operation)
    const switchM = mutationFactory<F, T>()
    pipeAtom(wrappedToD, switchM)
    pipeAtom(wrappedFromD, switchM)

    const outputD = Data.empty<T>()
    pipeAtom(switchM, outputD)

    binaryTweenPipeAtom(to, wrapToM)
    binaryTweenPipeAtom(from, wrapFromM)

    return outputD
  }
}

/**
 * switch Tache will emits a "to" value when "from" value comes.
 *
 * If there is not "to" value to emit when "from" value comes,
 * it will emit a TERMINATOR which will stop the stream.
 *
 * @see {@link dynamicSwitchT}, {@link staticSwitchT}, {@link promiseSwitchT}
 */
export const switchT = <F, T>(
  to: AtomLikeOfOutput<T> | T, from: AtomLikeOfOutput<F>
): Data<T> => {
  if (isAtomLike(to)) {
    return dynamicSwitchT(to as AtomLikeOfOutput<T>, from)
  } else {
    return staticSwitchT(to as T, from)
  }
}
interface ISwitchT_ {
  <F, T>(to: AtomLikeOfOutput<T> | T, from: AtomLikeOfOutput<F>): Data<T>
  <F, T>(to: AtomLikeOfOutput<T> | T): (from: AtomLikeOfOutput<F>) => Data<T>
}
/**
 * @see {@link switchT}
 */
export const switchT_: ISwitchT_ = curryN(2, switchT)

/**
 * @see {@link switchT}
 */
export const dynamicSwitchT: <F, T>(to: AtomLikeOfOutput<T>, from: AtomLikeOfOutput<F>) => Data<T> =
switchTacheFactory(<F, T>(): Mutation<WrappedFrom<F> | WrappedTo<T>, T| Terminator> => {
  return Mutation.ofLiftLeft((() => {
    const _internalStates: {
      from: boolean
      to: boolean
    } = { from: false, to: false }
    const _internalValues: {
      from: F | undefined
      to: T | undefined
    } = { from: undefined, to: undefined }

    return (prev: Vacuo | WrappedFrom<F> | WrappedTo<T>): T | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (!_internalStates.from || !_internalStates.to) {
        return TERMINATOR
      }
      if (type === 'to') {
        return TERMINATOR
      }

      if (type === 'from') {
        return _internalValues.to!
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
})
interface IDynamicSwitchT_ {
  <F, T>(to: AtomLikeOfOutput<T>, from: AtomLikeOfOutput<F>): Data<T>
  <F, T>(to: AtomLikeOfOutput<T>): (from: AtomLikeOfOutput<F>) => Data<T>
}
/**
 * @see {@link dynamicSwitchT}
 */
export const dynamicSwitchT_: IDynamicSwitchT_ = curryN(2, dynamicSwitchT)

/**
 * @see {@link switchT}
 */
export const staticSwitchT = <F, T>(
  to: T, from: AtomLikeOfOutput<F>
): Data<T> => {
  return dynamicSwitchT(replayWithLatest(1, Data.of(to)), from)
}
interface IStaticSwitchT_ {
  <F, T>(to: T, from: AtomLikeOfOutput<F>): Data<T>
  <F, T>(to: T): (from: AtomLikeOfOutput<F>) => Data<T>
}
/**
 * @see {@link staticSwitchT}
 */
export const staticSwitchT_: IStaticSwitchT_ = curryN(2, staticSwitchT)

/**
 * promiseSwitch Tache will emits a "to" value when "from" value comes.
 *
 * If there is no "to" value to emit when "from" value comes,
 *   it will make a promise that to emit "to" value when it comes later.
 *
 * @see {@link switchT}
 */
export const promiseSwitchT: <F, T>(to: AtomLikeOfOutput<T>, from: AtomLikeOfOutput<F>) => Data<T> =
switchTacheFactory(<F, T>(): Mutation<WrappedFrom<F> | WrappedTo<T>, T| Terminator> => {
  interface PrivateData {
    type: symbol
    value: T
  }
  const privateDataType = Symbol('privateData')

  const switchM: Mutation<WrappedFrom<F> | WrappedTo<T> | PrivateData, T | Terminator> = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      from: boolean
      to: boolean
      promise: boolean
    } = { from: false, to: false, promise: false }
    const _internalValues: {
      from: F | undefined
      to: T | undefined
    } = { from: undefined, to: undefined }

    return (prev, cur, mutation): T | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      if (type === 'from' || type === 'to') {
        _internalStates[type] = true
        _internalValues[type] = prev.value as any
      }

      if (type === privateDataType) {
        return prev.value
      }

      if (type === 'to') {
        if (_internalStates.promise) {
          // mutation.triggerTransformation(() => _internalValues.to)
          mutation!.mutate(Data.of<WrappedFrom<F> | WrappedTo<T> | PrivateData>({ type: privateDataType, value: prev.value }))
          _internalStates.promise = false
        }
        return TERMINATOR
      }

      if (type === 'from') {
        if (_internalStates.to) {
          return _internalValues.to!
        } else {
          _internalStates.promise = true
          return TERMINATOR
        }
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())

  return switchM as Mutation<WrappedFrom<F> | WrappedTo<T>, T | Terminator>
})
interface IPromiseSwitchT_ {
  <F, T>(to: AtomLikeOfOutput<T>, from: AtomLikeOfOutput<F>): Data<T>
  <F, T>(to: AtomLikeOfOutput<T>): (from: AtomLikeOfOutput<F>) => Data<T>
}
/**
 * @see {@link promiseSwitchT}
 */
export const promiseSwitchT_: IPromiseSwitchT_ = curryN(2, promiseSwitchT)
