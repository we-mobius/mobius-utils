import { isObject, isFunction } from '../internal/base'

import { Vain } from './vain'

/******************************************************************************************************
 *                                                  Metas
 *
 * Vacuo      -> A value that can serve as the value (for Datar, or transformation for Mutator)
 *                 of Datar and Mutator at the same time.
 *
 * Void       -> Void's role in Atom world is same as undefined & null 's role in normal JavaScript world.
 *                 It is designed to replace values that can be converted to false, such as undefined & null.
 *                 So falsy values can flowing through the Atoms as normal values flowing.
 *                 For the typical usages, please check nilToVoidT & defaultT.
 *
 * Pausor     -> Pausor is designed as a signal for "stop" of Atom Flow.
 *                 Data or Mutation receives Pausor will update there own value (or transformation),
 *                   but will not pass the updated value to the next Atom.
 *
 * Terminator -> Terminator is designed as a signal for "interruption" of Atom Flow.
 *                 Mutation will not mutate (trigger an transformation to update the downstream data's value)
 *                   a Data or Datar which value is Terminator.
 *                 Data will not mutate (update own value to income transformation's result) a Mutation or Mutator or Transformation
 *                   which result is Terminator.
 *                 For the typical usages, please check filterT or skipT or takeT.
 ******************************************************************************************************/

/**
 * Number of signal is finite. Using a `enum` to group them is reasonable.
 */
export enum MetaType {
  Vacuo = '[meta Vacuo]',
  Void = '[meta Void]',
  Pausor = '[meta Pausor]',
  Terminator = '[meta Terminator]'
}

/******************************************************************************************************
 *
 *                                            Meta Predicatess
 *
 ******************************************************************************************************/

/**
 * @param target anything
 * @return { boolean } whether the target is Meta instance
 */
export const isMeta = (target: any): target is Meta => isObject(target) && target.isMeta
/**
 * @param target anything
 * @return { boolean } whether the targe is a Vacuo instance
 */
export const isVacuo = (target: any): target is Vacuo => isFunction(target) && target.isVacuo
/**
 * @param target anything
 * @return { boolean } whether the target is a Void instance
 */
export const isVoid = (target: any): target is Void => isObject(target) && target.isVoid
/**
  * @param target anything
  * @return { boolean } whether the target is a Pausor instance
  */
export const isPausor = (target: any): target is Pausor => isObject(target) && target.isPausor
/**
  * @param target anything
  * @return { boolean } whether the target is a Terminator instance
  */
export const isTerminator = (target: any): target is Terminator => isObject(target) && target.isTerminator

/******************************************************************************************************
 *
 *                                            Meta Classes
 *
 ******************************************************************************************************/

/**
 * Base meta class.
 */
export abstract class Meta extends Vain {
  isMeta: true

  constructor () {
    super()
    this.isMeta = true

    if (new.target === Meta) {
      throw new Error('BaseMeta class can not be instantiated!')
    }
  }

  abstract get metaType (): MetaType
}
export type OrMeta<T> = T | Meta
export type ExcludeMeta<T> = Exclude<T, Meta>

/**
 *—————————————————————————————————————————————— Vacuo Meta ————————————————————————————————————————————————————
 */
/**
 * A value that can serve as the value (for Datar, or transformation for Mutator)
 *   of Datar and Mutator at the same time.
 * Base on feature of "JavaScript Function is also an Object",
 *   Vacuo can be both Datar's and Mutator's value,
 *   says Empty Datar and Empty Mutator respectively.
 *
 * Content security policy compatible version of Vacuo.
 *   The "class Vacuo extends Function" syntax can not use in strict browsers.
 *   reference: https://developer.chrome.com/docs/apps/contentSecurityPolicy/
 */
export type Vacuo = ((...args: any[]) => Vacuo) & { __type__: 'Vacuo' } & Meta
export const makeVacuo = (): Vacuo => {
  const internalVacuo = function (): Vacuo {
    // do nothing
    return VACUO
  }
  Object.defineProperty(internalVacuo, '__type__', {
    get: () => { return 'Vacuo' }
  })
  // Vain abstract
  Object.defineProperty(internalVacuo, 'isVain', {
    get: () => { return true }
  })
  Object.defineProperty(internalVacuo, 'type', {
    get: () => { return MetaType.Vacuo }
  })
  // Meta abstract
  Object.defineProperty(internalVacuo, 'isMeta', {
    get: () => { return true }
  })
  Object.defineProperty(internalVacuo, 'metaType', {
    get: () => { return MetaType.Vacuo }
  })
  // Vacuo Properties
  Object.defineProperty(internalVacuo, 'isVacuo', {
    get: () => { return true }
  })
  Object.defineProperty(internalVacuo, 'isEmpty', {
    get: () => { return true }
  })
  return internalVacuo as Vacuo
}
/**
 * Global Vacuo instance.
 * @see {@link makeVacuo}
 */
export const VACUO = makeVacuo()

/**
 *—————————————————————————————————————————————— Void Meta ————————————————————————————————————————————————————
 */
/**
 * Void's role in Atom world is same as undefined & null 's role in normal JavaScript world.
 *   It is designed to replace values that can be converted to false, such as undefined & null.
 *   So falsy values can flowing through the Atoms as normal values flowing.
 *   For the typical usages, please check nilToVoidT & defaultT.
 */
export class Void extends Meta {
  isVoid: true
  isFalsy: true

  constructor () {
    super()
    this.isVoid = true
    this.isFalsy = true
  }

  get type (): MetaType { return MetaType.Void }
  get metaType (): MetaType { return MetaType.Void }
}
/**
 * Global Void instance.
 * @see {@link Void}
 */
export const VOID = new Void()

/**
 *—————————————————————————————————————————————— Pausor Meta ————————————————————————————————————————————————————
 */
/**
 * Pausor is designed as a signal for "stop" of Atom Flow.
 *   Data or Mutation receives Pausor will update there own value (or transformation),
 *   but will not pass the updated value to the next Atom.
 */
export class Pausor extends Meta {
  isPausor: true

  constructor () {
    super()
    this.isPausor = true
  }

  get type (): MetaType { return MetaType.Pausor }
  get metaType (): MetaType { return MetaType.Pausor }
}
/**
 * Global Pausor instance.
 * @see {@link Pausor}
 */
export const PAUSOR = new Pausor()

/**
 *—————————————————————————————————————————————— Terminator Meta ————————————————————————————————————————————————————
 */
/**
 * Terminator is designed as a signal for "interruption" of Atom Flow.
 *   Mutation will not mutate (trigger an transformation to update the downstream data's value)
 *     a Data or Datar which value is Terminator.
 *   Data will not mutate (update own value to income transformation's result) a Mutation or Mutator or Transformation
 *     which result is Terminator.
 *   For the typical usages, please check filterT or skipT or takeT.
 */
export class Terminator extends Meta {
  isTerminator: true

  constructor () {
    super()
    this.isTerminator = true
  }

  get type (): MetaType { return MetaType.Terminator }
  get metaType (): MetaType { return MetaType.Terminator }
}
/**
 * Global Terminator instance.
 * @see {@link Terminator}
 */
export const TERMINATOR = new Terminator()
