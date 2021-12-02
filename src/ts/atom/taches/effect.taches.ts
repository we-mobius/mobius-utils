import { isFunction } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

interface Effect<V, T> {
  (
    emit: (value: V) => void,
    target: T,
    immediateReturn: (value: V) => void
  ): V | Terminator
  (
    emit: (value: V) => void,
    target: T,
    immediateReturn: (value: V) => void
  ): void
}

/**
 * `effectT` transfer the value's emittion authority to the `effect` function,
 *   so developer can control whether, when and what value will be emitted.
 *
 * @param effect A function that controls the value's emittion.
 *               When there is a target value received, the effect function will be invoked.
 *               It takes an emit function as first argument, invoke it with the value to emit it.
 *                 And takes the target value as second argument, an value set function
 *                 whose value will be emitted just after effect function's execution.
 * @param target Atom
 * @return Data<V>
 *
 * @see {@link dynamicEffectT}, {@link staticEffectT}
 */
export const effectT = <V, T>(
  effect: Effect<V, T>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (isFunction(effect)) {
    return staticEffectT(effect, target)
  } else if (isAtomLike(effect)) {
    return dynamicEffectT(effect, target)
  } else {
    throw (new TypeError('"effect" is expected to be type of "Function" or "AtomLike".'))
  }
}
/**
 * @see {@link effectT}
 */
export const effectT_ = curryN(2, effectT)

/**
 * @see {@link effectT}
 */
export const dynamicEffectT = <V, T>(
  effect: AtomLikeOfOutput<Effect<V, T>>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isAtomLike(effect)) {
    throw (new TypeError('"effect" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedEffect {
    type: 'effect'
    value: Vacuo | Effect<V, T>
  }
  const wrapEffectM = Mutation.ofLiftLeft<Effect<V, T>, WrappedEffect>(prev => ({ type: 'effect', value: prev }))
  const wrappedEffectD = Data.empty<WrappedEffect>()
  pipeAtom(wrapEffectM, wrappedEffectD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | T
  }
  const wrapTargetM = Mutation.ofLiftLeft<T, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  interface PrivateData {
    type: symbol
    value: V
  }
  const privateDataType = Symbol('privateData')

  const effectM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      effect: boolean
      target: boolean
    } = { effect: false, target: false }
    const _internalValues: {
      effect: Effect<V, T> | undefined
      target: T | undefined
    } = { effect: undefined, target: undefined }

    return (prev: Vacuo | WrappedEffect | WrappedTarget | PrivateData): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      if (type === 'effect') {
        _internalStates[type] = true
        if (!isFunction(prev.value)) {
          throw (new TypeError('"effect" is expected to be type of "Function".'))
        }
        _internalValues[type] = prev.value
      } else if (type === 'target') {
        _internalStates[type] = true
        _internalValues[type] = prev.value
      } else if (type === privateDataType) {
        return prev.value
      } else {
        throw (new TypeError('Unexpected "type".'))
      }

      if (!_internalStates.effect || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'effect') {
        return TERMINATOR
      } else if (type === 'target') {
        let hasSetReturned = false
        let _returned: V | Terminator = TERMINATOR
        const result = _internalValues.effect!(
          (value) => {
            // Using "mutate" instead of "triggerTransformation" so that the "effectMutation" can update it's datar.

            // effectM.triggerTransformation(() => value)
            effectM.mutate(Data.of<WrappedEffect | WrappedTarget | PrivateData>({ type: privateDataType, value }))
          },
          _internalValues.target!,
          (returned) => {
            hasSetReturned = true
            _returned = returned
          }
        )

        return hasSetReturned ? _returned : (result ?? TERMINATOR)
      } else {
        throw (new TypeError('Unexpected "type".'))
      }
    }
  })())
  pipeAtom(wrappedEffectD, effectM)
  pipeAtom(wrappedTargetD, effectM)

  const outputD = Data.empty<V>()
  pipeAtom(effectM, outputD)

  binaryTweenPipeAtom(effect, wrapEffectM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
/**
 * @see {@link dynamicEffectT}
 */
export const dynamicEffectT_ = curryN(2, dynamicEffectT)

/**
 * @see {@link effectT}
 */
export const staticEffectT = <V, T>(
  effect: Effect<V, T>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isFunction(effect)) {
    throw (new TypeError('"effect" is expected to be type of "Function".'))
  }
  return dynamicEffectT(replayWithLatest(1, Data.of(effect)), target)
}
/**
 * @see {@link staticEffectT}
 */
export const staticEffectT_ = curryN(2, staticEffectT)
