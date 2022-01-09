import { isNil, isFunction, isObject, isPlainObject, isEmpty, isUndefined } from '../../internal/base'
import { syncScheduler, asyncScheduler } from '../../external/scheduler'

import { isPausor, isTerminator } from '../metas'
import { Mutator, Datar, isDatar, isMutator, DEFAULT_DATAR_OPTIONS } from '../particles'
import {
  AtomType, BaseAtom, isAtomLike, isMutationLike,
  DEFAULT_BASEATOM_OPTIONS,
  DEFAULT_SUBSCRIBE_OPTIONS, DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
} from './base.atom'

import type { Vacuo } from '../metas'
import type { DatarOptions, MutatorTransformation } from '../particles'
import type {
  AtomLike, DataLike, MutationLike,
  BaseAtomOptions,
  SubscribeOptions, Subscription,
  AtomTriggerRegisterOptions, TriggerController, InternalTrigger, Trigger
} from './base.atom'
import type { MutationSubscription } from './mutation.atom'

/******************************************************************************************************
 *
 *                                           Data Predicatess
 *
 ******************************************************************************************************/

/**
 * @param tar anything
 * @return { boolean } whether the target is a Data instance
 */
export const isData = <V = any>(tar: any): tar is Data<V> => isObject(tar) && tar.isData

/******************************************************************************************************
 *
 *                                           Data Classes
 *
 ******************************************************************************************************/

/**
 *
 */
export interface DataOptions extends BaseAtomOptions, DatarOptions {}
export const DEFAULT_DATA_OPTIONS: Required<DataOptions> = {
  ...DEFAULT_BASEATOM_OPTIONS,
  ...DEFAULT_DATAR_OPTIONS
}
export type DatarConsumer<V = any> = (datar: Datar<V>, data: DataLike<V>) => void
export type ValueConsumer<V = any> = (value: V, data: DataLike<V>) => void
export type DataConsumer<V = any> = DatarConsumer<V> | ValueConsumer<V>

export interface DataSubscription<V = any> extends Subscription {
  proxyConsumer: DatarConsumer<V>
}

export type DataTriggerAccepted<V = any> = V | Datar<V>
export type DataTrigger<V = any> = Trigger<DataTriggerAccepted<V>>

/**
 *
 */
export class Data<V = any> extends BaseAtom implements AtomLike {
  private readonly _options: Required<DataOptions>
  private _datar: Datar<V>
  // NOTE: Q: why there is a consumers property in the presence subscriptions? A: for some index performance i guess.
  private readonly _consumers: Set<DatarConsumer<V>>
  // TODO: use subscriptions to support consumer level of scheduler or other else.
  private readonly _subscriptions: Set<DataSubscription<V>>
  private readonly _observations: Map<MutationLike<any, V>, MutationSubscription<any, V>>

