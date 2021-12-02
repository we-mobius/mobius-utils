import { isArray } from '../../internal/base'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

/**
 * Converge source atoms to a single Data.
 */
export const convergeT = <V>(
  ...sources: Array<AtomLikeOfOutput<V>> | [Array<AtomLikeOfOutput<V>>]
): Data<V> => {
  let preparedSources: Array<AtomLikeOfOutput<V>> = []

  if (sources.length === 1 && isArray(sources[0])) {
    preparedSources = sources[0]
  } else {
    preparedSources = sources as Array<AtomLikeOfOutput<V>>
  }

  const inputAtoms = preparedSources.map(source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"sources" are expected to be type of "AtomLike".'))
    }
    return source
  })

  const convergeM = Mutation.ofLiftLeft(
    (prev: V | Vacuo): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      return prev
    }
  )

  const outputD = Data.empty<V>()
  pipeAtom(convergeM, outputD)

  inputAtoms.forEach(atom => {
    binaryTweenPipeAtom(atom, convergeM)
  })

  return outputD
}
