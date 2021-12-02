import { isString, isArray, isNumber, getPropByPath } from '../../internal'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { PropPath } from '../../internal'
import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * @param { PropPath } selector
 *
 * @see {@link dynamicPluckT}, {@link staticPluckT}
 */
export const pluckT = <T, V>(
  selector: AtomLikeOfOutput<PropPath> | PropPath, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (isString(selector) || isArray(selector) || isNumber(selector)) {
    return staticPluckT(selector, target)
  } else if (isAtomLike(selector)) {
    return dynamicPluckT(selector, target)
  } else {
    throw (new TypeError('"selector" is expected to be type of "String" | "Array" | "Number" | "AtomLike".'))
  }
}
interface IPluckT_ {
  <T, V>(selector: AtomLikeOfOutput<PropPath> | PropPath): (target: AtomLikeOfOutput<T>) => Data<V>
  <T, V>(selector: AtomLikeOfOutput<PropPath> | PropPath, target: AtomLikeOfOutput<T>): Data<V>
}
/**
 * @see {@link pluckT}
 */
export const pluckT_: IPluckT_ = curryN(2, pluckT)

/**
 * @see {@link pluckT}
 */
export const dynamicPluckT = <T, V>(
  selector: AtomLikeOfOutput<PropPath>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isAtomLike(selector)) {
    throw (new TypeError('"selector" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"selector" is expected to be type of "AtomLike".'))
  }

  interface WrappedSelector {
    type: 'selector'
    value: Vacuo | PropPath
  }
  const wrapSelectorM = Mutation.ofLiftLeft<PropPath, WrappedSelector>(prev => ({ type: 'selector', value: prev }))
  const wrappedSelectorD = Data.empty<WrappedSelector>()
  pipeAtom(wrapSelectorM, wrappedSelectorD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | T
  }
  const wrapTargetM = Mutation.ofLiftLeft<T, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const pluckM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      selector: boolean
      target: boolean
    } = { selector: false, target: false }
    const _internalValues: {
      selector: PropPath | undefined
      target: T | undefined
    } = { selector: undefined, target: undefined }

    return (prev: Vacuo | WrappedSelector | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (!_internalStates.selector || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'selector') {
        return TERMINATOR
      }
      if (type === 'target') {
        return getPropByPath(_internalValues.selector, _internalValues.target)
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedSelectorD, pluckM)
  pipeAtom(wrappedTargetD, pluckM)

  const outputD = Data.empty<V>()
  pipeAtom(pluckM, outputD)

  binaryTweenPipeAtom(selector, wrapSelectorM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
interface IDynamicPluckT_ {
  <T, V>(selector: AtomLikeOfOutput<PropPath>): (target: AtomLikeOfOutput<T>) => Data<V>
  <T, V>(selector: AtomLikeOfOutput<PropPath>, target: AtomLikeOfOutput<T>): Data<V>
}
/**
 * @see {@link dynamicPluckT}
 */
export const dynamicPluckT_: IDynamicPluckT_ = curryN(2, dynamicPluckT)

/**
 * @see {@link pluckT}
 */
export const staticPluckT = <T, V>(
  selector: PropPath, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isString(selector) && !isArray(selector) && !isNumber(selector)) {
    throw (new TypeError('"selector" is expected to be type of "String" | "Array" | "Number".'))
  }
  return dynamicPluckT(replayWithLatest(1, Data.of(selector)), target)
}
interface IStaticPluckT_ {
  <T, V>(selector: PropPath): (target: AtomLikeOfOutput<T>) => Data<V>
  <T, V>(selector: PropPath, target: AtomLikeOfOutput<T>): Data<V>
}
/**
 * @see {@link staticPluckT}
 */
export const staticPluckT_: IStaticPluckT_ = curryN(2, staticPluckT)
