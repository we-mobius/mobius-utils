import { isNil, isFunction, isObject, isPlainObject, isEmpty } from '../../internal/base'
import { isPausor, isTerminator } from '../metas'
import { Mutator, Datar, isDatar, isMutator, DEFAULT_DATAR_OPTIONS } from '../particles'
import {
  AtomType, BaseAtom,
  DEFAULT_BASEATOM_OPTIONS,
  DEFAULT_SUBSCRIBE_OPTIONS, DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
} from './base.atom'
import { isMutation } from './mutation.atom'

import type { Vacuo } from '../metas'
import type { DatarOptions, MutatorTransformation } from '../particles'
import type {
  AtomLike,
  BaseAtomOptions,
  SubscribeOptions, Subscription,
  AtomTriggerRegisterOptions, TriggerController, InternalTrigger, Trigger
} from './base.atom'
import type { Mutation } from './mutation.atom'

/******************************************************************************************************
 *
 *                                           Data Predicatess
 *
 ******************************************************************************************************/

/**
 * @param { any } tar anything
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
export type DatarConsumer<V> = (datar: Datar<V>, data: Data<V>) => void
export type ValueConsumer<V> = (value: V, data: Data<V>) => void
export type DataConsumer<V> = DatarConsumer<V> | ValueConsumer<V>

export interface DataSubscription<V> extends Subscription {
  proxyConsumer: DatarConsumer<V>
}

export class Data<V> extends BaseAtom implements AtomLike {
  private readonly _options: Required<DataOptions>
  private _datar: Datar<V>
  private readonly _consumers: Set<DatarConsumer<V>>

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
  }

  get type (): AtomType { return AtomType.Data }
  get atomType (): AtomType { return AtomType.Data }

  get particleName (): string { return 'datar' }
  get particle (): Datar<V> { return this._datar }
  get metaName (): string { return 'value' }
  get meta (): Datar<V>['value'] { return this._datar.value }

  get options (): Required<DataOptions> { return this._options }
  get consumers (): Set<DatarConsumer<V>> { return this._consumers }

  /**
   * @return { true } true
   */
  get isData (): true { return true }

  get isEmpty (): boolean { return this._datar.isEmpty }

  /**
   * @param { Datar<any> | any } value can be a Datar or any other value
   */
  static of <V>(value: Datar<V> | V, options: DataOptions = {}): Data<V> {
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
   * @param { DataConsumer<V> } consumer The consumer will be invoked by "trigger" method when there is a adequate value.
   * @param { SubscribeOptions } options
   * @param { boolean } [options.isExtracted = false] Whether to extract the value from the datar before it be passed to consumer.
   * @return { DataSubscription<V> } DataSubscription<V>
   */
  // TODO: how can i narrow consumer's type by `options.isExtracted`?
  // subscribe (consumer: DatarConsumer<V>, options?: { isExtracted: false }): DataSubscription<V>
  // subscribe (consumer: ValueConsumer<V>, options?: { isExtracted: true }): DataSubscription<V>
  subscribe (consumer: DataConsumer<V>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS): DataSubscription<V> {
    const { isExtracted } = { ...DEFAULT_SUBSCRIBE_OPTIONS, ...options }
    let proxyConsumer: DatarConsumer<V>

    if (isExtracted) {
      proxyConsumer = (datar, data) => {
        return (consumer as ValueConsumer<V>)(datar.value, data)
      }
    } else {
      proxyConsumer = consumer as DatarConsumer<V>
    }

    this._consumers.add(proxyConsumer)
    return {
      proxyConsumer: proxyConsumer,
      unsubscribe: () => {
        return this._consumers.delete(proxyConsumer)
      }
    }
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
   * `Empty datar` will not be triggered.
   *
   * @param { Datar<V> | undefined } datar datar
   * @return { void } void
   */
  trigger (datar?: Datar<V>): void {
    const _datar = datar ?? this._datar

    if (!isDatar(_datar)) {
      throw (new TypeError('"Data" must be triggered with a "Datar".'))
    }

    if (!isEmpty(_datar)) {
      this._consumers.forEach(consumer => {
        consumer(_datar, this)
      })
    }
  }

  /**
   * Internally call `trigger` method which will not trigger `empty datar`,
   *   so the `Vacuo` value will not be triggered by `triggerValue` method.
   *
   * @param { Datar<V>['value'] | undefined } value value
   * @return { void } void
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
   * @param { Mutation<any, V> } mutation (other data ->) mutation -> current data
   */
  observe (mutation: Mutation<any, V>): ReturnType<(typeof mutation)['subscribe']> {
    if (!isMutation(mutation)) {
      throw (new TypeError('"Data" can only observe a "Mutation"!'))
    }
    return mutation.subscribe((_mutator: (typeof mutation)['mutator'], _mutation: typeof mutation) => {
      this.mutate(_mutator, _mutation)
    })
  }

  /**
   * Change the value of Data in a stream manner.
   *
   * Given "mutation" will be **downstream** of current Data, which is different from "observe" method.
   *
   * @param { Mutation } mutation current data -> mutation (-> other data)
   */
  beObservedBy (mutation: Mutation<V, any>): DataSubscription<V> {
    return mutation.observe(this)
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
   * @param { Mutator | Mutation | function } mutator Used to produce new value with current datar.
   * @param { Mutation } mutation Provide to mutator's transformation (function) as execute contexts.
   * @return { Data } Data(this)
   */
  mutate <P>(
    mutator: Mutator<P, V> | Mutation<P, V> | MutatorTransformation<P, V> | ((...args: any[]) => V),
    mutation?: Mutation<P, V>
  ): this {
    let _mutator: Mutator<P, V>
    if (isMutator<P, V>(mutator)) {
      _mutator = mutator
    } else if (isMutation<P, V>(mutator)) {
      _mutator = mutator.mutator
    } else if (isFunction(mutator)) {
      _mutator = Mutator.of(mutator)
    } else {
      throw (new TypeError('"mutator" is expected to be type of "Mutator" | "Mutation" | "Function".'))
    }

    let _mutation: Mutation<P, V> | undefined
    if (isNil(mutation)) {
      // If `mutation` is not provided, but `mutator` is Mutation, `_mutation` will be set to `mutator`.
      // If `mutation` is not provided, `_mutation` will be `undefined`.
      _mutation = isMutation(_mutator) ? _mutator : _mutation
    } else {
      // If `mutation` is provided, `mutation` will be checked then set `_mutation` to it.
      if (isMutation(mutation)) {
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
   * @param { function } trigger Takes an internalTrigger(Function) as first parameter,
   *                             invoke internalTrigger with any value will lead to
   *                             Data's trigger method be triggerd with given value.
   * @param { AtomTriggerRegisterOptions } options
   * @param { boolean } [options.forceWrap = false] If true, the emitted value of trigger will always be wrapped in Datar.
   * @return { TriggerController } TriggerController
   */
  registerTrigger (
    trigger: Trigger<V | Datar<V>>, options: AtomTriggerRegisterOptions = DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
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

    const internalTrigger: InternalTrigger<V | Datar<V>> = (accepted, ...args) => {
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
