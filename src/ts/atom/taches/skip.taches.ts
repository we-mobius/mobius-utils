import { isNumber } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Skip specified number of value.
 *
 * @see {@link dynamicSkipT}, {@link staticSkipT}
 */
export const skipT = <V>(
  number: number, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isNumber(number)) {
    return staticSkipT(number, target)
  } else if (isAtomLike(number)) {
    return dynamicSkipT(number, target)
  } else {
    throw (new TypeError('"number" is expected to be type of "Number" or "AtomLike".'))
  }
}
interface ISkipT_ {
  <V>(number: AtomLikeOfOutput<number> | number): (target: AtomLikeOfOutput<V>) => Data<V>
  <V>(number: AtomLikeOfOutput<number> | number, target: AtomLikeOfOutput<V>): Data<V>
}
/**
 * @see {@link skipT}
 */
export const skipT_: ISkipT_ = curryN(2, skipT)

/**
 * @see {@link skipT}
 */
export const dynamicSkipT = <V>(
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
  const wrapNumberM = Mutation.ofLiftLeft<number, WrappedNumber>(prev => ({ type: 'number', value: prev }))
  const wrappedNumberD = Data.empty<WrappedNumber>()
  pipeAtom(wrapNumberM, wrappedNumberD)

  interface WrappedTarget{
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const skipM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      number: boolean
      target: boolean
      skiped: number
    } = { number: false, target: false, skiped: 0 }
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
        if (_internalStates.skiped < _internalValues.number) {
          _internalStates.skiped = _internalStates.skiped + 1
          return TERMINATOR
        } else {
          return _internalValues.target!
        }
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedNumberD, skipM)
  pipeAtom(wrappedTargetD, skipM)

  const outputD = Data.empty<V>()
  pipeAtom(skipM, outputD)

  binaryTweenPipeAtom(number, wrapNumberM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
interface IDynamicSkipT_ {
  <V>(number: AtomLikeOfOutput<number>): (target: AtomLikeOfOutput<V>) => Data<V>
  <V>(number: AtomLikeOfOutput<number>, target: AtomLikeOfOutput<V>): Data<V>
}
/**
 * @see {@link dynamicSkipT}
 */
export const dynamicSkipT_: IDynamicSkipT_ = curryN(2, dynamicSkipT)

/**
 * @see {@link skipT}
 */
export const staticSkipT = <V>(
  number: number, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(number)) {
    throw (new TypeError('"number" is expected to be type of "Number".'))
  }
  return dynamicSkipT(replayWithLatest(1, Data.of<number>(number)), target)
}
interface IStaticSkipT_ {
  <V>(number: number): (target: AtomLikeOfOutput<V>) => Data<V>
  <V>(number: number, target: AtomLikeOfOutput<V>): Data<V>
}
/**
 * @see {@link staticSkipT}
 */
export const staticSkipT_: IStaticSkipT_ = curryN(2, staticSkipT)
