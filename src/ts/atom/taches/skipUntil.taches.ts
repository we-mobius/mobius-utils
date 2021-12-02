import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Skip target atom's value until there is a value from condition atom.
 */
export const skipUntilT = <V>(
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

  const skipM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      condition: boolean
      target: boolean
    } = { condition: false, target: false }
    const _intervalValues: {
      condition: any
      target: V | undefined
    } = { condition: undefined, target: undefined }

    return (prev: Vacuo | WrappedCondition | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type, value } = prev

      _internalStates[type] = true
      _intervalValues[type] = value

      if (!_internalStates.condition || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'condition') {
        return TERMINATOR
      }
      if (type === 'target') {
        return _intervalValues.target!
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedConditionD, skipM)
  pipeAtom(wrappedTargetD, skipM)

  const outputD = Data.empty<V>()
  pipeAtom(skipM, outputD)

  binaryTweenPipeAtom(condition, wrapConditionM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}

/**
 * @see {@link skipUntilT}
 */
export const skipUntilT_ = curryN(2, skipUntilT)