  constructor (datar: Datar<V>, options: DataOptions = DEFAULT_DATA_OPTIONS) {
    super()
    if (!isDatar(datar)) {
      throw (new TypeError('"datar" is expected to be type of "Datar".'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }
    this._options = { ...DEFAULT_DATA_OPTIONS, ...options }

    this._datar = datar
    this._consumers = new Set()
    this._subscriptions = new Set()
    this._observations = new Map()
  }

  get type (): AtomType { return AtomType.Data }
  get atomType (): AtomType { return AtomType.Data }

  get particleName (): string { return 'datar' }
  get particle (): Datar<V> { return this._datar }
  get metaName (): string { return 'value' }
  get meta (): Datar<V>['value'] { return this._datar.value }

  get options (): Required<DataOptions> { return this._options }

  /**
   * Set Data's options by key.
   */
  setOptions<K extends keyof DataOptions>(key: K, value: Required<DataOptions>[K]): void {
    this._options[key] = value
  }

  /**
   * @return { true } true
   */
  get isData (): true { return true }

  get isEmpty (): boolean { return this._datar.isEmpty }

  /**
   * @param value can be a Datar or any other value
   */
  static of <V>(value: Datar<V> | V, options: DataOptions = DEFAULT_DATA_OPTIONS): Data<V> {
    // return new Data(isDatar(value) ? value : Datar.of(value, undefined, options), options)
    if (isDatar<V>(value)) {
      return new Data(value, options)
    } else {
      return new Data(Datar.of(value, undefined, options), options)
    }
  }

  /**
   * Same as `Data.of(Datar.of(VACUO, CHAOS, options))`
   */
  static empty <V = Vacuo>(options: DataOptions = DEFAULT_DATA_OPTIONS): Data<V> {
    return new Data(Datar.empty(options) as Datar<any>, options)
  }

  /**
   * Datar of Data.
   */
  get datar (): Datar<V> { return this._datar }
  /**
   * Value of Datar of Data, same as Data.datar.value.
   */
  get value (): Datar<V>['value'] { return this._datar.value }

  /**
   * Stream value of Data.
   *
   * @param consumer The consumer will be invoked by "trigger" method when there is a adequate value.
   * @param options
   * @param [options.isExtracted = false] Whether to extract the value from the datar before it be passed to consumer.
   */
  subscribe (consumer: DatarConsumer<V>): DataSubscription<V>
  subscribe (consumer: DatarConsumer<V>, options: SubscribeOptions & { isExtracted: false }): DataSubscription<V>
  subscribe (consumer: ValueConsumer<V>, options: SubscribeOptions & { isExtracted: true }): DataSubscription<V>
  // NOTE: catch all overload
  subscribe (consumer: DataConsumer<V>, options?: SubscribeOptions): DataSubscription<V>
  subscribe (consumer: DataConsumer<V>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS): DataSubscription<V> {
    const preparedOptions = { ...DEFAULT_SUBSCRIBE_OPTIONS, ...options }
    const { isExtracted } = preparedOptions
    let proxyConsumer: DatarConsumer<V>

    if (isExtracted) {
      proxyConsumer = (datar, data) => {
        return (consumer as ValueConsumer<V>)(datar.value, data)
      }
    } else {
      proxyConsumer = consumer as DatarConsumer<V>
    }

    this._consumers.add(proxyConsumer)

    const subscription = {
      subscribeOptions: preparedOptions,
      originalConsumer: consumer,
      proxyConsumer: proxyConsumer,
      unsubscribe: () => {
        const unsubscribed = this._consumers.delete(proxyConsumer) && this._subscriptions.delete(subscription)
        return unsubscribed
      }
    }
    this._subscriptions.add(subscription)

    return subscription
  }

  /**
   * Same as `.subscribe(consumer, { ...options, isExtracted: true })`.
   */
  subscribeValue (
    consumer: ValueConsumer<V>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): DataSubscription<V> {
    // `options` will be complemented in `subscribe` method.
    return this.subscribe(consumer, { ...DEFAULT_SUBSCRIBE_OPTIONS, ...options, isExtracted: true })
  }

  /**
   * Given a consumer, find and return the subscription.
   */
  getSubscriptionByConsumer (consumer: DataConsumer<V>): DataSubscription<V> | undefined {
    let subscriptionFound: DataSubscription<V> | undefined
    this._subscriptions.forEach(subscription => {
      if (subscription.originalConsumer === consumer || subscription.proxyConsumer === consumer) {
        subscriptionFound = subscription
      }
    })
    return subscriptionFound
  }

  /**
   * Given a atom, find and return the subscription.
   */
  getSubscriptionByHostAtom (hostAtom: AtomLike): DataSubscription<V> | undefined {
    let subscriptionFound: DataSubscription<V> | undefined
    this._subscriptions.forEach(subscription => {
      if (subscription.hostAtom === hostAtom) {
        subscriptionFound = subscription
      }
    })
    return subscriptionFound
  }

  /**
   * Given a consumer or atom, find and return the subscription.
   */
  getSubscription (consumerOrHostAtom: DataConsumer<V> | AtomLike): DataSubscription<V> | undefined {
    if (isFunction(consumerOrHostAtom)) {
      return this.getSubscriptionByConsumer(consumerOrHostAtom)
    } else if (isAtomLike(consumerOrHostAtom)) {
      return this.getSubscriptionByHostAtom(consumerOrHostAtom)
    } else {
      throw (new TypeError('Unexpected type of "consumerOrHostAtom".'))
    }
  }

  /**
   * Given a consumer or subscription or atom, unsubscribe it.
   */
  unsubscribe (target: DataConsumer<V> | DataSubscription<V> | AtomLike): boolean {
    if (isFunction(target) || isAtomLike(target)) {
      let unsubscribed = false
      const subscription = this.getSubscription(target)
      if (!isUndefined(subscription)) {
        unsubscribed = subscription.unsubscribe()
      }
      return unsubscribed
    } else if (isFunction(target.unsubscribe)) {
      const unsubscribed = target.unsubscribe()
      return unsubscribed
    } else {
      throw (new TypeError('Unexpected type of "target".'))
    }
  }

  /**
   * Unsubscribe all subscriptions.
   */
  unsubscribeAll (): boolean {
    const unsubscribed: boolean[] = []
    this._subscriptions.forEach((subscription) => {
      unsubscribed.push(subscription.unsubscribe())
    })
    return unsubscribed.every((unsubscribed) => unsubscribed)
  }

  /**
   * `Empty datar` will not be triggered.
   *
   * @param datar datar
   */
  trigger (datar?: Datar<V>): void {
    const _datar = datar ?? this._datar

    if (!isDatar(_datar)) {
      throw (new TypeError('"Data" must be triggered with a "Datar".'))
    }

    if (!isEmpty(_datar)) {
      const { isAsync } = this._options
      const batchScheduler = isAsync ? asyncScheduler : syncScheduler
      batchScheduler(() => {
        this._consumers.forEach(consumer => {
          if (isAsync) {
            asyncScheduler(() => consumer(_datar, this))
          } else {
            // syncScheduler(() => consumer(_datar, this))
            consumer(_datar, this)
          }
        })
      })
    }
  }

  /**
   * Internally call `trigger` method which will not trigger `empty datar`,
   *   so the `Vacuo` value will not be triggered by `triggerValue` method.
   *
   * @param value value
   */
  triggerValue (value?: Datar<V>['value']): void {
    if (isNil(value)) {
      return this.trigger()
    } else {
      return this.trigger(Datar.of(value))
    }
  }

  /**
   * Change the value of Data in a stream manner.
   *
   * Given "mutation" will be **upstream** of current Data, which is different from "beObservedBy" method.
   *
   * @param mutation (other data ->) mutation -> current data
   */
  observe (mutation: MutationLike<any, V>): MutationSubscription<any, V> {
    if (!isMutationLike(mutation)) {
      throw (new TypeError('"Data" can only observe a "MutationLike".'))
    }
    const subscription = mutation.subscribe((_mutator: (typeof mutation)['mutator'], _mutation: typeof mutation) => {
      this.mutate(_mutator, _mutation)
    }, {
      hostAtom: this
    })
    this._observations.set(mutation, subscription)

    return subscription
  }

  unobserve (mutation: MutationLike<any, V>): boolean {
    const observation = this._observations.get(mutation)
    let unobserved = false
    if (!isUndefined(observation)) {
      unobserved = observation.unsubscribe()
    }
    return unobserved
  }

  unobserveAll (): boolean {
    const unobserved: boolean[] = []
    this._observations.forEach((observation) => {
      unobserved.push(observation.unsubscribe())
    })
    return unobserved.every((unobserved) => unobserved)
  }

  /**
   * Change the value of Data in a stream manner.
   *
   * Given "mutation" will be **downstream** of current Data, which is different from "observe" method.
   *
   * @param mutation current data -> mutation (-> other data)
   */
  beObservedBy (mutation: MutationLike<V, any>): DataSubscription<V> {
    const subscription = mutation.observe(this)
    return subscription
    // return this.subscribe((datar, data) => {
    //   mutation.mutate(datar, data)
    // })
  }

  /**
   * Change the value of Data in a static manner.
   *
   * take mutator-like param(convert to mutator)
   *   -> run mutator with current datar & contexts
   *   -> wrap and save result of mutator.run as new datar
   *   -> trigger consumers with new datar & contexts
   *
   * @param mutator Used to produce new value with current datar.
   * @param mutation Provide to mutator's transformation (function) as execute contexts.
   * @return { Data } Data(this)
   */
  mutate <P>(
    mutator: MutationLike<P, V> | Mutator<P, V> | MutatorTransformation<P, V> | ((...args: any[]) => V),
    mutation?: MutationLike<P, V>
  ): this {
    let _mutator: Mutator<P, V>
    if (isMutator<P, V>(mutator)) {
      _mutator = mutator
    } else if (isMutationLike<P, V>(mutator)) {
      _mutator = mutator.mutator
    } else if (isFunction(mutator)) {
      _mutator = Mutator.of(mutator)
    } else {
      throw (new TypeError('"mutator" is expected to be type of "Mutator" | "MutationLike" | "Function".'))
    }

    let _mutation: MutationLike<P, V> | undefined
    if (isNil(mutation)) {
      // If `mutation` is not provided, but `mutator` is Mutation, `_mutation` will be set to `mutator`.
      // If `mutation` is not provided, `_mutation` will be `undefined`.
      _mutation = isMutationLike(_mutator) ? _mutator : _mutation
    } else {
      // If `mutation` is provided, `mutation` will be checked then set `_mutation` to it.
      if (isMutationLike(mutation)) {
        _mutation = mutation
      } else {
        throw (new TypeError('"mutation" is expected to be type of "Mutation".'))
      }
    }

    // Internally run the mutator's transformation which will return a new value
    const newDatar = Datar.of(_mutator.run(this._datar, _mutation), _mutator, this._datar.options)

    if (isTerminator(newDatar.value)) {
      // If the result of transformation is TERMINATOR,
      //   throw away the result,
      //   do not update the datar of current Data,
      //   and do not trigger consumers(subscribers).
    } else if (isPausor(newDatar.value)) {
      // If the result of transformation is PAUSOR,
      //   update the datar of current Data with new Datar,
      //   but do not trigger consumers(subscribers).
      this._datar = newDatar
    } else {
      // Else,
      //   update the datar of current Data with new Datar,
      //   and trigger consumers(subscribers).
      this._datar = newDatar
      this.trigger()
    }

    return this
  }

  /**
   * @param trigger Takes an internalTrigger(Function) as first parameter,
   *                             invoke internalTrigger with any value will lead to
   *                             Data's trigger method be triggerd with given value.
   * @param options
   * @param [options.forceWrap = false] If true, the emitted value of trigger will always be wrapped in Datar.
   * @return { TriggerController } TriggerController
   */
  registerTrigger (
    trigger: DataTrigger<V>, options: AtomTriggerRegisterOptions = DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
  ): TriggerController {
    if (isNil(trigger)) {
      throw (new TypeError('"trigger" is required.'))
    }
    if (!isFunction(trigger)) {
      throw (new TypeError('"trigger" is expected to be type of "Function".'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    const { forceWrap } = { ...DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS, ...options }

    const internalTrigger: InternalTrigger<DataTriggerAccepted<V>> = (accepted, ...args) => {
      if (forceWrap) {
        return this.trigger(...[Datar.of(accepted), ...args])
      }

      if (!isDatar<V>(accepted)) {
        return this.trigger(...[Datar.of(accepted), ...args])
      } else {
        return this.trigger(...[accepted, ...args])
      }
    }

    const controller = trigger(internalTrigger)
    return controller
  }
}

export const GC_DATA = Data.of(Symbol('GC_DATA'))
