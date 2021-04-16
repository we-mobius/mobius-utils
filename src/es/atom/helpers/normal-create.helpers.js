import { isObject } from '../../internal.js'
import { Data, Mutation } from '../atom.js'

export const createEmptyData = () => Data.empty()
export const createEmptyMutation = () => Mutation.empty()

export const createDataOf = value => Data.of(value)
export const createMutationOf = (operation, options) => {
  if (!options || !isObject(options)) return Mutation.of(operation)
  return Mutation.ofLift(operation, options)
}

export const createMutationOfLL = operation => Mutation.ofLiftLeft(operation)
export const createMutationOfLR = operation => Mutation.ofLiftRight(operation)
export const createMutationOfLB = operation => Mutation.ofLiftBoth(operation)
