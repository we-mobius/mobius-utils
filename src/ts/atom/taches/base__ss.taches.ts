import { isPlainObject, isFunction } from '../../internal/base'

import { Data, Mutation, isAtomLike, DEFAULT_MUTATION_OPTIONS } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type {
  MutatorOriginalTransformationUnion
} from '../particles'
import type { MutationOptions, AtomLikeOfOutput } from '../atoms'

// S -> Single, M -> Multi

/******************************************************************************************************
 *
 *                                           SS Tache
 *
 ******************************************************************************************************/

/**
 *
 */
export type SSTache<P = any, C = any> = (source: AtomLikeOfOutput<P>) => Data<C>
/**
  * @param transformation
  * @param options same as MutationOptions
  * @return { SSTache } SSTache :: `(source) => Data<any>`
  */
export const createSSTache = <P, C>(
  transformation: MutatorOriginalTransformationUnion<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS
): SSTache<P, C> => {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transformation" is expected to be type of "Function".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions = { ...DEFAULT_MUTATION_OPTIONS, ...options }

  /**
    * @param source
    * @return { Data<C> } Data
    */
  return source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"target" is expected to be type of "AtomLike".'))
    }

    const mutation = Mutation.ofLift<P, C>(transformation, preparedOptions)
    const outputD = Data.empty<C>()

    pipeAtom(mutation, outputD)
    binaryTweenPipeAtom(source, mutation)

    return outputD
  }
}
