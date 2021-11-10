import { isNil } from '../../internal'
import { VOID } from '../meta'
import { Data, Mutation, isAtom } from '../atom'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * Replace nil value(i.e. undefined, null) with VOID
 *
 * @param { Atom } target
 * @return Data
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
