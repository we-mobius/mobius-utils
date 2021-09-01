import { isObject } from '../../internal.js'
import { Data, Mutation } from '../atom.js'

export const createEmptyData = () => Data.empty()
export const createEmptyMutation = () => Mutation.empty()

export const createDataOf = (value, options) => Data.of(value, options)
export const createMutationOf = (operation, options) => {
  if (!options || !isObject(options)) return Mutation.of(operation)
  return Mutation.ofLift(operation, options)
}

export const createMutationOfLL = (operation, options) => Mutation.ofLiftLeft(operation, options)
export const createMutationOfLR = (operation, options) => Mutation.ofLiftRight(operation, options)
export const createMutationOfLB = (operation, options) => Mutation.ofLiftBoth(operation, options)
