import { isArray } from '../../internal'
import { pipeAtom, composeAtom } from './normal-link.helpers'
import { tweenAtoms } from './tween-link.helpers'
import { liftAtom } from './lift-link.helpers'

import type { AtomLike } from '../atoms'

export const binaryHyperPipeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  // 只取前两项
  let atoms = _atoms.slice(0, 2).map<AtomLike>(liftAtom)
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)
  return atoms as T
}

export const binaryHyperComposeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  // 只取最后两项
  let atoms = _atoms.slice(-2).map<AtomLike>(liftAtom)
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)
  return atoms as T
}

export const nAryHyperPipeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  let atoms = _atoms.map<AtomLike>(liftAtom)
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)
  return atoms as T
}
export const hyperPipeAtom = nAryHyperPipeAtom

export const nAryHyperComposeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  let atoms = _atoms.map<AtomLike>(liftAtom)
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)
  return atoms as T
}
export const hyperComposeAtom = nAryHyperComposeAtom
