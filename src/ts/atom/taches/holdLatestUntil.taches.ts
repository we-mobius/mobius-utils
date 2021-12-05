import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Hold target atom's latest value until there is a value from condition atom.
 */
export const holdLatestUntilT = <V>(
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

  const holdM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      condition: boolean
      target: boolean
      conditionExpired: boolean
    } = { condition: false, target: false, conditionExpired: false }
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

      if (type === 'condition') {
        if (_internalStates.conditionExpired) {
          return TERMINATOR
        } else {
          _internalStates.conditionExpired = true
          if (!_internalStates.target) {
            return TERMINATOR
          } else {
            return _internalValues.target!
          }
        }
      }

      if (type === 'target') {
        if (_internalStates.condition) {
          return _internalValues.target!
        } else {
          return TERMINATOR
        }
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedConditionD, holdM)
  pipeAtom(wrappedTargetD, holdM)

  const outputD = Data.empty<V>()
  pipeAtom(holdM, outputD)

  binaryTweenPipeAtom(condition, wrapConditionM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}

interface IHoldLatestUntilT_ {
  <V>(condition: AtomLikeOfOutput<any>, target: AtomLikeOfOutput<V>): Data<V>
  <V>(condition: AtomLikeOfOutput<any>): (target: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link holdLatestUntilT}
 */
export const holdLatestUntilT_: IHoldLatestUntilT_ = curryN(2, holdLatestUntilT)
