import { curryN } from '../../functional'

import { TERMINATOR, isVoid, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Takes a default value and a target atom as argument,
 * emit given default value if value of target atom isVoid.
 *
 * - dynamic version: default value must be an Atom.
 * - static version: default value can be any type of value.
 *
 * @param default Any | Atom
 * @param target Atom
 * @return Data<V>
 *
 * @see {@link dynamicDefaultToT}, {@link staticDefaultToT}
 */
export const defaultToT = <V>(
  dft: V | AtomLikeOfOutput<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (isAtomLike(dft)) {
    return dynamicDefaultToT(dft as AtomLikeOfOutput<V>, target)
  } else {
    return staticDefaultToT(dft as V, target)
  }
}
export const defaultToT_ = curryN(2, defaultToT)

/**
 * @see {@link defaultToT}
 */
export const dynamicDefaultToT = <V>(
  dft: AtomLikeOfOutput<V>, target: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(dft)) {
    throw (new TypeError('"dft" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedDft {
    type: 'dft'
    value: Vacuo | V
  }
  const wrapDftM = Mutation.ofLiftLeft<V, WrappedDft>(prev => ({ type: 'dft', value: prev }))
  const wrappedDftD = Data.empty<WrappedDft>()
  pipeAtom(wrapDftM, wrappedDftD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | V
  }
  const wrapTargetM = Mutation.ofLiftLeft<V, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const defaultM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      dft: boolean
      target: boolean
    } = { dft: false, target: false }
    const _internalValues: {
      dft: V | undefined
      target: V | undefined
    } = { dft: undefined, target: undefined }

    return (prev: Vacuo | WrappedDft | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value

      if (!_internalStates.dft || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'dft') {
        return TERMINATOR
      } else if (type === 'target') {
        return (isVoid(_internalValues.target) ? _internalValues.dft : _internalValues.target) as V
      } else {
        throw (new TypeError('Unexpected "type".'))
      }
    }
  })())
  pipeAtom(wrappedDftD, defaultM)
  pipeAtom(wrappedTargetD, defaultM)

  const outputD = Data.empty<V>()
  pipeAtom(defaultM, outputD)

  binaryTweenPipeAtom(dft, wrapDftM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
/**
 * @see {@link dynamicDefaultToT}
 */
export const dynamicDefaultToT_ = curryN(2, dynamicDefaultToT)

/**
 * @see {@link defaultToT}
 */
export const staticDefaultToT = <V>(
  dft: V, target: AtomLikeOfOutput<V>
): Data<V> => {
  return dynamicDefaultToT(replayWithLatest(1, Data.of(dft)), target)
}
/**
 * @see {@link staticDefaultToT}
 */
export const staticDefaultToT_ = curryN(2, staticDefaultToT)
