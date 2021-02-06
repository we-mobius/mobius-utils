import { isArray } from '../../internal.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */
export const mergeT = (...args) => {
  let atoms = args[0]
  if (!isArray(atoms)) {
    atoms = args
  }

  const inputDatas = atoms.map(atom => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of mergeT are expected to be type of "Atom".'))
    }
    return atom
  })

  const mergeM = Mutation.ofLiftLeft(prev => prev)

  const outputD = Data.empty()
  pipeAtom(mergeM, outputD)

  inputDatas.forEach(data => {
    binaryTweenPipeAtom(data, mergeM)
  })

  return outputD
}
