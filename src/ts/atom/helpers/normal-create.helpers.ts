import { Datar, Mutator } from '../particles'
import { Data, Mutation } from '../atoms'

export const createEmptyDatar = Datar.empty
export const createEmptyMutator = Mutator.empty

export const createDatarOf = Datar.of
export const createMutatorOf = Mutator.of
export const createMutatorOfLift = Mutator.ofLift
export const createMutatorOfLiftLeft = Mutator.ofLiftLeft
export const createMutatorOfLiftRight = Mutator.ofLiftRight
export const createMutatorOfLiftBoth = Mutator.ofLiftBoth

export const createEmptyData = Data.empty
export const createEmptyMutation = Mutation.empty

export const createDataOf = Data.of
export const createMutationOf = Mutation.of
export const createMutationofLift = Mutation.ofLift
export const createMutationOfLiftLeft = Mutation.ofLiftLeft
export const createMutationOfLiftRight = Mutation.ofLiftRight
export const createMutationOfLiftBoth = Mutation.ofLiftBoth
