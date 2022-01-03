import { isArray, isFunction } from '../../internal'
import { isAtomLike, Mutation, Data } from '../atoms'
import { isMutator } from '../particles'
import { pipeAtom, composeAtom } from './normal-link.helpers'

import type { Mutator } from '../particles'
import type { AtomLike } from '../atoms'

export function liftAtom <A extends AtomLike> (target: A): A
export function liftAtom <A, B> (target: Mutator<A, B>): Mutation<A, B>
export function liftAtom <R> (target: (...args: any[]) => R): Mutation<any, R>
export function liftAtom <A> (target: A): Data<A>
export function liftAtom (target: any): any {
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

export function binaryLiftPipeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function binaryLiftPipeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function binaryLiftPipeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  // 只取前两项
  const liftedAtoms = _targets.slice(0, 2).map(liftAtom)
  pipeAtom(...liftedAtoms)

  return liftedAtoms
}

export function binaryLiftComposeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function binaryLiftComposeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function binaryLiftComposeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  // 只取最后两项
  const liftedAtoms = _targets.slice(-2).map(liftAtom)
  composeAtom(...liftedAtoms)

  return liftedAtoms
}

export function nAryLiftPipeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function nAryLiftPipeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function nAryLiftPipeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  const liftedAtoms = _targets.map(liftAtom)
  pipeAtom(...liftedAtoms)

  return liftedAtoms
}
export const liftPipeAtom = nAryLiftPipeAtom

export function nAryLiftComposeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function nAryLiftComposeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function nAryLiftComposeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  const liftedAtoms = _targets.map(liftAtom)
  composeAtom(liftedAtoms)

  return liftedAtoms
}
export const liftComposeAtom = nAryLiftComposeAtom
