import { isNil, isFunction, isObject, isPlainObject, isEmpty } from '../../internal/base'
import { syncScheduler, asyncScheduler } from '../../external/scheduler'

import { isPausor, isTerminator } from '../metas'
import {
  Mutator, Datar, isDatar, isMutator,
  DEFAULT_TRANSFORMATION_LIFT_OPTIONS, DEFAULT_MUTATOR_OPTIONS
} from '../particles'
import {
  AtomType, BaseAtom,
  DEFAULT_BASEATOM_OPTIONS,
  DEFAULT_SUBSCRIBE_OPTIONS, DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
} from './base.atom'
import { isData } from './data.atom'

import type { Vacuo } from '../metas'
import type {
  MutatorOptions, TransformationLiftOptions,
  MutatorTransformation, LiftBothTransformation, LiftLeftTransformation, LiftRightTransformation,
  MutatorOriginTransformationUnion
} from '../particles'
import type {
  AtomLike,
  BaseAtomOptions,
  SubscribeOptions, Subscription,
  AtomTriggerRegisterOptions, TriggerController, InternalTrigger, Trigger
} from './base.atom'
import type { Data } from './data.atom'

/******************************************************************************************************
 *
 *                                           Mutation Predicatess
 *
 ******************************************************************************************************/

/**
 * @param tar anything
 * @return { boolean } whether the target is a Mutation instance
 */
export const isMutation = <P = any, C = any>(tar: any): tar is Mutation<P, C> => isObject(tar) && tar.isMutation

/******************************************************************************************************
 *
 *                                           Mutation Classes
 *
 ******************************************************************************************************/

/**
 *
 */
export interface MutationOptions<P = any, C = any, Contexts extends any[] = any[]> extends BaseAtomOptions {
  lift?: TransformationLiftOptions
  mutator?: MutatorOptions
  isLifted?: boolean
  originTransformation?: null | MutatorOriginTransformationUnion<P, C, Contexts>
}
export const DEFAULT_MUTATION_OPTIONS: Required<MutationOptions<any, any, any[]>> = {
  ...DEFAULT_BASEATOM_OPTIONS,
  lift: DEFAULT_TRANSFORMATION_LIFT_OPTIONS,
  mutator: DEFAULT_MUTATOR_OPTIONS,
  isLifted: false,
  originTransformation: null
}

export type MutatorConsumer<P = any, C = any> =
  (mutator: Mutator<P, C>, mutation: Mutation<P, C>) => void
export type TransformationConsumer<P = any, C = any> =
  (transformation: (cur: Datar<C>, ...args: any[]) => C, mutation: Mutation<P, C>) => void
export type MutationConsumer<P = any, C = any> =
  MutatorConsumer<P, C> | TransformationConsumer<P, C>

export interface MutationSubscription<P = any, C = any> extends Subscription {
  proxyConsumer: MutatorConsumer<P, C>
}

/**
 *
 */
export class Mutation<P = any, C = any> extends BaseAtom implements AtomLike {
  private readonly _options: Required<MutationOptions<P, C>>
  private _mutator: Mutator<P, C>
  private readonly _consumers: Set<MutatorConsumer<P, C>>

