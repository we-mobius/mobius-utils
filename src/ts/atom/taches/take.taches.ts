import { isNumber } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Take sepcified number of values from the target atom.
 * Default to take 0.
 *
 * @see {@link dynamicTakeT}, {@link staticTakeT}
 */
export const takeT = <V>(
  number: AtomLikeOfOutput<number> | number, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isNumber(number)) {
    return staticTakeT(number, target)
  } else if (isAtomLike(number)) {
    return dynamicTakeT(number, target)
  } else {
    throw (new TypeError('"number" is expected to be type of "Number" or "AtomLike".'))
  }
}
interface ITakeT_ {
  <V>(number: AtomLikeOfOutput<number> | number, target: AtomLikeOfOutput<V>): Data<V>
  <V>(number: AtomLikeOfOutput<number> | number): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link takeT}
 */
export const takeT_: ITakeT_ = curryN(2, takeT)

/**
 * @see {@link takeT}
 */
export const dynamicTakeT = <V>(
  number: AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(number)) {
    throw (new TypeError('"number" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
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

  const takeM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      number: boolean
      target: boolean
      taked: number
    } = { number: false, target: false, taked: 0 }
    const _internalValues: {
      number: number
      target: V | undefined
    } = { number: 0, target: undefined }

    return (prev: Vacuo | WrappedNumber | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (!_internalStates.number || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'number') {
        return TERMINATOR
      }

      if (type === 'target') {
        if (_internalStates.taked < _internalValues.number) {
          _internalStates.taked = _internalStates.taked + 1
          return _internalValues.target!
        } else {
          return TERMINATOR
        }
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedNumberD, takeM)
  pipeAtom(wrappedTargetD, takeM)

  const outputD = Data.empty<V>()
  pipeAtom(takeM, outputD)

  binaryTweenPipeAtom(number, wrapNumberM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
interface IDynamicTakeT_ {
  <V>(number: AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>): Data<V>
  <V>(number: AtomLikeOfOutput<number>): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link dynamicTakeT}
 */
export const dynamicTakeT_: IDynamicTakeT_ = curryN(2, dynamicTakeT)

/**
 * @todo release atom when specified num of value has emited
 *
 * @see {@link takeT}
 */
export const staticTakeT = <V>(
  number: number, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isNumber(number)) {
    throw (new TypeError('"number" is expected to be type of "Number".'))
  }
  return dynamicTakeT(replayWithLatest(1, Data.of(number)), target)
}
interface IStaticTakeT_ {
  <V>(number: number, target: AtomLikeOfOutput<V>): Data<V>
  <V>(number: number): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link staticTakeT}
 */
export const staticTakeT_: IStaticTakeT_ = curryN(2, staticTakeT)
