import { isObject } from '../../internal/base'
import { pipe, compose } from '../../functional'

import { Vain } from '../vain'
import { Particle } from '../particles'

import type { Data } from './data.atom'
import type { Mutation } from './mutation.atom'
import type { DataMediator, MutationMediator } from '../mediators'

import type { AnyFunction, AnyStringRecord, CastAny, First, Last, UndefinedableByKeys } from '../../@types/index'

/******************************************************************************************************
 *
 *                                                Atoms
 *
 ******************************************************************************************************/

/**
 *
 */
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
 *
 */
export interface AtomLike {
  isAtom: boolean
  atomType: AtomType
  particleName: string
  metaName: string
  particle: Particle
  meta: any
  options: AnyStringRecord
  subscribe: (consumer: (particle: any, atom?: any) => void, options?: any) => Subscription
  getSubscriptionByConsumer: (consumer: (particle: any, atom?: any) => void) => Subscription | undefined
  getSubscriptionByHostAtom: (hostAtom: AtomLike) => Subscription | undefined
  getSubscription: (consumerOrHostAtom: ((particle: any, atom?: any) => void) | AtomLike) => Subscription | undefined
  unsubscribe: (target: ((particle: any, atom?: any) => void) | Subscription | AtomLike) => boolean
  unsubscribeAll: () => boolean
  trigger: (particle?: any) => void
  observe: (atom?: any) => Subscription
  unobserve: (atom?: any) => boolean
  unobserveAll: () => boolean
  beObservedBy: (atom?: any) => Subscription
  pipe: <FNS extends AnyFunction[] = AnyFunction[]>
  (...fns: FNS) => FNS extends [] ? [] : ReturnType<CastAny<Last<FNS>>>
  compose: <FNS extends AnyFunction[] = AnyFunction[]>
  (...fns: AnyFunction[]) => FNS extends [] ? [] : ReturnType<CastAny<First<FNS>>>
}
export type DataLike<V = any> = Data<V> | DataMediator<V>
export type MutationLike<P = any, C = any> = Mutation<P, C> | MutationMediator<P, C>

/**
 * AtomLike that can take any as input and any as output.
 */
export type AtomLikeOfAny = Data<any> | DataMediator<any> | Mutation<any, any> | MutationMediator<any, any>
/**
 * AtomLike that can take I as input.
 */
export type AtomLikeOfInput<I = any> = Data<I> | DataMediator<I> | Mutation<I, any> | MutationMediator<I, any>
/**
 * AtomLike that can emit O as output.
 */
export type AtomLikeOfOutput<O = any> = Data<O> | DataMediator<O> | Mutation<any, O> | MutationMediator<any, O>

export const isAtomLike = (tar: any): tar is AtomLike => isObject(tar) && tar.isAtom
export const isDataLike = <V = any>(tar: any): tar is DataLike<V> => isObject(tar) && tar.isData
export const isMutationLike = <P = any, C = any>(tar: any): tar is MutationLike<P, C> => isObject(tar) && tar.isMutation

/**
 * @param tar anything
 * @return { boolean } whether the target is an Atom instance
 */
export const isAtom = (tar: any): tar is BaseAtom => isObject(tar) && tar.isAtom

/******************************************************************************************************
 *
 *                                           Atom Classes
 *
 ******************************************************************************************************/

/**
 *
 */
