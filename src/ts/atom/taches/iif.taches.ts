import { isFunction } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type Predicate<T> = (tar: T, index: number) => boolean

/**
 * @see {@link dynamicIifT}, {@link staticIifT}
 */
export const iifT = <T, V>(
  predicate: AtomLikeOfOutput<Predicate<T>> | Predicate<T>,
  trueValue: AtomLikeOfOutput<V>,
  falseValue: AtomLikeOfOutput<V>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (isFunction(predicate)) {
    return staticIifT(predicate, trueValue, falseValue, target)
  } else if (isAtomLike(predicate)) {
    return dynamicIifT(predicate, trueValue, falseValue, target)
  } else {
    throw (new TypeError('"predicate" is expected to be type of "Function" | "AtomLike".'))
  }
}
/**
 * @see {@link iifT}
 */
export const iifT_ = curryN(4, iifT)

/**
 * @see {@link iifT}
 */
export const dynamicIifT = <T, V>(
  predicate: AtomLikeOfOutput<Predicate<T>>,
  trueValue: AtomLikeOfOutput<V>,
  falseValue: AtomLikeOfOutput<V>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isAtomLike(predicate)) {
    throw (new TypeError('"predicate" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(trueValue)) {
    throw (new TypeError('"trueTarget" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(falseValue)) {
    throw (new TypeError('"falseTarget" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedPredicate {
    type: 'predicate'
    value: Vacuo | Predicate<T>
  }
  const wrapPredicateM = Mutation.ofLiftLeft<Predicate<T>, WrappedPredicate>(prev => ({ type: 'predicate', value: prev }))
  const wrappedPredicateD = Data.empty<WrappedPredicate>()
  pipeAtom(wrapPredicateM, wrappedPredicateD)

  interface WrappedTrueValue {
    type: 'trueValue'
    value: Vacuo | V
  }
  const wrapTrueValueM = Mutation.ofLiftLeft<V, WrappedTrueValue>(prev => ({ type: 'trueValue', value: prev }))
  const wrappedTrueValueD = Data.empty<WrappedTrueValue>()
  pipeAtom(wrapTrueValueM, wrappedTrueValueD)

  interface WrappedFalseValue {
    type: 'falseValue'
    value: Vacuo | V
  }
  const wrapFalseValueM = Mutation.ofLiftLeft<V, WrappedFalseValue>(prev => ({ type: 'falseValue', value: prev }))
  const wrappedFalseValueD = Data.empty<WrappedFalseValue>()
  pipeAtom(wrapFalseValueM, wrappedFalseValueD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | T
  }
  const wrapTargetM = Mutation.ofLiftLeft<T, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const filterM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      predicate: boolean
      trueValue: boolean
      falseValue: boolean
      target: boolean
      index: number
    } = { predicate: false, trueValue: false, falseValue: false, target: false, index: -1 }
    const _internalValues: {
      predicate: Predicate<T> | undefined
      trueValue: V | undefined
      falseValue: V | undefined
      target: T | undefined
    } = { predicate: undefined, trueValue: undefined, falseValue: undefined, target: undefined }

    return (prev: Vacuo | WrappedPredicate | WrappedTrueValue | WrappedFalseValue | WrappedTarget): V | Terminator => {
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
      }
      if (type === 'trueValue' || type === 'falseValue') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1
        const predicated = _internalValues.predicate!(_internalValues.target!, _internalStates.index)
        if (predicated) {
          return _internalStates.trueValue ? _internalValues.trueValue! : TERMINATOR
        } else {
          return _internalStates.falseValue ? _internalValues.falseValue! : TERMINATOR
        }
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedPredicateD, filterM)
  pipeAtom(wrappedTrueValueD, filterM)
  pipeAtom(wrappedFalseValueD, filterM)

  const outputD = Data.empty<V>()
  pipeAtom(filterM, outputD)

  binaryTweenPipeAtom(predicate, wrapPredicateM)
  binaryTweenPipeAtom(trueValue, wrapTrueValueM)
  binaryTweenPipeAtom(falseValue, wrapFalseValueM)

  return outputD
}
/**
 * @see {@link dynamicIifT}
 */
export const dynamicIifT_ = curryN(4, dynamicIifT)

/**
 * @see {@link iifT}
 */
export const staticIifT = <T, V>(
  predicate: Predicate<T>,
  trueValue: AtomLikeOfOutput<V>,
  falseValue: AtomLikeOfOutput<V>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isFunction(predicate)) {
    throw (new TypeError('"predicate" is expected to be type of "Function".'))
  }
  return dynamicIifT(replayWithLatest(1, Data.of(predicate)), trueValue, falseValue, target)
}
/**
 * @see {@link staticIifT}
 */
export const staticIifT_ = curryN(4, staticIifT)
