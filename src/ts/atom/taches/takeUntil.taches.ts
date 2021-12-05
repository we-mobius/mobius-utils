import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Take target atom's value until there is a value from condition atom.
 */
export const takeUntilT = <V>(
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
    value: any
  }
  const wrapConditionM = Mutation.ofLiftLeft<any, WrappedCondition>(prev => ({ type: 'condition', value: prev }))
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
    const _internalValues: {
      condition: any
      target: V | undefined
    } = { condition: undefined, target: undefined }

    return (prev: Vacuo | WrappedCondition | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type, value } = prev

      _internalStates[type] = true
      _internalValues[type] = value

      if (_internalStates.condition) {
        return TERMINATOR
      }

      if (type === 'target') {
        return _internalValues.target!
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

interface ITakeUntilT_ {
  <V>(condition: AtomLikeOfOutput<any>, target: AtomLikeOfOutput<V>): Data<V>
  <V>(condition: AtomLikeOfOutput<any>): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link takeUntilT}
 */
export const takeUntilT_: ITakeUntilT_ = curryN(2, takeUntilT)
