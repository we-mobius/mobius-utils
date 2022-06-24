import { Datar, Mutator } from '../particles'
import { Data, Mutation } from '../atoms'

export const makeEmptyDatar = Datar.empty
export const makeEmptyMutator = Mutator.empty

export const makeDatarOf = Datar.of
export const makeMutatorOf = Mutator.of
export const makeMutatorOfLift = Mutator.ofLift
export const makeMutatorOfLiftLeft = Mutator.ofLiftLeft
export const makeMutatorOfLiftRight = Mutator.ofLiftRight
export const makeMutatorOfLiftBoth = Mutator.ofLiftBoth

export const makeEmptyData = Data.empty
export const makeEmptyMutation = Mutation.empty

export const makeDataOf = Data.of
export const makeMutationOf = Mutation.of
export const makeMutationofLift = Mutation.ofLift
export const makeMutationOfLiftLeft = Mutation.ofLiftLeft
export const makeMutationOfLiftRight = Mutation.ofLiftRight
export const makeMutationOfLiftBoth = Mutation.ofLiftBoth
