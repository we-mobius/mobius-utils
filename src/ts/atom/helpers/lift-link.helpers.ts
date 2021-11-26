import { isArray, isFunction } from '../../internal'
import { isAtom, Mutation, Data } from '../atoms'
import { isMutator } from '../particles'
import { pipeAtom, composeAtom } from './normal-link.helpers'

import type { Mutator } from '../particles'
import type { DataMediator, MutationMediator } from '../mediators'

type ValidAtom = Data<any> | Mutation<any, any> | DataMediator<Data<any>> | MutationMediator<Mutation<any, any>>

interface ILiftAtom {
  <A extends ValidAtom>(target: A): A
  <A, B>(target: Mutator<A, B>): Mutation<A, B>
  <R>(target: (...args: any[]) => R): Mutation<any, R>
  <A>(target: A): A
}

export const liftAtom: ILiftAtom = (target: any): any => {
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

interface ILiftPipeAtom {
  (...atoms: ValidAtom[]): typeof atoms
  (...atoms: [ValidAtom[]]): typeof atoms[0]
}
export const binaryLiftPipeAtom: ILiftPipeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取前两项
  const liftedAtoms = args.slice(0, 2).map(liftAtom) as any[]
  pipeAtom(...liftedAtoms)
  return liftedAtoms
}

interface ILiftComposeAtom {
  (...atoms: ValidAtom[]): typeof atoms
  (...atoms: [ValidAtom[]]): typeof atoms[0]
}
export const binaryLiftComposeAtom: ILiftComposeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取最后两项
  const liftedAtoms = args.slice(-2).map(liftAtom) as any[]
  composeAtom(...liftedAtoms)
  return liftedAtoms
}

export const nAryLiftPipeAtom: ILiftPipeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const liftedAtoms = args.map(liftAtom) as any[]
  pipeAtom(...liftedAtoms)
  return liftedAtoms
}
export const liftPipeAtom = nAryLiftPipeAtom

export const nAryLiftComposeAtom: ILiftComposeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const liftedAtoms = args.map(liftAtom) as any[]
  composeAtom(liftedAtoms)
  return liftedAtoms
}
export const liftComposeAtom = nAryLiftComposeAtom
