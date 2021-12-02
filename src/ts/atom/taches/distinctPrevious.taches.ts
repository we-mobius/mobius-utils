import { isFunction, asIs } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type CompareBy<V> = (target: V) => any

/**
 * @param compareBy transform Funtion which will be applied to target value
 *                    before distinct comparison.
 * @param target Atom
 * @return Data<V>
 *
 * @see {@link dynamicDistinctPreviousT}, {@link staticDistinctPreviousT}
 */
export const distinctPreviousT = <V>(
  compareBy: AtomLikeOfOutput<CompareBy<V>> | CompareBy<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isFunction(compareBy)) {
    return staticDistinctPreviousT(compareBy, target)
  } else if (isAtomLike(compareBy)) {
    return dynamicDistinctPreviousT(compareBy, target)
  } else {
    throw (new TypeError('"compareBy" is expected to be type of "Function" or "AtomLike".'))
  }
}
/**
 * @see {@link distinctPreviousT}
 */
export const distinctPreviousT_ = curryN(2, distinctPreviousT)

/**
 * @see {@link distinctPreviousT}
 */
export const dynamicDistinctPreviousT = <V>(
  compareBy: AtomLikeOfOutput<CompareBy<V>>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(compareBy)) {
    throw (new TypeError('"compareBy" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedCompareBy {
    type: 'compareBy'
    value: Vacuo | CompareBy<V>
  }
  const wrapCompareByM = Mutation.ofLiftLeft<CompareBy<V>, WrappedCompareBy>(prev => ({ type: 'compareBy', value: prev }))
  const wrappedCompareByD = Data.empty<WrappedCompareBy>()
  pipeAtom(wrapCompareByM, wrappedCompareByD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const distinctM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      compareBy: boolean
      target: boolean
      previous: V | undefined
    } = { compareBy: false, target: false, previous: undefined }
    const _internalValues: {
      compareBy: CompareBy<V>
      target: V | undefined
    } = { compareBy: asIs, target: undefined }

    return (prev: Vacuo | WrappedCompareBy | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (!_internalStates.compareBy || !_internalStates.target) {
        return TERMINATOR
      }

      if (type === 'compareBy') {
        // change of compareBy will not trigger target value emittion
        return TERMINATOR
      } else if (type === 'target') {
        const prevCompared = _internalValues.compareBy(_internalStates.previous as V)
        const compared = _internalValues.compareBy(_internalValues.target as V)
        if (prevCompared === compared) {
          return TERMINATOR
        } else {
          _internalStates.previous = _internalValues.target
          return _internalValues.target as V
        }
      } else {
        throw (new TypeError('Unexpected "type".'))
      }
    }
  })())
  pipeAtom(wrappedTargetD, distinctM)
  pipeAtom(wrappedCompareByD, distinctM)

  const outputD = Data.empty<V>()
  pipeAtom(distinctM, outputD)

  binaryTweenPipeAtom(compareBy, wrapCompareByM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
/**
 * @see {@link dynamicDistinctPreviousT}
 */
export const dynamicDistinctPreviousT_ = curryN(2, dynamicDistinctPreviousT)

/**
 * @see {@link distinctPreviousT}
 */
export const staticDistinctPreviousT = <V>(
  compareBy: CompareBy<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isFunction(compareBy)) {
    throw (new TypeError('"compareBy" is expected to be type of "Function".'))
  }
  return dynamicDistinctPreviousT(replayWithLatest(1, Data.of(compareBy)), target)
}
/**
 * @see {@link staticDistinctPreviousT}
 */
export const staticDistinctPreviousT_ = curryN(2, staticDistinctPreviousT)

/**
 * @see {@link distinctPreviousT}
 */
export const asIsDistinctPreviousT = distinctPreviousT_(asIs)
