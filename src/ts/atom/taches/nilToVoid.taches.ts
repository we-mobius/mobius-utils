import { isNil } from '../../internal/base'

import { VOID, TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Void, Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Replace nil value(i.e. undefined, null) with VOID.
 */
export const nilToVoidT = <V>(
  target: AtomLikeOfOutput<V | undefined | null>
): Data<V | Void> => {
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  const handleM = Mutation.ofLiftLeft(
    (prev: Vacuo | V): V | Terminator | Void => {
      if (isVacuo(prev)) return TERMINATOR

      return isNil(prev) ? VOID : prev
    }
  )

  const outputD = Data.empty<V | Void>()
  pipeAtom(handleM, outputD)

  binaryTweenPipeAtom(target, handleM)

  return outputD
}
