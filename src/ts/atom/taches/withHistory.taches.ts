import { isNumber } from '../../internal/base'
import { curryN, pipe } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { isAtomLike, Mutation, Data } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'
import { filterT_ } from './filter.taches'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Returned atom will emits specified number of target's value as an array.
 *
 * @see {@link withDynamicHistoryT}, {@link withStaticHistoryT}
 */
export const withHistoryT = <V>(
  number: AtomLikeOfOutput<number> | number, target: AtomLikeOfOutput<V>
): Data<V[]> => {
  if (isNumber(number)) {
    return withStaticHistoryT(number, target)
  } else if (isAtomLike(number)) {
    return withDynamicHistoryT(number, target)
  } else {
    throw (new TypeError('"number" is expected to be type of "Number" or "AtomLike"'))
  }
}
/**
 * @see {@link withHistoryT}
 */
export const withHistoryT_ = curryN(2, withHistoryT)

/**
 * @see {@link withHistoryT}
 */
export const withDynamicHistoryT = <V>(
  number: AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>
): Data<V[]> => {
  if (!isAtomLike(number)) {
    throw (new TypeError('"number" is expected to be type of "Mutation" or "Data".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "Mutation" or "Data".'))
  }

  interface WrappedNumber {
    type: 'number'
    value: Vacuo | number
  }
  const wrapNumberM = Mutation.ofLiftLeft<number, WrappedNumber>(prev => ({ type: 'number', value: parseInt(prev as any) }))
  const wrappedNumberD = Data.empty<WrappedNumber>()
  pipeAtom(wrapNumberM, wrappedNumberD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const withHistoryM = Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    // history :: [latest, ..., oldest]
    const _internalStates: {
      number: boolean
      target: boolean
      history: V[]
    } = { number: false, target: false, history: [] }
    const _internalValues: {
      number: number
      target: V | undefined
    } = { number: 1, target: undefined }

    return (prev: Vacuo | WrappedNumber | WrappedTarget): V[] | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      const { history } = _internalStates
      if (type === 'number') {
        history.length = prev.value
        return TERMINATOR
      }
      if (type === 'target') {
        history.pop()
        history.unshift(prev.value)
        return [...history]
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedNumberD, withHistoryM)
  pipeAtom(wrappedTargetD, withHistoryM)

  const outputD = Data.empty<V[]>()
  pipeAtom(withHistoryM, outputD)

  binaryTweenPipeAtom(number, wrapNumberM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
/**
 * @see {@link withDynamicHistoryT}
 */
export const withDynamicHistoryT_ = curryN(2, withDynamicHistoryT)

/**
 * @see {@link withHistoryT}
 */
export const withStaticHistoryT = <V>(
  number: number, target: AtomLikeOfOutput<V>
): Data<V[]> => {
  if (!isNumber(number)) {
    throw (new TypeError('"number" is expected to be type of "Number".'))
  }
  return withDynamicHistoryT(replayWithLatest(1, Data.of(number)), target)
}
/**
 * @see {@link withStaticHistoryT}
 */
export const withStaticHistoryT_ = curryN(2, withStaticHistoryT)

/**
 * Returned atom will emits the previous and current value of target atom as an array.
 *
 * @see {@link withHistoryT}, {@link truthyPairwiseT}
 */
export const pairwiseT = withHistoryT_(2)
/**
 * @see {@link pairwiseT}
 */
export const truthyPairwiseT = pipe(pairwiseT, filterT_(v => v[0] && v[1]))
