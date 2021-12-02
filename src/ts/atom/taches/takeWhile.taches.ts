import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Take target atom's value while condition atom's value is `true`.
 */
export const takeWhileT = <V>(
  condition: AtomLikeOfOutput<any>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(condition)) {
    throw (new TypeError('"condition" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedCondition {
    type: 'condition'
    value: Vacuo | boolean
  }
  const wrapConditionM = Mutation.ofLiftLeft<any, WrappedCondition>(prev => ({ type: 'condition', value: Boolean(prev) }))
  const wrappedConditionD = Data.empty<WrappedCondition>()
  pipeAtom(wrapConditionM, wrappedConditionD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const takeM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      condition: boolean
      target: boolean
    } = { condition: false, target: false }
    const _intervalValues: {
      condition: boolean
      target: V | undefined
    } = { condition: false, target: undefined }

    return (prev: Vacuo | WrappedCondition | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _intervalValues[type] = prev.value as any

      if (!_internalStates.condition || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'condition') {
        return TERMINATOR
      }

      if (type === 'target') {
        return _intervalValues.condition ? _intervalValues.target! : TERMINATOR
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedConditionD, takeM)
  pipeAtom(wrappedTargetD, takeM)

  const outputD = Data.empty<V>()
  pipeAtom(takeM, outputD)

  binaryTweenPipeAtom(condition, wrapConditionM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
interface ITakeWhileT_ {
  <V>(condition: AtomLikeOfOutput<any>, target: AtomLikeOfOutput<V>): Data<V>
  <V>(condition: AtomLikeOfOutput<any>): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link takeWhileT}
 */
export const takeWhileT_: ITakeWhileT_ = curryN(2, takeWhileT)
