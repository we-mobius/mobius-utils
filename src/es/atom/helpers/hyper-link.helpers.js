import { isArray } from '../../internal.js'
import { pipeAtom, composeAtom } from './normal-link.helpers.js'
import { tweenAtoms } from './tween-link.helpers.js'
import { liftAtom } from './lift-link.helpers.js'

export const binaryHyperPipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取前两项
  args = args.slice(0, 2)
  let atoms = args.map(liftAtom)
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)
  return atoms
}
export const binaryHyperComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取最后两项
  args = args.slice(-2)
  let atoms = args.map(liftAtom)
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)
  return atoms
}

export const nAryHyperPipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  let atoms = args.map(liftAtom)
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)
  return atoms
}
export const hyperPipeAtom = nAryHyperPipeAtom
export const nAryHyperComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  let atoms = args.map(liftAtom)
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)
  return atoms
}
export const hyperComposeAtom = nAryHyperComposeAtom
