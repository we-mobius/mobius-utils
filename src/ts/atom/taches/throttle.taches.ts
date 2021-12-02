import { isNumber } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'
import { replayWithLatest } from '../mediators'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * @see {@link dynamicThrottleTimeT}, {@link staticThrottleTimeT}
 */
export const throttleTimeT = <V>(
  timer: AtomLikeOfOutput<number> | number, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isNumber(timer)) {
    return staticThrottleTimeT(timer, target)
  } else if (isAtomLike(timer)) {
    return dynamicThrottleTimeT(timer, target)
  } else {
    throw (new TypeError('"timer" is expected to be type of "Number" or "AtomLike".'))
  }
}
/**
 * @see {@link throttleTimeT}
 */
export const throttleTimeT_ = curryN(2, throttleTimeT)

/**
 * the value target will only triggered when timer atom has at least one value
 *
 * @param timer Atom, which value is used as throttle time(in milliseconds)
 * @param target Atom, which value will be throttled with specified time
 *
 * @see {@link throttleTimeT}
 */
export const dynamicThrottleTimeT = <V>(
  timer: AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(timer)) {
    throw (new TypeError('"timer" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedTimer {
    type: 'timer'
    value: Vacuo | number
  }
  const wrapTimerM = Mutation.ofLiftLeft<number, WrappedTimer>(prev => ({ type: 'timer', value: prev }))
  const wrappedTimerD = Data.empty<WrappedTimer>()
  pipeAtom(wrapTimerM, wrappedTimerD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const throttleM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      timer: boolean
      target: boolean
      clock: NodeJS.Timeout
      canEmit: boolean
    } = { timer: false, target: false, clock: 0 as unknown as NodeJS.Timeout, canEmit: true }
    const _internalValues: {
      timer: number
      target: V | undefined
    } = { timer: 0, target: undefined }

    return (prev: Vacuo | WrappedTimer | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (!_internalStates.timer || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'timer') {
        return TERMINATOR
      }

      if (type === 'target') {
        if (_internalStates.canEmit) {
          _internalStates.canEmit = false
          _internalStates.clock = setTimeout(() => {
            clearTimeout(_internalStates.clock)
            _internalStates.canEmit = true
          }, _internalValues.timer)
          return _internalValues.target!
        } else {
          return TERMINATOR
        }
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedTimerD, throttleM)
  pipeAtom(wrappedTargetD, throttleM)

  const outputD = Data.empty<V>()
  pipeAtom(throttleM, outputD)

  binaryTweenPipeAtom(timer, wrapTimerM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
/**
 * @see {@link dynamicThrottleTimeT}
 */
export const dynamicThrottleTimeT_ = curryN(2, dynamicThrottleTimeT)

/**
 * @see {@link throttleTimeT}
 */
export const staticThrottleTimeT = <V>(
  timer: number, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isNumber(timer)) {
    throw (new TypeError('"timer" is expected to be type of "Number".'))
  }
  return dynamicThrottleTimeT(replayWithLatest(1, Data.of(timer)), target)
}
/**
 * @see {@link staticThrottleTimeT}
 */
export const staticThrottleTimeT_ = curryN(2, staticThrottleTimeT)
