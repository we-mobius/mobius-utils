import { curry } from '../../functional'
import { isAtom } from '../atoms'
import { isMediator } from '../mediators'

import type { AtomType } from '../atoms'

/**
 * If target is an Atom instance or Mediator instance, return its `atomType`, otherwise return `undefined`.
 * @param target anything
 */
export const getAtomType = (target: any): AtomType | undefined => target?.atomType

/**
 * Check whether the given targets are both Atom instance and in same Atom type.
 * @return { boolean } whether the given targets are in same type of Atom.
 */
export const isSameTypeOfAtom = (targetA: any, targetB: any): boolean =>
  isAtom(targetA) && isAtom(targetB) && targetA.atomType !== undefined && targetA.atomType === targetB.atomType

interface IIsSameTypeOfAtom {
  (targetA: any): ((targetB: any) => boolean)
  (targetA: any, targetB: any): boolean
}
/**
 * Curried version of `isSameTypeOfAtom`.
 * @see {@link isSameTypeOfAtom}
 */
export const isSameTypeOfAtom_: IIsSameTypeOfAtom = curry(isSameTypeOfAtom)

/**
 * Check whether the given targets are both Mediator instance and in same Mediator type.
 * @return { boolean } whether the given targets are in same type of Mediator.
 */
export const isSameTypeOfMediator = (targetA: any, targetB: any): boolean =>
  isMediator(targetA) && isMediator(targetB) && targetA.mediatorType !== undefined && targetA.mediatorType === targetB.mediatorType

interface IIsSameTypeOfMediator {
  (targetA: any): ((targetB: any) => boolean)
  (targetA: any, targetB: any): boolean
}
/**
 * Curried version of `isSameTypeOfMediator`.
 * @see {@link isSameTypeOfMediator}
 */
export const isSameTypeOfMediator_: IIsSameTypeOfMediator = curry(isSameTypeOfMediator)
