import { isArray } from '../../internal'
import { pipeAtom, composeAtom } from './normal-link.helpers'
import { tweenAtoms } from './tween-link.helpers'
import { liftAtom } from './lift-link.helpers'

import type { Data, Mutation } from '../atoms'
import type { DataMediator, MutationMediator } from '../mediators'

type ValidAtom = Data<any> | Mutation<any, any> | DataMediator<Data<any>> | MutationMediator<Mutation<any, any>>

interface IHyperPipeAtom {
  (...atoms: ValidAtom[]): typeof atoms
  (...atoms: [ValidAtom[]]): typeof atoms[0]
}

export const binaryHyperPipeAtom: IHyperPipeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取前两项
  let atoms = args.slice(0, 2).map(liftAtom) as any[]
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)
  return atoms
}

interface IHyperComposeAtom {
  (...atoms: ValidAtom[]): typeof atoms
  (...atoms: [ValidAtom[]]): typeof atoms[0]
}
export const binaryHyperComposeAtom: IHyperComposeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取最后两项
  let atoms = args.slice(-2).map(liftAtom) as any[]
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)
  return atoms
}

export const nAryHyperPipeAtom: IHyperPipeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  let atoms = args.map(liftAtom) as any[]
  atoms = tweenAtoms(atoms)
  pipeAtom(atoms)
  return atoms
}
export const hyperPipeAtom = nAryHyperPipeAtom

export const nAryHyperComposeAtom: IHyperComposeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  let atoms = args.map(liftAtom) as any[]
  atoms = tweenAtoms(atoms)
  composeAtom(atoms)
  return atoms
}
export const hyperComposeAtom = nAryHyperComposeAtom
