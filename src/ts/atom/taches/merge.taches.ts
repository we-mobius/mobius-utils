import { isArray } from '../../internal'
import { Data, Mutation, isAtom } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */
export const mergeT = (...args) => {
  let atoms = args[0]
  if (!isArray(atoms)) {
    atoms = args
  }

  const inputAtoms = atoms.map(atom => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of mergeT are expected to be type of "Atom".'))
    }
    return atom
  })

  const mergeM = Mutation.ofLiftLeft(prev => prev)

  const outputD = Data.empty()
  pipeAtom(mergeM, outputD)

  inputAtoms.forEach(atom => {
    binaryTweenPipeAtom(atom, mergeM)
  })

  return outputD
}
