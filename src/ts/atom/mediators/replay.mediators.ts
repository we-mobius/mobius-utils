import { isObject, isNumber } from '../../internal/base'
import { curry } from '../../functional'

import {
  isAtomLike, Data, isData, Mutation, isMutation, Subscription,
  DEFAULT_SUBSCRIBE_OPTIONS
} from '../atoms'
import {
  isMediator,
  DataMediator, MutationMediator
} from './base.mediators'

import type { Datar, Mutator } from '../particles'
import type {
  SubscribeOptions, AtomLike,
  ValueConsumer, DatarConsumer, DataConsumer, DataSubscription,
  TransformationConsumer, MutatorConsumer, MutationConsumer, MutationSubscription
} from '../atoms'
import type { MediatorTypeMaker, MediatorType } from './base.mediators'

/******************************************************************************************************
 *
 *                                      ReplayMediator Predicatess
 *
 ******************************************************************************************************/

/**
 * @param tar anything
 * @return { boolean } whether the target is a ReplayMediator instance
 */
export const isReplayMediator = (tar: any): tar is ReplayMediatorUnion =>
  isObject(tar) && tar.isReplayMediator

/******************************************************************************************************
 *
 *                                      ReplayMediator Classes
 *
 ******************************************************************************************************/

/**
 *
 */
export const ReplayMediatorType = '[mediator Replay]' as MediatorTypeMaker<'[mediator Replay]'>

export interface ReplayMediatorOptions {
  replayTime?: number
  autoTrigger?: boolean
}
export const DEFAULT_REPLAY_MEDIATOR_OPTIONS: Required<ReplayMediatorOptions> = {
  replayTime: 1,
  autoTrigger: true
}

export type ReplayMediatorUnion
  = ReplayDataMediator<any>
  | ReplayMutationMediator<any, any>

/******************************************************************************************************
 *
 *                                      ReplayDataMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class ReplayDataMediator<V = any> extends DataMediator<V> {
  private _history: Array<Datar<V>>
  private readonly _consumers: Set<DatarConsumer<V>>
  private readonly _subscription: Subscription
  private _options: Required<ReplayMediatorOptions>

  constructor (
    atom: Data<V>, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ) {
    super(atom)

    this._options = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...options }
    this._history = []
    this._consumers = new Set()

    const { replayTime } = this._options

    this.setReplayTime(replayTime)
    this._subscription = atom.subscribe((val: Datar<V>) => {
      this._history.push(val)
      this._setHistory()
    })
  }

  get type (): MediatorType { return ReplayMediatorType }
  get mediatorType (): MediatorType { return ReplayMediatorType }

  get isReplayMediator (): true { return true }

  static of<V>(atom: Data<V>, options?: ReplayMediatorOptions): ReplayDataMediator<V>
  static of<I extends ReplayMediatorUnion>(atom: I, options?: ReplayMediatorOptions): I
  static of<I extends Data<any> | ReplayMediatorUnion> (
    atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ): ReplayMediatorUnion {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a ReplayMediatorUnion.'))
    }
    if (isMediator(atom) && !isReplayMediator(atom)) {
      // throw (new TypeError('"atom" is expected to be a general Atom or a ReplayMediatorUnion.'))
      console.warn('"atom" is expected to be a general Atom or a ReplayMediatorUnion.')
    }
    if (isReplayMediator(atom)) {
      return atom
    }

    const _options = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...options }

    const { autoTrigger } = _options

    const mediator = new ReplayDataMediator(atom, _options)

    if (autoTrigger) {
      atom.trigger()
    }

    return mediator
  }

  /**
   * If the history is longer than the replayTime, the history will be trimmed.
   */
  private _setHistory (): void {
    const delta = this._history.length - this._options.replayTime
    if (delta > 0) {
      this._history = this._history.slice(delta)
    }
  }

  setReplayTime (replayTime: number): void {
    if (!isNumber(replayTime)) {
      throw (new TypeError('"replayTime" is expected to be a Number.'))
    }
    this._options.replayTime = Math.floor(Math.abs(replayTime))
    this._setHistory()
  }

  replayTo (consumer: DatarConsumer<V>): void {
    this._history.forEach(val => {
      consumer(val, this._atom)
    })
  }

  replay (): void {
    this._consumers.forEach((consumer) => {
      this.replayTo(consumer)
    })
  }

  subscribe (
    consumer: DataConsumer<V>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): DataSubscription<V> {
    const subscription = this._atom.subscribe(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer)
    return subscription
  }

  subscribeValue (
    consumer: ValueConsumer<V>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): DataSubscription<V> {
    const subscription = this._atom.subscribeValue(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer)
    return subscription
  }

  // !!! important
  beObservedBy (mutation: Mutation<V, any>): DataSubscription<V> {
    return mutation.observe(this as unknown as Data<any>)
  }

  release (): void {
    this._subscription.unsubscribe()
    super.release()
  }
}

