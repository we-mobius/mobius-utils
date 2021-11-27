import { isArray, isFunction } from '../../internal'
import { isAtomLike, Mutation, Data } from '../atoms'
import { isMutator } from '../particles'
import { pipeAtom, composeAtom } from './normal-link.helpers'

import type { Mutator } from '../particles'
import type { AtomLike } from '../atoms'

interface ILiftAtom {
  <A extends AtomLike>(target: A): A
  <A, B>(target: Mutator<A, B>): Mutation<A, B>
  <R>(target: (...args: any[]) => R): Mutation<any, R>
  <A>(target: A): A
}

export const liftAtom: ILiftAtom = (target: any): any => {
  if (isAtomLike(target)) {
    return target
  } else if (isMutator(target)) {
    return Mutation.of(target)
  } if (isFunction(target)) {
    return Mutation.ofLiftBoth(target)
  } else {
    return Data.of(target)
  }
}

export const binaryLiftPipeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  // 只取前两项
  const liftedAtoms = _atoms.slice(0, 2).map<AtomLike>(liftAtom)
  pipeAtom(...liftedAtoms)

  return liftedAtoms as T
}

export const binaryLiftComposeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  // 只取最后两项
  const liftedAtoms = _atoms.slice(-2).map<AtomLike>(liftAtom)
  composeAtom(...liftedAtoms)
  return liftedAtoms as T
}

export const nAryLiftPipeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  const liftedAtoms = _atoms.map<AtomLike>(liftAtom)
  pipeAtom(...liftedAtoms)
  return liftedAtoms as T
}
export const liftPipeAtom = nAryLiftPipeAtom

export const nAryLiftComposeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  const liftedAtoms = _atoms.map<AtomLike>(liftAtom)
  composeAtom(liftedAtoms)
  return liftedAtoms as T
}
export const liftComposeAtom = nAryLiftComposeAtom
