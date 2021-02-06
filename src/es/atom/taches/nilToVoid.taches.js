import { isNil } from '../../internal.js'
import { VOID } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * Replace nil value(i.e. undefined, null) with VOID
 *
 * @param target Atom
 * @return atom Data
 */
export const nilToVoidT = target => {
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of nilToVoidT is expected to be type of "Atom" only.'))
  }

  const transM = Mutation.ofLiftLeft(prev => isNil(prev) ? VOID : prev)

  const outputD = Data.empty()
  pipeAtom(transM, outputD)

  binaryTweenPipeAtom(target, transM)

  return outputD
}