type Unary<I = any, O = any> = (input: I) => O
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
  abstract get meta (): any

  get isAtom (): boolean { return true }

  abstract get options (): AnyStringRecord

  abstract setOptions <K extends keyof BaseAtomOptions>(key: keyof BaseAtomOptions, value: BaseAtomOptions[K]): void

  pipe (): this
  pipe<A = any> (fn1: Unary<this, A>): A
  pipe<A = any, B = any> (fn1: Unary<this, A>, fn2: Unary<A, B>): B
  pipe<A = any, B = any, C = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>): C
  pipe<A = any, B = any, C = any, D = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>): D
  // eslint-disable-next-line max-len
  pipe<A = any, B = any, C = any, D = any, E = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>, fn5: Unary<D, E>): E
  // eslint-disable-next-line max-len
  pipe<A = any, B = any, C = any, D = any, E = any, F = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>, fn5: Unary<D, E>, fn6: Unary<E, F>): F
  // eslint-disable-next-line max-len
  pipe<A = any, B = any, C = any, D = any, E = any, F = any, G = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>, fn5: Unary<D, E>, fn6: Unary<E, F>, fn7: Unary<F, G>): G
  // eslint-disable-next-line max-len
  pipe<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>, fn5: Unary<D, E>, fn6: Unary<E, F>, fn7: Unary<F, G>, fn8: Unary<G, H>): H
  // eslint-disable-next-line max-len
  pipe<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any, I = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>, fn5: Unary<D, E>, fn6: Unary<E, F>, fn7: Unary<F, G>, fn8: Unary<G, H>, fn9: Unary<H, I>): I
  // eslint-disable-next-line max-len
  pipe<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any, I = any, J = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>, fn5: Unary<D, E>, fn6: Unary<E, F>, fn7: Unary<F, G>, fn8: Unary<G, H>, fn9: Unary<H, I>, fn10: Unary<I, J>): J
  // eslint-disable-next-line max-len
  pipe<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any, I = any, J = any> (fn1: Unary<this, A>, fn2: Unary<A, B>, fn3: Unary<B, C>, fn4: Unary<C, D>, fn5: Unary<D, E>, fn6: Unary<E, F>, fn7: Unary<F, G>, fn8: Unary<G, H>, fn9: Unary<H, I>, fn10: Unary<I, J>, ...fns: Array<Unary<any, any>>): any
  pipe (...args: any[]): any {
    // @ts-expect-error pass args through
    return pipe(...args)(this)
  }

  compose (): this
  compose<A = any> (fn1: Unary<this, A>): A
  compose<A = any, B = any> (fn2: Unary<A, B>, fn1: Unary<this, A>): B
  compose<A = any, B = any, C = any> (fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): C
  compose<A = any, B = any, C = any, D = any> (fn4: Unary<C, D>, fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): D
  // eslint-disable-next-line max-len
  compose<A = any, B = any, C = any, D = any, E = any> (fn5: Unary<D, E>, fn4: Unary<C, D>, fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): E
  // eslint-disable-next-line max-len
  compose<A = any, B = any, C = any, D = any, E = any, F = any> (fn6: Unary<E, F>, fn5: Unary<D, E>, fn4: Unary<C, D>, fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): F
  // eslint-disable-next-line max-len
  compose<A = any, B = any, C = any, D = any, E = any, F = any, G = any> (fn7: Unary<F, G>, fn6: Unary<E, F>, fn5: Unary<D, E>, fn4: Unary<C, D>, fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): G
  // eslint-disable-next-line max-len
  compose<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any> (fn8: Unary<G, H>, fn7: Unary<F, G>, fn6: Unary<E, F>, fn5: Unary<D, E>, fn4: Unary<C, D>, fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): H
  // eslint-disable-next-line max-len
  compose<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any, I = any> (fn9: Unary<H, I>, fn8: Unary<G, H>, fn7: Unary<F, G>, fn6: Unary<E, F>, fn5: Unary<D, E>, fn4: Unary<C, D>, fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): I
  // eslint-disable-next-line max-len
  compose<A = any, B = any, C = any, D = any, E = any, F = any, G = any, H = any, I = any, J = any> (fn10: Unary<I, J>, fn9: Unary<H, I>, fn8: Unary<G, H>, fn7: Unary<F, G>, fn6: Unary<E, F>, fn5: Unary<D, E>, fn4: Unary<C, D>, fn3: Unary<B, C>, fn2: Unary<A, B>, fn1: Unary<this, A>): J
  compose (...args: any[]): any {
    // @ts-expect-error pass args through
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
  hostAtom?: AtomLike | null
  isExtracted?: boolean
}
export const DEFAULT_SUBSCRIBE_OPTIONS: UndefinedableByKeys<Required<SubscribeOptions>, 'hostAtom'> = {
  hostAtom: undefined,
  isExtracted: false
}
export interface Subscription {
  hostAtom?: AtomLike
  subscribeOptions: SubscribeOptions
  originalConsumer: AnyFunction
  proxyConsumer: (particle: any, atom?: any) => void
  unsubscribe: () => boolean
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
export type InternalTrigger<Accepted = any> = (accepted: Accepted, ...args: any[]) => void
export type Trigger<Accepted = any> = (internalTrigger: InternalTrigger<Accepted>) => TriggerController
