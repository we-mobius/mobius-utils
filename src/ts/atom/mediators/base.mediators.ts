import { isObject, isEmpty } from '../../internal/base'
import { pipe, compose } from '../../functional'

import { Vain } from '../vain'
import {
  isAtom, DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS,
  isData, isMutation,
  DEFAULT_SUBSCRIBE_OPTIONS,
  GC_DATA, GC_MUTATION
} from '../atoms'

import type { Datar, Mutator, MutatorTransformation } from '../particles'
import type {
  Trigger, AtomTriggerRegisterOptions, TriggerController,
  AtomLike, BaseAtom, Data, Mutation, SubscribeOptions,
  ValueConsumer, DataConsumer, DataSubscription,
  TransformationConsumer, MutationConsumer, MutationSubscription
} from '../atoms'

/******************************************************************************************************
 *
 *                                           Mediator Predicatess
 *
 ******************************************************************************************************/

/**
 * @param tar anything
 * @return whether the target is an Mediator instance
 */
export const isMediator = <BA extends BaseAtom>(tar: any): tar is BaseMediator<BA> => isObject(tar) && tar.isMediator
/**
 * @param tar anything
 * @return whether the target is an Data Mediator instance
 */
export const isDataMediator = <V = any>(tar: any): tar is DataMediator<V> => isMediator(tar) && tar.isMediator && tar.isData
/**
 * @param tar anything
 * @return whether the target is an Mutation Mediator instance
 */
export const isMutationMediator = <P = any, C = any>(tar: any): tar is MutationMediator<P, C> =>
  isMediator(tar) && tar.isMediator && !tar.isMutation

/******************************************************************************************************
 *
 *                                           Mediator Classes
 *
 ******************************************************************************************************/

/**
 *
 */
type Unary<I = any, O = any> = (input: I) => O
/**
 *
 */
interface _MediatorTypeSymbol /** private */ { _type: 'MediatorType' }
export type MediatorTypeMaker<T extends string> = T & _MediatorTypeSymbol
export type MediatorType = string & _MediatorTypeSymbol

/**
 *
 */
export abstract class BaseMediator<BA extends BaseAtom> extends Vain {
  _atom: BA

  constructor (atom: BA) {
    super()
    if (new.target === BaseMediator) {
      throw new Error('Mediator class can not be instantiated!')
    }

    this._atom = atom
  }

  /******************************************************************************************************
   *                                    Mediator's propertys and methods
   ******************************************************************************************************/

  get isMediator (): true { return true }

  abstract get mediatorType (): MediatorType

  /******************************************************************************************************
   *                                    Atom's propertys and methods
   ******************************************************************************************************/

  get atom (): BA { return this._atom }

  get atomType (): BA['atomType'] { return this._atom.atomType }

  get particleName (): BA['particleName'] { return this._atom.particleName }
  get particle (): BA['particle'] { return this._atom.particle }
  get metaName (): BA['metaName'] { return this._atom.metaName }
  get meta (): BA['meta'] { return this._atom.meta }

  get options (): BA['options'] { return this._atom.options }
  get consumers (): BA['consumers'] { return this._atom.consumers }

  get isAtom (): boolean { return isAtom(this._atom) }

  get isData (): boolean { return isData(this._atom) }

  get isMutation (): boolean { return isMutation(this._atom) }

  get isEmpty (): boolean { return isEmpty(this._atom) }

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
    // ! do not use:
    // ! return this._atom.pipe(...args)
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
    // ! do not use:
    // ! return this._atom.compose(...args)
    // @ts-expect-error pass args through
    return compose(...args)(this)
  }

  release (): void {
    if (isData(this._atom)) {
      this._atom = GC_DATA as unknown as BA
    } else if (isMutation(this._atom)) {
      this._atom = GC_MUTATION as unknown as BA
    } else {
      throw (new TypeError('Invalid atom type!'))
    }
  }
}

/******************************************************************************************************
 *
 *                                               DataMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export abstract class DataMediator<V = any> extends BaseMediator<Data<V>> implements AtomLike {
  get datar (): Datar<V> {
    return this._atom.datar
  }

  get value (): V {
    return this._atom.value
  }

  subscribe (
    consumer: DataConsumer<V>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): DataSubscription<V> {
    return this._atom.subscribe(consumer, options)
  }

  subscribeValue (
    consumer: ValueConsumer<V>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): DataSubscription<V> {
    return this._atom.subscribeValue(consumer, options)
  }

  trigger (datar?: Datar<V>): void {
    return this._atom.trigger(datar)
  }

  triggerValue (value?: Datar<V>['value']): void {
    return this._atom.triggerValue(value)
  }

  observe (mutation: Mutation<any, V>): ReturnType<(typeof mutation)['subscribe']> {
    return this._atom.observe(mutation)
  }

  beObservedBy (mutation: Mutation<V, any>): DataSubscription<V> {
    return this._atom.beObservedBy(mutation)
  }

  mutate <P>(
    mutator: Mutator<P, V> | Mutation<P, V> | MutatorTransformation<P, V> | ((...args: any[]) => V),
    mutation?: Mutation<P, V>
  ): this {
    this._atom.mutate(mutator, mutation)
    return this
  }

  registerTrigger (
    trigger: Trigger<V | Datar<V>>, options: AtomTriggerRegisterOptions = DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
  ): TriggerController {
    return this._atom.registerTrigger(trigger, options)
  }

  release (): void {
    this._atom = GC_DATA as Data<any>
  }
}

/******************************************************************************************************
 *
 *                                            MutationMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export abstract class MutationMediator<P = any, C = any> extends BaseMediator<Mutation<P, C>> implements AtomLike {
  get mutator (): Mutator<P, C> {
    return this._atom.mutator
  }

  get transformation (): MutatorTransformation<P, C> {
    return this._atom.transformation
  }

  subscribe (
    consumer: MutationConsumer<P, C>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): MutationSubscription<P, C> {
    return this._atom.subscribe(consumer, options)
  }

  subscribeTransformation (
    consumer: TransformationConsumer<P, C>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): MutationSubscription<P, C> {
    return this._atom.subscribeTransformation(consumer, options)
  }

  trigger (mutator?: Mutator<P, C>): void {
    return this._atom.trigger(mutator)
  }

  triggerTransformation (transformation?: Mutator<P, C>['transformation']): void {
    return this._atom.triggerTransformation(transformation)
  }

  observe (data: Data<P>): ReturnType<(typeof data)['subscribe']> {
    return this._atom.observe(data)
  }

  beObservedBy (data: Data<C>): MutationSubscription<P, C> {
    // return this._atom.beObservedBy(...args) as ReturnType<I['beObservedBy']>
    // NOTE: for type support
    return this._atom.beObservedBy(data)
  }

  mutate (datar: Data<P> | Datar<P> | P, data?: Data<P>): this {
    this._atom.mutate(datar, data)
    return this
  }

  registerTrigger (
    trigger: Trigger<Mutator<P, C> | ((...args: any[]) => C) | C>,
    options: AtomTriggerRegisterOptions = DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
  ): TriggerController {
    return this._atom.registerTrigger(trigger, options)
  }

  release (): void {
    this._atom = GC_MUTATION as Mutation<any, any>
  }
}
