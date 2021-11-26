import { curry } from '../../functional'
import { isAtom } from '../atoms'
import { isMediator } from '../mediators'

import type { AtomType } from '../atoms'

/**
 * @param { any } tar anything
 * @return { AtomType | undefined } If target is an Atom instance or Mediator instance,
 *                                  return its `atomType`, otherwise return `undefined`.
 */
export const getAtomType = (tar: any): AtomType | undefined => tar?.atomType

/**
 * Check whether the given targets are both Atom instance and in same Atom type.
 * @return { boolean } whether the given targets are in same type of Atom.
 */
export const isSameTypeOfAtom = (tarA: any, tarB: any): boolean => {
  if (!isAtom(tarA) || !isAtom(tarB)) {
    return false
  } else {
    const atomTypeA = getAtomType(tarA)
    const atomTypeB = getAtomType(tarB)
    return atomTypeA === atomTypeB
  }
}
interface IIsSameTypeOfAtom{
  (tar: any): ((tar: any) => boolean)
  (tarA: any, tarB: any): boolean
}
export const isSameTypeOfAtom_: IIsSameTypeOfAtom = curry(isSameTypeOfAtom)

/**
 * Check whether the given targets are both Mediator instance and in same Mediator type.
 * @return { boolean } whether the given targets are in same type of Mediator.
 */
export const isSameTypeOfMediator = (tarA: any, tarB: any): boolean =>
  isMediator(tarA) && isMediator(tarB) && tarA.mediatorType === tarB.mediatorType

interface IIsSameTypeOfMediator {
  (tar: any): ((tar: any) => boolean)
  (tarA: any, tarB: any): boolean
}
export const isSameTypeOfMediator_: IIsSameTypeOfMediator = curry(isSameTypeOfMediator)
