import { isNumber } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'
import { replayWithLatest } from '../mediators'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * The value emitted by target atom will only be triggered when timer atom has at least one value.
 *
 * @param timer which value is used as debounce time(in milliseconds)
 * @param target which value will be debounced with specified time
 * @return Data<V>
 *
 * @see {@link dynamicDebounceTimeT}, {@link staticDebounceTimeT}
 */
export const debounceTimeT = <V>(
  timer: number | AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isNumber(timer)) {
    return staticDebounceTimeT(timer, target)
  } else if (isAtomLike(timer)) {
    return dynamicDebounceTimeT(timer, target)
  } else {
    throw (new TypeError('"timer" is expected to be type of "Number" or "AtomLike".'))
  }
}
interface IDebounceTimeT_ {
  <V>(timer: number | AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>): Data<V>
  <V>(timer: number | AtomLikeOfOutput<number>): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link debounceTimeT}
 */
export const deboundeTimeT_: IDebounceTimeT_ = curryN(2, debounceTimeT)

/**
 * @see {@link debounceTimeT}
 */
export const dynamicDebounceTimeT = <V>(
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

  const debounceM = Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    const _internalStates: {
      timer: boolean
      target: boolean
      clock: NodeJS.Timeout | null
    } = { timer: false, target: false, clock: null }
    const _internalValues: {
      timer: number | undefined
      target: V | undefined
    } = { timer: undefined, target: undefined }

    // actual mutation operation function
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
      } else if (type === 'target') {
        if (_internalStates.clock !== null) {
          clearTimeout(_internalStates.clock)
        }
        _internalStates.clock = setTimeout(() => {
          debounceM.triggerTransformation(() => _internalValues.target as V)
        }, _internalValues.timer)

        return TERMINATOR
      } else {
        throw (new TypeError('Unexpected "type".'))
      }
    }
  })())
  pipeAtom(wrappedTimerD, debounceM)
  pipeAtom(wrappedTargetD, debounceM)

  const outputD = Data.empty<V>()
  pipeAtom(debounceM, outputD)

  binaryTweenPipeAtom(timer, wrapTimerM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
interface IDynamicDebounceTimeT_ {
  <V>(timer: AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>): Data<V>
  <V>(timer: AtomLikeOfOutput<number>): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link dynamicDebounceTimeT}
 */
export const dynamicDebounceTimeT_: IDynamicDebounceTimeT_ = curryN(2, dynamicDebounceTimeT)

/**
 * @see {@link debounceTimeT}
 */
export const staticDebounceTimeT = <V>(
  timer: number, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isNumber(timer)) {
    throw (new TypeError('"timer" is expected to be type of "Number".'))
  }
  return dynamicDebounceTimeT(replayWithLatest(1, Data.of(timer)), target)
}
interface IStaticDebounceTimeT_ {
  <V>(timer: number, target: AtomLikeOfOutput<V>): Data<V>
  <V>(timer: number): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link staticDebounceTimeT}
 */
export const staticDebounceTimeT_: IStaticDebounceTimeT_ = curryN(2, staticDebounceTimeT)