  constructor (mutator: Mutator<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS) {
    super()
    if (!isMutator(mutator)) {
      throw (new TypeError('"mutator" is expected to be type of "Mutator".'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }
    this._options = { ...DEFAULT_MUTATION_OPTIONS, ...options }

    this._mutator = mutator
    this._consumers = new Set()
  }

  get type (): AtomType { return AtomType.Mutation }
  get atomType (): AtomType { return AtomType.Mutation }

  get particleName (): string { return 'mutator' }
  get particle (): Mutator<P, C> { return this._mutator }
  get metaName (): string { return 'transformation' }
  get meta (): Mutator<P, C>['transformation'] { return this._mutator.transformation }

  get options (): Required<MutationOptions<P, C>> { return this._options }
  get consumers (): Set<MutatorConsumer<P, C>> { return this._consumers }

  /**
   * Set Mutation's options by key.
   */
  setOptions<K extends keyof MutationOptions>(key: K, value: Required<MutationOptions>[K]): void {
    this._options[key] = value
  }

  /**
   * @return { true } true
   */
  get isMutation (): true { return true }

  get isEmpty (): boolean { return this._mutator.isEmpty }

  /**
   * Create a new Mutation instance with Mutator or Function.
   *
   * @param transformation can be a Mutator or a function
   * @param [options.mutator] Mutator options, when use a Function to create,
   *                                             `Mutator.of` will be used as Mutator factory,
   *                                             and `options.mutator` will be used as Mutator options.
   */
  static of <P, C>(
    transformation: MutatorTransformation<P, C> | Mutator<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS
  ): Mutation<P, C> {
    if (isMutator<P, C>(transformation)) {
      return new Mutation(transformation, options)
    } else if (isFunction(transformation)) {
      return new Mutation(Mutator.of(transformation, undefined, options.mutator), options)
    } else {
      throw (new TypeError('"transformation" is expected to be type of "Mutator" or "Function".'))
    }
  }

  /**
   * Same as `Mutation.of(Mutator.of(VACUO, CHAOS, options.mutator), options)`.
   */
  static empty <C = Vacuo>(options: MutationOptions<any, any> = DEFAULT_MUTATION_OPTIONS): Mutation<any, C> {
    const _options = { ...DEFAULT_MUTATION_OPTIONS, ...options }
    return new Mutation(Mutator.empty(_options.mutator), _options)
  }

  static ofLift <P, C>(
    transformation: MutatorOriginTransformationUnion<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS
  ): Mutation<P, C> {
    return new Mutation(
      Mutator.ofLift(transformation, options.lift),
      { ...options, isLifted: true, originTransformation: transformation }
    )
  }

  static ofLiftBoth <P, C>(
    transformation: LiftBothTransformation<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS
  ): Mutation<P, C> {
    return new Mutation(
      Mutator.ofLiftBoth(transformation),
      { ...options, isLifted: true, originTransformation: transformation }
    )
  }

  static ofLiftLeft <P, C>(
    transformation: LiftLeftTransformation<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS
  ): Mutation<P, C> {
    return new Mutation(
      Mutator.ofLiftLeft(transformation),
      { ...options, isLifted: true, originTransformation: transformation }
    )
  }

  static ofLiftRight <P, C>(
    transformation: LiftRightTransformation<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS
  ): Mutation<P, C> {
    return new Mutation(
      Mutator.ofLiftRight(transformation),
      { ...options, isLifted: true, originTransformation: transformation }
    )
  }

  /**
   * Mutator of Mutation.
   */
  get mutator (): Mutator<P, C> { return this._mutator }

  /**
   * Transformation of Mutator of Mutation.
   *
   * If the transformation is lifted, the origin transformation will
   *   be returned as first choice instead of lifted transformation.
   */
  get transformation (): Mutator<P, C>['transformation'] {
    return this._mutator.transformation
  }

  get originTransformation (): MutatorOriginTransformationUnion<P, C> | null {
    return this._options.originTransformation
  }

  /**
   * Stream value of Mutation.
   *
   * @param consumer The consumer will be invoked by "trigger" method when there is a adequate value.
   * @param options
   * @param [options.isExtracted = false] Whether to extract the value from the datar before it be passed to consumer.
   */
  subscribe (consumer: MutatorConsumer<P, C>): MutationSubscription<P, C>
  subscribe (consumer: MutatorConsumer<P, C>, options: SubscribeOptions & { isExtracted: false }): MutationSubscription<P, C>
  subscribe (consumer: TransformationConsumer<P, C>, options: SubscribeOptions & { isExtracted: true }): MutationSubscription<P, C>
  // NOTE: catch all overload
  subscribe (consumer: MutationConsumer<P, C>, options?: SubscribeOptions): MutationSubscription<P, C>
  subscribe (consumer: MutationConsumer<P, C>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS): MutationSubscription<P, C> {
    const { isExtracted } = { ...DEFAULT_SUBSCRIBE_OPTIONS, ...options }
    let proxyConsumer: MutatorConsumer<P, C>
    if (isExtracted) {
      /**
       * Mutation's transformation may not be a curried function, eg. created by Mutation.of(operation, options).
       * So the body of `fakeTransformation` can not't be `consumer(mutator.transformation(mutator.datar))`.
       */
      proxyConsumer = (mutator, mutation) => {
        // TODO: consider what is `transformation`,
        // the `transformation` fn or the `transformation` fn bind `Mutation.datar` as 1st argument.
        const fakeTransformation = (cur: Datar<C>, ...args: any[]): C => {
          return mutator.transformation(mutator.datar, cur, ...args)
        }
        return (consumer as TransformationConsumer<P, C>)(fakeTransformation, mutation)
      }
    } else {
      proxyConsumer = consumer as MutatorConsumer<P, C>
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
   *
   * Get a transformation of mutator of mutation, which bind latest
   *   datar of mutation as first argument.
   */
  subscribeTransformation (
    consumer: TransformationConsumer<P, C>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): MutationSubscription<P, C> {
    return this.subscribe(consumer, { ...DEFAULT_SUBSCRIBE_OPTIONS, ...options, isExtracted: true })
  }

  /**
   * `Empty mutator` will not be triggered.
   *
   * @param mutator mutator
   * @return { void } void
   */
  trigger (mutator?: Mutator<P, C>): void {
    const _mutator = mutator ?? this._mutator

    if (!isMutator(_mutator)) {
      throw (new TypeError('"Mutation" must be triggered with a "Mutator".'))
    }

    if (!isEmpty(_mutator)) {
      const { isAsync } = this._options
      this._consumers.forEach(consumer => {
        if (isAsync) {
          asyncScheduler(() => consumer(_mutator, this))
        } else {
          // syncScheduler(() => consumer(_mutator, this))
          consumer(_mutator, this)
        }
      })
    }
  }

  /**
   * Internally call `trigger` method which will not trigger `empty mutator`,
   *   so the `Vacuo` value will not be triggered by `triggerTransformation` method.
   *
   * @param transformation transformation
   * @return { void } void
   */
  triggerTransformation (transformation?: Mutator<P, C>['transformation']): void {
    if (isNil(transformation)) {
      return this.trigger()
    } else {
      return this.trigger(Mutator.of(transformation))
    }
  }

  /**
   * Change the value of Mutation in a stream manner.
   *
   * Given "data" will be **upstream** of current Mutation, which is different from "beObservedBy" method.
   *
   * @param mutation data -> current mutation (-> other data)
   */
  observe (data: Data<P>): ReturnType<(typeof data)['subscribe']> {
    if (!isData(data)) {
      throw (new TypeError('"Mutation" can only observe a "Data"!'))
    }
    return data.subscribe((_datar: (typeof data)['datar'], _data: typeof data) => {
      this.mutate(_datar, _data)
    })
  }

  /**
   * Change the value of Mutation in a stream manner.
   *
   * Given "data" will be **downstream** of current Mutation, which is different from "observe" method.
   *
   * @param mutation (other data ->) current mutation -> data
   */
  beObservedBy (data: Data<C>): MutationSubscription<P, C> {
    return data.observe(this)
    // return this.subscribe((mutator, mutation) => {
    //   data.mutate(mutator, mutation)
    // })
  }

  /**
   * Change the value of Mutation in a static manner.
   *
   * take datar-like param(convert to datar)
   *   -> run datar with current mutator & contexts
   *   -> wrap and save result of datar.run as new mutator
   *   -> trigger consumers with new mutator & contexts
   *
   * @param datar Will be the 2nd param of mutator's operation.
   * @param data
   * @return { Mutation } Mutation(this)
   */
  // mutate <DV>(datar: Datar<OrBaseMeta<DV>>, data: Data<DV>): Mutation<P, C>
  // mutate <DV>(datar: Data<DV>, data: Data<DV>): Mutation<P, C>
  // mutate <DV>(datar: OrBaseMeta<DV>, data: Data<DV>): Mutation<P, C>
  mutate (datar: Data<P> | Datar<P> | P, data?: Data<P>): this {
    let _datar: Datar<P>
    if (isDatar<P>(datar)) {
      _datar = datar
    } else if (isData<P>(datar)) {
      _datar = datar.datar
    } else {
      _datar = Datar.of(datar)
    }

    let _data: Data<P> | undefined
    if (isNil(data)) {
      _data = isData(datar) ? datar : _data
    } else {
      if (isData(data)) {
        _data = data
      } else {
        throw (new TypeError('"data" is expected to be type of "Data".'))
      }
    }

    // Datar's run method will always return the transformation of mutator which passed to it as first argument.
    const newMutator = Mutator.of(_datar.run(this._mutator, _data), _datar, this._mutator.options)

    if (isTerminator(_datar.value)) {
      // If the value of received datar is TERMINATOR,
      //   throw away the result,
      //   do not update the mutator of current Mutation,
      //   and do not trigger consumers(subscribers).
    } else if (isPausor(_datar.value)) {
      // If the value of received datar is PAUSOR,
      //   update the mutator of current Mutation with new Mutator,
      //   but do not trigger consumers(subscribers).
      this._mutator = newMutator
    } else {
      // Else,
      //   update the mutator of current Mutation with new Mutator,
      //   and trigger consumers(subscribers).
      this._mutator = newMutator
      this.trigger()
    }

    return this
  }

  /**
   * @param trigger Which Take an internalTrigger(Function) as first parameter,
   *                                              invoke internalTrigger with any value will lead to
   *                                              Mutation's trigger method be triggerd with that value.
   * @param options
   * @param [options.forceWrap = false] If true, the emitted value of trigger will always be wrapped in Mutator.
   * @return { TriggerController } TriggerController
   */
  registerTrigger (
    trigger: Trigger<Mutator<P, C> | ((...args: any[]) => C) | C>,
    options: AtomTriggerRegisterOptions = DEFAULT_ATOM_TRIGGER_REGISTER_OPTIONS
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

    const internalTrigger: InternalTrigger<Mutator<P, C> | ((...args: any[]) => C) | C> = (acceptValue, ...args) => {
      if (forceWrap) {
        return this.trigger(...[Mutator.of(() => acceptValue), ...args])
      }

      if (!isMutator<P, C>(acceptValue)) {
        if (!isFunction(acceptValue)) {
          return this.trigger(...[Mutator.of(() => acceptValue), ...args])
        } else {
          return this.trigger(...[Mutator.of(acceptValue), ...args])
        }
      } else {
        return this.trigger(...[acceptValue, ...args])
      }
    }

    const controller = trigger(internalTrigger)
    return controller
  }
}

export const GC_MUTATION = Mutation.of(() => Symbol('GC_MUTATION'))
