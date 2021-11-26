import { isArray } from '../../internal/base'

import type { Data, Mutation } from '../atoms'
import type { DataMediator, MutationMediator } from '../mediators'

type ValidAtom = Data<any> | Mutation<any, any> | DataMediator<Data<any>> | MutationMediator<Mutation<any, any>>

interface IPipeAtom {
  (...atoms: ValidAtom[]): typeof atoms
  (...atoms: [ValidAtom[]]): typeof atoms[0]
}
/**
 * Recursively pipe atoms.
 */
export const pipeAtom: IPipeAtom = (...atoms: any[]): any => {
  if (atoms.length === 1 && isArray(atoms[0])) {
    atoms = atoms[0]
  }
  atoms.reverse().forEach((atom, index, all) => {
    if (index >= 1) {
      atom.beObservedBy(all[index - 1])
    }
  })

  return atoms
}

interface IComposeAtom {
  (...atoms: ValidAtom[]): typeof atoms
  (...atoms: [ValidAtom[]]): typeof atoms[0]
}
/**
 * Recursively compose atoms.
 */
export const composeAtom: IComposeAtom = (...atoms: any[]): any => {
  if (atoms.length === 1 && isArray(atoms[0])) {
    atoms = atoms[0]
  }
  atoms.forEach((atom, index, all) => {
    if (index >= 1) {
      atom.beObservedBy(all[index - 1])
    }
  })
  return atoms
}
