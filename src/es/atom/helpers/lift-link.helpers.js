import { isArray, isFunction } from '../../internal.js'
import { isAtom, Mutation, Data } from '../atom.js'
import { isMutator } from '../meta.js'
import { pipeAtom, composeAtom } from './normal-link.helpers.js'

export const liftAtom = target => {
  if (isAtom(target)) {
    return target
  } else if (isMutator(target)) {
    return Mutation.of(target)
  } if (isFunction(target)) {
    return Mutation.ofLiftBoth(target)
  } else {
    return Data.of(target)
  }
}

export const binaryLiftPipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取前两项
  args = args.slice(0, 2)
  const liftedAtoms = args.map(liftAtom)
  pipeAtom(liftedAtoms)
  return liftedAtoms
}
export const binaryLiftComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取最后两项
  args = args.slice(-2)
  const liftedAtoms = args.map(liftAtom)
  composeAtom(liftedAtoms)
  return liftedAtoms
}

export const nAryLiftPipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const liftedAtoms = args.map(liftAtom)
  pipeAtom(liftedAtoms)
  return liftedAtoms
}
export const liftPipeAtom = nAryLiftPipeAtom
export const nAryLiftComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const liftedAtoms = args.map(liftAtom)
  composeAtom(liftedAtoms)
  return liftedAtoms
}
export const liftComposeAtom = nAryLiftComposeAtom
