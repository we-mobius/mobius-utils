import { curry } from '../../functional.js'
import { pipeAtom } from '../helpers.js'
import { mutationToData } from './transform.taches.js'
import { isMutation, Mutation, Data } from '../atom.js'
import { TERMINATOR } from '../meta.js'

export const filterT = curry((pred, atom) => {
  let inputData = atom
  if (isMutation(atom)) {
    inputData = mutationToData(atom)
  }

  const filterMutation = Mutation.ofLiftLeft(prev => {
    return pred(prev) ? prev : TERMINATOR
  })

  const outputData = Data.empty()

  pipeAtom(inputData, filterMutation, outputData)

  return outputData
})