/******************************************************************************************************
 *
 *                                      ReplayMutationMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class ReplayMutationMediator<P = any, C = any> extends MutationMediator<P, C> {
  private _history: Array<Mutator<P, C>>
  private readonly _consumers: Set<MutatorConsumer<P, C>>
  private readonly _subscription: Subscription
  private _options: Required<ReplayMediatorOptions>

  constructor (
    atom: Mutation<P, C>, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ) {
    super(atom)

    this._options = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...options }
    this._history = []
    this._consumers = new Set()

    const { replayTime } = this._options

    this.setReplayTime(replayTime)
    this._subscription = atom.subscribe((val: Mutator<P, C>) => {
      this._history.push(val)
      this._setHistory()
    })
  }

  get type (): MediatorType { return ReplayMediatorType }
  get mediatorType (): MediatorType { return ReplayMediatorType }

  get isReplayMediator (): true { return true }

  static of<P, C>(atom: Mutation<P, C>, options?: ReplayMediatorOptions): ReplayMutationMediator<P, C>
  static of<I extends ReplayMediatorUnion>(atom: I, options?: ReplayMediatorOptions): I
  static of<I extends Mutation<any, any> | ReplayMediatorUnion> (
    atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ): ReplayMediatorUnion {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a ReplayMediatorUnion.'))
    }
    if (isMediator(atom) && !isReplayMediator(atom)) {
      // throw (new TypeError('"atom" is expected to be a general Atom or a ReplayMediatorUnion.'))
      console.warn('"atom" is expected to be a general Atom or a ReplayMediatorUnion.')
    }
    if (isReplayMediator(atom)) {
      return atom
    }

    const _options = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...options }

    const { autoTrigger } = _options

    const mediator = new ReplayMutationMediator(atom, _options)

    if (autoTrigger) {
      atom.trigger()
    }

    return mediator
  }

  /**
   * If the history is longer than the replayTime, the history will be trimmed.
   */
  private _setHistory (): void {
    const delta = this._history.length - this._options.replayTime
    if (delta > 0) {
      this._history = this._history.slice(delta)
    }
  }

  setReplayTime (replayTime: number): void {
    if (!isNumber(replayTime)) {
      throw (new TypeError('"replayTime" is expected to be a Number.'))
    }
    this._options.replayTime = Math.floor(Math.abs(replayTime))
    this._setHistory()
  }

  replayTo (consumer: MutatorConsumer<P, C>): void {
    this._history.forEach((val) => {
      consumer(val, this._atom)
    })
  }

  replay (): void {
    this._consumers.forEach((consumer) => {
      this.replayTo(consumer)
    })
  }

  subscribe (
    consumer: MutationConsumer<P, C>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): MutationSubscription<P, C> {
    const subscription = this._atom.subscribe(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer)
    return subscription
  }

  subscribeTransformation (
    consumer: TransformationConsumer<P, C>, options: SubscribeOptions = DEFAULT_SUBSCRIBE_OPTIONS
  ): MutationSubscription<P, C> {
    const subscription = this._atom.subscribeTransformation(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer)
    return subscription
  }

  // !!! important
  beObservedBy (data: Data<C>): MutationSubscription<P, C> {
    return data.observe(this as unknown as Mutation<any, any>)
  }

  release (): void {
    this._subscription.unsubscribe()
    super.release()
  }
}

/******************************************************************************************************
 *
 *                                      ReplayMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class ReplayMediator {
  constructor () {
    throw (new TypeError('"ReplayMediator" is not meant to be instantiated.'))
  }

  get type (): MediatorType { return ReplayMediatorType }
  get mediatorType (): MediatorType { return ReplayMediatorType }

  get isReplayMediator (): true { return true }

  static of<V> (atom: Data<V>, options?: ReplayMediatorOptions): ReplayDataMediator<V>
  static of<P, C> (atom: Mutation<P, C>, options?: ReplayMediatorOptions): ReplayMutationMediator<P, C>
  static of<I extends ReplayMediatorUnion> (atom: I, options?: ReplayMediatorOptions): I
  static of<I extends Data<any> | Mutation<any, any> | ReplayMediatorUnion> (
    atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ): ReplayMediatorUnion {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a ReplayMediatorUnion.'))
    }
    if (isMediator(atom) && !isReplayMediator(atom)) {
      // throw (new TypeError('"atom" is expected to be a general Atom or a ReplayMediatorUnion.'))
      console.warn('"atom" is expected to be a general Atom or a ReplayMediatorUnion.')
    }
    if (isReplayMediator(atom)) {
      return atom
    }

    const _options = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...options }

    if (isData(atom)) {
      return ReplayDataMediator.of(atom, _options)
    } else if (isMutation(atom)) {
      return ReplayMutationMediator.of(atom, _options)
    } else {
      throw (new TypeError('Invalid atom type!'))
    }
  }
}

interface IReplayLatestPartial {
  <V = any>(atom: Data<V>): ReplayDataMediator<V>
  <P = any, C = any>(atom: Mutation<P, C>): ReplayMutationMediator<P, C>
  <I extends ReplayMediatorUnion>(atom: I): I
}
interface IReplayLatest {
  (replayTime: number): IReplayLatestPartial
  <V = any>(replayTime: number, atom: Data<V>): ReplayDataMediator<V>
  <P = any, C = any>(replayTime: number, atom: Mutation<P, C>): ReplayMutationMediator<P, C>
  <I extends ReplayMediatorUnion> (replayTime: number, atom: I): I
}
/**
 * Make a replay mediator with specified replayTime but without autoTrigger.
 *
 * @param replayTime
 * @param atom
 */
export const replayWithoutLatest: IReplayLatest = curry((replayTime, atom) => {
  return ReplayMediator.of(atom, { replayTime, autoTrigger: false })
})
/**
 * Make a replay mediator with specified replay time and auto trigger.
 *
 * @param replayTime
 * @param atom
 */
export const replayWithLatest: IReplayLatest = curry((replayTime, atom) => {
  return ReplayMediator.of(atom, { replayTime, autoTrigger: true })
})
