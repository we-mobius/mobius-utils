import { isFunction } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtom } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param effect Function | Atom, takes a effect function that takes
 *               an emit function, a target value, and a instantly emit value set function.
 * @param target Atom
 * @return atom Data
 */
export const effectT = curryN(2, (effect, target) => {
  if (isFunction(effect)) {
    return staticEffectT(effect, target)
  } else if (isAtom(effect)) {
    return dynamicEffectT(effect, target)
  } else {
    throw (new TypeError('"effect" argument of effectT is expected to be type of "Function" or "Atom"'))
  }
})

/**
 * @param effect Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicEffectT = curryN(2, (effect, target) => {
  if (!isAtom(effect)) {
    throw (new TypeError('"effect" argument of dynamicEffectT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicEffectT is expected to be type of "Atom".'))
  }

  const wrapEffectM = Mutation.ofLiftLeft(prev => ({ type: 'effect', value: prev }))
  const wrappedEffectD = Data.empty()
  pipeAtom(wrapEffectM, wrappedEffectD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const effectM = Mutation.ofLiftLeft((() => {
    const _internalStates = { effect: false, target: false }
    const _internalValues = { effect: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'effect' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in effectM, expected to be "effect" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.effect || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'effect') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        let hasSetReturned = false
        let _returned
        const result = _internalValues.effect(
          value => {
            effectM.triggerTransformation(() => value)
          },
          _internalValues.target,
          returned => {
            hasSetReturned = true
            _returned = returned
          }
        )
        return hasSetReturned ? _returned : (result || TERMINATOR)
      }
    }
  })())
  pipeAtom(wrappedEffectD, effectM)
  pipeAtom(wrappedTargetD, effectM)

  const outputD = Data.empty()
  pipeAtom(effectM, outputD)

  binaryTweenPipeAtom(effect, wrapEffectM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param effect Function
 * @param target Atom
 * @return atom Data
 */
export const staticEffectT = curryN(2, (effect, target) => {
  if (!isFunction(effect)) {
    throw (new TypeError('"effect" argument of staticEffectT is expected to be type of "Function".'))
  }
  return dynamicEffectT(replayWithLatest(1, Data.of(effect)), target)
})
