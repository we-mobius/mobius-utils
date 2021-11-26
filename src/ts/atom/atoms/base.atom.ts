import { isObject } from '../../internal/base'
import { pipe, compose } from '../../functional'

import { Vain } from '../vain'
import { Particle } from '../particles'

type AnyFunction = (...args: any[]) => any

/******************************************************************************************************
 *
 *                                                Atoms
 *
 ******************************************************************************************************/

export enum AtomType {
  Data = '[atom Data]',
  Mutation = '[atom Mutation]',
}

/******************************************************************************************************
 *
 *                                           Atom Predicates
 *
 ******************************************************************************************************/

/**
 * @param { any } tar anything
 * @return { boolean } whether the target is an Atom instance
 */
export const isAtom = (tar: any): tar is BaseAtom => isObject(tar) && tar.isAtom

export interface AtomLike {
  isAtom: boolean
  // subscribe: (consumer: any, options?: any) => Subscription
  // trigger: () => void
  // observe: () => void
  // beObservedBy: () => void
}

export const isAtomLike = (tar: any): tar is AtomLike => isObject(tar) && tar.isAtom

/******************************************************************************************************
 *
 *                                           Atom Classes
 *
 ******************************************************************************************************/

/**
 *
 */
export interface BaseAtomOptions {
  isAsync?: boolean
}
export const DEFAULT_BASEATOM_OPTIONS: Required<BaseAtomOptions> = {
  isAsync: false
}
/**
 * @important please consider BaseMediator when add property or method to Atom
 * !!
 */
export abstract class BaseAtom extends Vain {
  constructor () {
    super()
    if (new.target === BaseAtom) {
      throw new Error('BaseAtom class can not be instantiated!')
    }
  }

  abstract get atomType (): AtomType

  abstract get particleName (): string
  abstract get metaName (): string
  abstract get particle (): Particle
  abstract get meta (): any // OrBaseMeta<any>

  get isAtom (): true { return true }

  abstract get consumers (): Set<any>

  pipe (...args: any[]): any {
    return (pipe(...args) as AnyFunction)(this)
  }

  compose (...args: any[]): any {
    return compose(...args)(this)
  }
}

/******************************************************************************************************
 *
 *                                           Atom Related Types
 *
 ******************************************************************************************************/

/**
 *—————————————————————————————————————————————— Subscribe Related ————————————————————————————————————————————————————
 */

/**
 *
 */
export interface SubscribeOptions {
  isExtracted?: boolean
}
export const DEFAULT_SUBSCRIBE_OPTIONS: Required<SubscribeOptions> = {
  isExtracted: false
}
export interface Subscription {
  proxyConsumer: AnyFunction
  unsubscribe: () => void
}

/**
 *—————————————————————————————————————————————— Trigger Related ————————————————————————————————————————————————————
 */

/**
 *
 */
export interface AtomTriggerRegisterOptions {
  forceWrap?: boolean
}
export const DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS: Required<AtomTriggerRegisterOptions> = {
  forceWrap: false
}

export interface TriggerController {
  start?: () => void
  pause?: () => void
  cancel?: () => void
}
export type InternalTrigger<Accepted> = (accepted: Accepted, ...args: any[]) => void
export type Trigger<Accepted> = (internalTrigger: InternalTrigger<Accepted>) => TriggerController
