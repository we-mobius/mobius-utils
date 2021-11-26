import { isObject, isNumber } from '../../internal/base'
import { curry } from '../../functional'

import { isAtom, Data, isData, Mutation, isMutation, Subscription } from '../atoms'
import {
  isMediator,
  DataMediator, MutationMediator
} from './base.mediators'

import type { MediatorTypeMaker, MediatorType } from './base.mediators'

/******************************************************************************************************
 *
 *                                      ReplayMediator Predicatess
 *
 ******************************************************************************************************/

/**
 * @param { Any } tar anything
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
  = ReplayDataMediator<Data<any>>
  | ReplayMutationMediator<Mutation<any, any>>

type SetItem<S extends Set<any>> = S extends Set<infer T> ? T : never
type ConsumerTypeOf<D extends Data<any> | Mutation<any, any>> = SetItem<D['consumers']>

/******************************************************************************************************
 *
 *                                      ReplayDataMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class ReplayDataMediator<I extends Data<any>> extends DataMediator<I> {
  private _history: Array<I['datar']>
  private readonly _consumers: I['consumers']
  private readonly _subscription: Subscription
  private _options: Required<ReplayMediatorOptions>

  constructor (atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS) {
    super(atom)

    this._options = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...options }
    this._history = []
    this._consumers = new Set()

    const { replayTime } = this._options

    this.setReplayTime(replayTime)
    this._subscription = atom.subscribe((val: I['datar']) => {
      this._history.push(val)
      this._setHistory()
    })
  }

  get type (): MediatorType { return ReplayMediatorType }
  get mediatorType (): MediatorType { return ReplayMediatorType }

  get isReplayMediator (): true { return true }

  static of<I extends Data<any>>(atom: I, options?: ReplayMediatorOptions): ReplayDataMediator<I>
  static of<I extends ReplayMediatorUnion>(atom: I, options?: ReplayMediatorOptions): I
  static of<I extends Data<any> | ReplayMediatorUnion> (
    atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ): ReplayMediatorUnion {
    if (!isAtom(atom)) {
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

  replayTo (consumer: ConsumerTypeOf<I>): void {
    this._history.forEach(val => {
      consumer(val, this._atom)
    })
  }

  replay (): void {
    this._consumers.forEach((consumer) => {
      this.replayTo(consumer as ConsumerTypeOf<I>)
    })
  }

  subscribe (...args: Parameters<I['subscribe']>): ReturnType<I['subscribe']> {
    const [consumer, options] = args
    const subscription = this._atom.subscribe(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer as ConsumerTypeOf<I>)
    return subscription as ReturnType<I['subscribe']>
  }

  subscribeValue (...args: Parameters<I['subscribeValue']>): ReturnType<I['subscribeValue']> {
    const [consumer, options] = args
    const subscription = this._atom.subscribeValue(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer as ConsumerTypeOf<I>)
    return subscription as ReturnType<I['subscribeValue']>
  }

  // !!! important
  beObservedBy (...args: Parameters<I['beObservedBy']>): ReturnType<I['beObservedBy']> {
    const [mutation] = args
    return mutation.observe(this as unknown as Data<any>) as ReturnType<I['beObservedBy']>
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
export class ReplayMutationMediator<I extends Mutation<any, any>> extends MutationMediator<I> {
  private _history: Array<I['mutator']>
  private readonly _consumers: I['consumers']
  private readonly _subscription: Subscription
  private _options: Required<ReplayMediatorOptions>

  constructor (atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS) {
    super(atom)

    this._options = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...options }
    this._history = []
    this._consumers = new Set()

    const { replayTime } = this._options

    this.setReplayTime(replayTime)
    this._subscription = atom.subscribe((val: I['mutator']) => {
      this._history.push(val)
      this._setHistory()
    })
  }

  get type (): MediatorType { return ReplayMediatorType }
  get mediatorType (): MediatorType { return ReplayMediatorType }

  get isReplayMediator (): true { return true }

  static of<I extends Mutation<any, any>>(atom: I, options?: ReplayMediatorOptions): ReplayMutationMediator<I>
  static of<I extends ReplayMediatorUnion>(atom: I, options?: ReplayMediatorOptions): I
  static of<I extends Mutation<any, any> | ReplayMediatorUnion> (
    atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ): ReplayMediatorUnion {
    if (!isAtom(atom)) {
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

  replayTo (consumer: ConsumerTypeOf<I>): void {
    this._history.forEach((val) => {
      consumer(val, this._atom)
    })
  }

  replay (): void {
    this._consumers.forEach((consumer) => {
      this.replayTo(consumer as ConsumerTypeOf<I>)
    })
  }

  subscribe (...args: Parameters<I['subscribe']>): ReturnType<I['subscribe']> {
    const [consumer, options] = args
    const subscription = this._atom.subscribe(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer as ConsumerTypeOf<I>)
    return subscription as ReturnType<I['subscribe']>
  }

  subscribeTransformation (...args: Parameters<I['subscribeTransformation']>): ReturnType<I['subscribeTransformation']> {
    const [consumer, options] = args
    const subscription = this._atom.subscribeTransformation(consumer, options)
    const { proxyConsumer } = subscription
    this._consumers.add(proxyConsumer)
    this.replayTo(proxyConsumer as ConsumerTypeOf<I>)
    return subscription as ReturnType<I['subscribeTransformation']>
  }

  // !!! important
  beObservedBy (...args: Parameters<I['beObservedBy']>): ReturnType<I['beObservedBy']> {
    const [mutation] = args
    return mutation.observe(this as unknown as Mutation<any, any>) as ReturnType<I['beObservedBy']>
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

  static of<I extends Data<any>> (atom: I, options?: ReplayMediatorOptions): ReplayDataMediator<I>
  static of<I extends Mutation<any, any>> (atom: I, options?: ReplayMediatorOptions): ReplayMutationMediator<I>
  static of<I extends ReplayMediatorUnion> (atom: I, options?: ReplayMediatorOptions): I
  static of<I extends Data<any> | Mutation<any, any> | ReplayMediatorUnion> (
    atom: I, options: ReplayMediatorOptions = DEFAULT_REPLAY_MEDIATOR_OPTIONS
  ): ReplayMediatorUnion {
    if (!isAtom(atom)) {
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
  <I extends Data<any>>(atom: I): ReplayDataMediator<I>
  <I extends Mutation<any, any>>(atom: I): ReplayMutationMediator<I>
  <I extends ReplayMediatorUnion>(atom: I): I
}
interface IReplayLatest {
  (replayTime: number): IReplayLatestPartial
  <I extends Data<any>>(replayTime: number, atom: I): ReplayDataMediator<I>
  <I extends Mutation<any, any>>(replayTime: number, atom: I): ReplayMutationMediator<I>
  <I extends ReplayMediatorUnion> (replayTime: number, atom: I): I
}
/**
 * Make a replay mediator with specified replayTime but without autoTrigger.
 * @param { number } replayTime
 */
export const replayWithoutLatest: IReplayLatest = curry((replayTime, atom) => {
  return ReplayMediator.of(atom, { replayTime, autoTrigger: false })
})
/**
 * Make a replay mediator with specified replay time and auto trigger
 * @param { number } replayTime
 */
export const replayWithLatest: IReplayLatest = curry((replayTime, atom) => {
  return ReplayMediator.of(atom, { replayTime, autoTrigger: true })
})
