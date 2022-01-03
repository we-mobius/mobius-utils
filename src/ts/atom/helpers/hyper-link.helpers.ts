import { isArray } from '../../internal'
import { pipeAtom, composeAtom } from './normal-link.helpers'
import { tweenAtoms } from './tween-link.helpers'
import { liftAtom } from './lift-link.helpers'

import type { AtomLike } from '../atoms'

export function binaryHyperPipeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function binaryHyperPipeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function binaryHyperPipeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  // 只取前两项
  let atoms: AtomLike[] = _targets.slice(0, 2).map(liftAtom)
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)

  return atoms
}

export function binaryHyperComposeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function binaryHyperComposeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function binaryHyperComposeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  // 只取最后两项
  let atoms: AtomLike[] = _targets.slice(-2).map(liftAtom)
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)

  return atoms as T
}

export function nAryHyperPipeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function nAryHyperPipeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function nAryHyperPipeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  let atoms: AtomLike[] = _targets.map(liftAtom)
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)

  return atoms
}
export const hyperPipeAtom = nAryHyperPipeAtom

export function nAryHyperComposeAtom <T extends any[]> (targets: [...T]): AtomLike[]
export function nAryHyperComposeAtom <T extends any[]> (...targets: [...T]): AtomLike[]
export function nAryHyperComposeAtom <T extends any[]> (...targets: [[...T]] | [...T]): AtomLike[] {
  let _targets: any[]
  if (targets.length === 1 && isArray(targets[0])) {
    _targets = targets[0]
  } else {
    _targets = targets
  }

  let atoms: AtomLike[] = _targets.map(liftAtom)
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)

  return atoms
}
export const hyperComposeAtom = nAryHyperComposeAtom
