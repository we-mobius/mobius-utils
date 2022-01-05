import { isObject, isEmpty } from '../../internal/base'
import { pipe, compose } from '../../functional'

import { Vain } from '../vain'
import {
  DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS,
  isAtomLike, isDataLike, isMutationLike,
  DEFAULT_SUBSCRIBE_OPTIONS,
  GC_DATA, GC_MUTATION
} from '../atoms'

import { AnyStringRecord } from '../../@types/index'
import type { Particle, Datar, Mutator, MutatorTransformation } from '../particles'
import type {
  AtomType,
  Trigger, AtomTriggerRegisterOptions, TriggerController,
  AtomLike, BaseAtom, Data, Mutation, DataLike, MutationLike,
  DataOptions, MutationOptions, SubscribeOptions,
  ValueConsumer, DatarConsumer, DataConsumer, DataSubscription,
  TransformationConsumer, MutatorConsumer, MutationConsumer, MutationSubscription
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
export const isMediator = <BA extends BaseAtom & AtomLike>(tar: any): tar is BaseMediator<BA> => isObject(tar) && tar.isMediator
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
export abstract class BaseMediator<A extends BaseAtom & AtomLike> extends Vain {
  _atom: A

  constructor (atom: A) {
    super()
    if (new.target === BaseMediator) {
      throw new Error('Mediator class can not be instantiated!')
    }

    this._atom = atom
  }

  /******************************************************************************************************
   *                                    Mediator's propertys and methods
   ******************************************************************************************************/

  /**
   *
   */
  get isMediator (): true { return true }

  abstract get mediatorType (): MediatorType

  /******************************************************************************************************
   *                                    Atom's propertys and methods
   ******************************************************************************************************/

  /**
   *
   */
  get atom (): A { return this._atom }

  get atomType (): AtomType { return this._atom.atomType }

  get particleName (): string { return this._atom.particleName }
  get particle (): Particle { return this._atom.particle }
  get metaName (): string { return this._atom.metaName }
  get meta (): any { return this._atom.meta }

  get options (): AnyStringRecord { return this._atom.options }

  get isAtom (): boolean { return isAtomLike(this._atom) }

  get isData (): boolean { return isDataLike(this._atom) }

  get isMutation (): boolean { return isMutationLike(this._atom) }

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
    if (isDataLike(this._atom)) {
      this._atom = GC_DATA as unknown as A
    } else if (isMutationLike(this._atom)) {
      this._atom = GC_MUTATION as unknown as A
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
export abstract class DataMediator<V = any> extends BaseMediator<DataLike<V>> implements AtomLike {
  setOptions<K extends keyof DataOptions>(key: K, value: Required<DataOptions>[K]): void {
    this._atom.setOptions(key, value)
  }

  get datar (): Datar<V> {
    return this._atom.datar
  }

  get value (): V {
    return this._atom.value
  }

  subscribe (consumer: DatarConsumer<V>): DataSubscription<V>
  subscribe (consumer: DatarConsumer<V>, options: SubscribeOptions & { isExtracted: false }): DataSubscription<V>
  subscribe (consumer: ValueConsumer<V>, options: SubscribeOptions & { isExtracted: true }): DataSubscription<V>
  // NOTE: catch all overload
  subscribe (consumer: DataConsumer<V>, options?: SubscribeOptions): DataSubscription<V>
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

  getSubscriptionByConsumer (consumer: DataConsumer<V>): DataSubscription<V> | undefined {
    return this._atom.getSubscriptionByConsumer(consumer)
  }

  getSubscriptionByHostAtom (hostAtom: AtomLike): DataSubscription<V> | undefined {
    return this._atom.getSubscriptionByHostAtom(hostAtom)
  }

  getSubscription (consumerOrHostAtom: DataConsumer<V> | AtomLike): DataSubscription<V> | undefined {
    return this._atom.getSubscription(consumerOrHostAtom)
  }

  unsubscribe (target: DataConsumer<V> | DataSubscription<V> | AtomLike): boolean {
    return this._atom.unsubscribe(target)
  }

  unsubscribeAll (): boolean {
    return this._atom.unsubscribeAll()
  }

  trigger (datar?: Datar<V>): void {
    return this._atom.trigger(datar)
  }

  triggerValue (value?: Datar<V>['value']): void {
    return this._atom.triggerValue(value)
  }

  observe (mutation: MutationLike<any, V>): MutationSubscription<any, V> {
    return this._atom.observe(mutation)
  }

  unobserve (mutation: MutationLike<any, V>): boolean {
    return this._atom.unobserve(mutation)
  }

  unobserveAll (): boolean {
    return this._atom.unobserveAll()
  }

  beObservedBy (mutation: MutationLike<V, any>): DataSubscription<V> {
    return this._atom.beObservedBy(mutation)
  }

  mutate <P>(
    mutator: MutationLike<P, V> | Mutator<P, V> | MutatorTransformation<P, V> | ((...args: any[]) => V),
    mutation?: MutationLike<P, V>
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
export abstract class MutationMediator<P = any, C = any> extends BaseMediator<MutationLike<P, C>> implements AtomLike {
  setOptions<K extends keyof MutationOptions>(key: K, value: Required<MutationOptions>[K]): void {
    this._atom.setOptions(key, value)
  }

  get mutator (): Mutator<P, C> {
    return this._atom.mutator
  }

  get transformation (): MutatorTransformation<P, C> {
    return this._atom.transformation
  }

  subscribe (consumer: MutatorConsumer<P, C>): MutationSubscription<P, C>
  subscribe (consumer: MutatorConsumer<P, C>, options: SubscribeOptions & { isExtracted: false }): MutationSubscription<P, C>
  subscribe (consumer: TransformationConsumer<P, C>, options: SubscribeOptions & { isExtracted: true }): MutationSubscription<P, C>
  // NOTE: catch all overload
  subscribe (consumer: MutationConsumer<P, C>, options?: SubscribeOptions): MutationSubscription<P, C>
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

  getSubscriptionByConsumer (consumer: MutationConsumer<P, C>): MutationSubscription<P, C> | undefined {
    return this._atom.getSubscriptionByConsumer(consumer)
  }

  getSubscriptionByHostAtom (hostAtom: AtomLike): MutationSubscription<P, C> | undefined {
    return this._atom.getSubscriptionByHostAtom(hostAtom)
  }

  getSubscription (consumerOrHostAtom: MutationConsumer<P, C> | AtomLike): MutationSubscription<P, C> | undefined {
    return this._atom.getSubscription(consumerOrHostAtom)
  }

  unsubscribe (target: MutationConsumer<P, C> | MutationSubscription<P, C> | AtomLike): boolean {
    return this._atom.unsubscribe(target)
  }

  unsubscribeAll (): boolean {
    return this._atom.unsubscribeAll()
  }

  observe (data: DataLike<P>): DataSubscription<P> {
    return this._atom.observe(data)
  }

  unobserve (data: DataLike<P>): boolean {
    return this._atom.unobserve(data)
  }

  unobserveAll (): boolean {
    return this._atom.unobserveAll()
  }

  beObservedBy (data: DataLike<C>): MutationSubscription<P, C> {
    // return this._atom.beObservedBy(...args) as ReturnType<I['beObservedBy']>
    // NOTE: for type support
    return this._atom.beObservedBy(data)
  }

  mutate (datar: DataLike<P> | Datar<P> | P, data?: DataLike<P>): this {
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
