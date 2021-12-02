import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../../atom'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * @see {@link dynamicEmptyStartWithT}, {@link staticEmptyStartWithT}
 */
export const emptyStartWithT = <V>(
  start: V | AtomLikeOfOutput<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isAtomLike(start)) {
    return dynamicEmptyStartWithT(start as AtomLikeOfOutput<V>, target)
  } else {
    return staticEmptyStartWithT(start as V, target)
  }
}
/**
 * @see {@link emptyStartWithT}
 */
export const emptyStartWithT_ = curryN(2, emptyStartWithT)

/**
 * @see {@link emptyStartWithT}
 */
export const dynamicEmptyStartWithT = <V>(
  start: AtomLikeOfOutput<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(start)) {
    throw (new TypeError('"start" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  const startR = replayWithLatest(1, start as any)
  const targetR = replayWithLatest(1, target as any)

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

  const startM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      start: boolean
      target: boolean
      startExpired: boolean
    } = { start: false, target: false, startExpired: false }
    const _internalValues: {
      start: V | undefined
      target: V | undefined
    } = { start: undefined, target: undefined }

    return (prev: Vacuo | WrappedStart | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value

      if (type === 'target') {
        return _internalValues.target!
      }

      if (type === 'start' && _internalStates.startExpired) {
        return TERMINATOR
      }
      if (type === 'start' && !_internalStates.startExpired) {
        _internalStates.startExpired = true
        return _internalStates.target ? TERMINATOR : _internalValues.start!
      }

      throw (new TypeError('Unexpected case encountered.'))
    }
  })())
  pipeAtom(wrappedStartD, startM)
  pipeAtom(wrappedTargetD, startM)

  const outputD = Data.empty<V>()
  pipeAtom(startM, outputD)

  // subscribe order matters
  // correct order: target first, start second
  // If there is a target value at the beginning, the start value will be ignored.
  binaryTweenPipeAtom(targetR, wrapTargetM)
  binaryTweenPipeAtom(startR, wrapStartM)

  return outputD
}
/**
 * @seee {@link dynamicEmptyStartWithT}
 */
export const dynamicEmptyStartWithT_ = curryN(2, dynamicEmptyStartWithT)

/**
 * @see {@link emptyStartWithT}
 */
export const staticEmptyStartWithT = <V>(
  start: V, target: AtomLikeOfOutput<V>
): Data<V> => {
  return dynamicEmptyStartWithT(replayWithLatest(1, Data.of(start)), target)
}
export const staticEmptyStartWithT_ = curryN(2, staticEmptyStartWithT)
