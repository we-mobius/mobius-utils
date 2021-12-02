import { isFunction } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Mutation, Data, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type Predicate<V> = (tar: V, index: number) => boolean

/**
 * @see {@link dynamicFilterT}, {@link staticFilterT}
 */
export const filterT = <V>(
  predicate: AtomLikeOfOutput<Predicate<V>> | Predicate<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isFunction(predicate)) {
    return staticFilterT(predicate, target)
  } else if (isAtomLike(predicate)) {
    return dynamicFilterT(predicate, target)
  } else {
    throw (new TypeError('"predicate" is expected to be type of "Function" or "AtomLike".'))
  }
}
export const filterT_ = curryN(2, filterT)

/**
 * @see {@link filterT}
 */
export const dynamicFilterT = <V>(
  predicate: AtomLikeOfOutput<Predicate<V>>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(predicate)) {
    throw (new TypeError('"predicate" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedPredicate {
    type: 'predicate'
    value: Vacuo | Predicate<V>
  }
  const wrapPredicateM = Mutation.ofLiftLeft<Predicate<V>, WrappedPredicate>(prev => ({ type: 'predicate', value: prev }))
  const wrappedPredicateD = Data.empty<WrappedPredicate>()
  pipeAtom(wrapPredicateM, wrappedPredicateD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const filterM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      predicate: boolean
      target: boolean
      index: number
    } = { predicate: false, target: false, index: -1 }
    const _internalValues: {
      predicate: Predicate<V> | undefined
      target: V | undefined
    } = { predicate: undefined, target: undefined }

    return (prev: Vacuo | WrappedPredicate | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (!_internalStates.predicate || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'predicate') {
        return TERMINATOR
      } else if (type === 'target') {
        _internalStates.index = _internalStates.index + 1
        return _internalValues.predicate!(_internalValues.target!, _internalStates.index) ? _internalValues.target! : TERMINATOR
      } else {
        throw (new TypeError('Unexpected "type".'))
      }
    }
  })())
  pipeAtom(wrappedPredicateD, filterM)
  pipeAtom(wrappedTargetD, filterM)

  const outputD = Data.empty<V>()
  pipeAtom(filterM, outputD)

  binaryTweenPipeAtom(predicate, wrapPredicateM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
/**
 * @see {@link dynamicFilterT}
 */
export const dynamicFilterT_ = curryN(2, dynamicFilterT)

/**
 * @see {@link filterT}
 */
export const staticFilterT = <V>(
  predicate: Predicate<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isFunction(predicate)) {
    throw (new TypeError('"predicate" is expected to be type of "Function".'))
  }
  return dynamicFilterT(replayWithLatest(1, Data.of(predicate)), target)
}
/**
 * @see {@link staticFilterT}
 */
export const staticFilterT_ = curryN(2, staticFilterT)
