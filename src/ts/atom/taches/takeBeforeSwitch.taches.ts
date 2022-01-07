import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Take before atom's value before there is a value from after atom and switch to it.
 */
export const takeBeforeSwitchT = <V>(
  before: AtomLikeOfOutput<any>, after: AtomLikeOfOutput<V>
): Data<V> => {
  if (!isAtomLike(before)) {
    throw (new TypeError('"before" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(after)) {
    throw (new TypeError('"after" is expected to be type of "AtomLike".'))
  }

  interface WrappedBefore {
    type: 'before'
    value: any
  }
  const wrapBeforeM = Mutation.ofLiftLeft<any, WrappedBefore>(prev => ({ type: 'before', value: prev }))
  const wrappedBeforeD = Data.empty<WrappedBefore>()
  pipeAtom(wrapBeforeM, wrappedBeforeD)

  interface WrappedAfter {
    type: 'after'
    value: Vacuo | V
  }
  const wrapAfterM = Mutation.ofLiftLeft<V, WrappedAfter>(prev => ({ type: 'after', value: prev }))
  const wrappedAfterD = Data.empty<WrappedAfter>()
  pipeAtom(wrapAfterM, wrappedAfterD)

  const takeBeforeSwitchM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      before: boolean
      after: boolean
    } = { before: false, after: false }
    const _internalValues: {
      before: any
      after: V | undefined
    } = { before: undefined, after: undefined }

    return (prev: Vacuo | WrappedBefore | WrappedAfter): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type, value } = prev

      _internalStates[type] = true
      _internalValues[type] = value

      if (type === 'before') {
        if (_internalStates.after) {
          return TERMINATOR
        } else {
          return _internalValues.before
        }
      }

      if (type === 'after') {
        return _internalValues.after!
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedBeforeD, takeBeforeSwitchM)
  pipeAtom(wrappedAfterD, takeBeforeSwitchM)

  const outputD = Data.empty<V>()
  pipeAtom(takeBeforeSwitchM, outputD)

  binaryTweenPipeAtom(before, wrapBeforeM)
  binaryTweenPipeAtom(after, wrapAfterM)

  return outputD
}

interface ITakeBeforeSwitchT_ {
  <V>(before: AtomLikeOfOutput<any>, after: AtomLikeOfOutput<V>): Data<V>
  <V>(before: AtomLikeOfOutput<any>): (after: AtomLikeOfOutput<V>) => Data<V>
}
/**
 * @see {@link takeBeforeSwitchT}
 */
export const takeBeforeSwitchT_: ITakeBeforeSwitchT_ = curryN(2, takeBeforeSwitchT)
