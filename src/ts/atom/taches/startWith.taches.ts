import { curryN } from '../../functional'
import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * @see {@link dynamicStartWithT}, {@link staticStartWithT}
 */
export const startWithT = <V>(
  start: AtomLikeOfOutput<V> | V, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isAtomLike(start)) {
    return dynamicStartWithT(start as AtomLikeOfOutput<V>, target)
  } else {
    return staticStartWithT(start as V, target)
  }
}
/**
 * @see {@link startWithT}
 */
export const startWithT_ = curryN(2, startWithT)

/**
 * @see {@link startWithT}
 */
export const dynamicStartWithT = <V>(
  start: AtomLikeOfOutput<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(start)) {
    throw (new TypeError('"start" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  start = replayWithLatest(1, start as any)

  interface WrappedStart {
    type: 'start'
    value: Vacuo | V
  }
  const wrapStartM = Mutation.ofLiftLeft<V, WrappedStart>(prev => ({ type: 'start', value: prev }))
  const wrappedStartD = Data.empty<WrappedStart>()
  pipeAtom(wrapStartM, wrappedStartD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  interface PrivateData {
    type: symbol
    value: V
  }
  const privateDataType = Symbol('privateData')

  const startM: Mutation<WrappedStart | WrappedTarget | PrivateData, V | Terminator> = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      start: boolean
      target: boolean
      startExpired: boolean
    } = { start: false, target: false, startExpired: false }
    const _internalValues: {
      start: V | undefined
      target: V | undefined
      targetQueue: V[]
    } = { start: undefined, target: undefined, targetQueue: [] }

    return (prev: Vacuo | WrappedStart | WrappedTarget | PrivateData, cur: any, mutation?: typeof startM): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      if (type === 'start' || type === 'target') {
        _internalStates[type] = true
        _internalValues[type] = prev.value
      }

      if (type === privateDataType) {
        return prev.value
      }

      if (type === 'target') {
        if (_internalStates.startExpired) {
          return _internalValues.target!
        } else {
          _internalValues.targetQueue.push(prev.value)
          return TERMINATOR
        }
      }

      if (type === 'start' && _internalStates.startExpired) {
        return TERMINATOR
      }
      if (type === 'start' && !_internalStates.startExpired) {
        _internalStates.startExpired = true
        _internalValues.targetQueue.unshift(prev.value)
        _internalValues.targetQueue.forEach(target => {
          // mutation.triggerTransformation(() => target)
          mutation!.mutate(Data.of<WrappedStart | WrappedTarget | PrivateData>({ type: privateDataType, value: target }))
        })
        _internalValues.targetQueue.length = 0
        return TERMINATOR
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedStartD, startM)
  pipeAtom(wrappedTargetD, startM)

  const outputD = Data.empty<V>()
  pipeAtom(startM, outputD)

  binaryTweenPipeAtom(start, wrapStartM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
/**
 * @see {@link dynamicStartWithT}
 */
export const dynamicStartWithT_ = curryN(2, dynamicStartWithT)

/**
 * @see {@link startWithT}
 */
export const staticStartWithT = <V>(
  start: V, target: AtomLikeOfOutput<V>
): Data<V> => {
  return dynamicStartWithT(replayWithLatest(1, Data.of(start)), target)
}
/**
 * @see {@link staticStartWithT}
 */
export const staticStartWithT_ = curryN(2, staticStartWithT)
