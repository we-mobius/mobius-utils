import { isObject } from '../../internal/base'
import { looseCurryN } from '../../functional'
import {
  Data, isData, Mutation, isMutation, isAtom
} from '../../atom'
import { isMediator, DataMediator, MutationMediator } from './base.mediators'

import type { Datar } from '../particles'
import type { Subscription } from '../atoms'
import type { MediatorTypeMaker, MediatorType } from './base.mediators'

/******************************************************************************************************
 *
 *                                      FlatMediator Predicatess
 *
 ******************************************************************************************************/

/**
 * @param tar anything
 * @return { boolean } whether the target is a FlatMediator instance
 */
export const isFlatMediator = (tar: any): tar is FlatMediatorUnion =>
  isObject(tar) && tar.isFlatMediator

/******************************************************************************************************
 *
 *                                      FlatMediator Classes
 *
 ******************************************************************************************************/

/**
 *
 */
export const FlatMediatorType = '[mediator Flat]' as MediatorTypeMaker<'[mediator Flat]'>

export interface FlatMediatorOptions {
  autoConnect?: boolean
}
export const DEFAULT_FLAT_MEDIATOR_OPTIONS: Required<FlatMediatorOptions> = {
  autoConnect: true
}

type FlatMediatorUnion
  = FlatDataMediator<any>
  | FlatMutationMediator<any, any>

/******************************************************************************************************
 *
 *                                      FlatDataMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class FlatDataMediator<V = any> extends DataMediator<V> {
  private readonly _originAtom: Data<V>
  private _connection: { unsubscribe: () => void } | null
  private _subscription: Subscription | null
  private readonly _options: Required<FlatMediatorOptions>

  constructor (
    atom: Data<V>, options: FlatMediatorOptions = DEFAULT_FLAT_MEDIATOR_OPTIONS
  ) {
    const flattedD = Data.empty<V>()
    super(flattedD)

    this._options = { ...DEFAULT_FLAT_MEDIATOR_OPTIONS, ...options }

    this._originAtom = atom
    this._connection = null
    this._subscription = null

    const { autoConnect } = this._options

    if (autoConnect) {
      this.connect()
    }
  }

  get type (): MediatorType { return FlatMediatorType }
  get mediatorType (): MediatorType { return FlatMediatorType }

  get isFlatMediator (): true { return true }

  static of<V> (atom: Data<V>, options?: FlatMediatorOptions): FlatDataMediator<V>
  static of<I extends FlatMediatorUnion> (atom: I): I
  static of<I extends Data<any> | FlatMediatorUnion> (
    atom: I, options: FlatMediatorOptions = DEFAULT_FLAT_MEDIATOR_OPTIONS
  ): FlatMediatorUnion {
    if (!isAtom(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a FlatMediatorUnion.'))
    }
    if (isMediator(atom) && !isFlatMediator(atom)) {
      // throw (new TypeError('"atom" is expected to be a general Atom or a FlatMediatorUnion.'))
      console.warn('"atom" is expected to be a general Atom or a FlatMediatorUnion.')
    }
    if (isFlatMediator(atom)) {
      return atom
    }

    const _options = { ...DEFAULT_FLAT_MEDIATOR_OPTIONS, ...options }

    return new FlatDataMediator(atom, _options)
  }

  connect (): void {
    this._subscription = this._originAtom.subscribe(({ value }: Datar<V>) => {
      // If there is a exist connection, disconnect it.
      this.disconnect()
      if (isData(value)) {
        // Data -> extract value(Data) -> asIsM -> newData(this._atom)
        const asIsM: Mutation<any, V> = Mutation.ofLiftLeft(prevD => prevD)
        const subscription2 = this._atom.observe(asIsM)
        const subscription1 = asIsM.observe(value)
        // value is a normal Data which means it will not replay the latest value automatically
        value.trigger()
        this._connection = {
          unsubscribe: () => {
            subscription1.unsubscribe()
            subscription2.unsubscribe()
          }
        }
      } else if (isMutation(value)) {
        // Data -> extract value(Mutation) -> newData(this._atom)
        const subscription = this._atom.observe(value)
        this._connection = {
          unsubscribe: () => subscription.unsubscribe()
        }
      } else {
        throw (new TypeError('"value" is expected to be a Data or a Mutation.'))
      }
    })
  }

  disconnect (): void {
    this._connection?.unsubscribe()
    this._connection = null
  }

  release (): void {
    this._subscription?.unsubscribe()
    super.release()
  }
}

/******************************************************************************************************
 *
 *                                      FlatMutationMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class FlatMutationMediator<P = any, C = any> extends MutationMediator<P, C> {
  private readonly _originAtom: Mutation<P, C>
  private _connection: { unsubscribe: () => void } | null
  private _subscription: Subscription | null
  private readonly _options: FlatMediatorOptions

  constructor (
    atom: Mutation<P, C>, options: FlatMediatorOptions = DEFAULT_FLAT_MEDIATOR_OPTIONS
  ) {
    const flattedM: Mutation<any, any> = Mutation.ofLiftLeft(prevD => prevD)
    super(flattedM)

    this._options = { ...DEFAULT_FLAT_MEDIATOR_OPTIONS, ...options }

    this._originAtom = atom
    this._connection = null
    this._subscription = null

    const { autoConnect } = this._options

    if (autoConnect === true) {
      this.connect()
    }
  }

  get type (): MediatorType { return FlatMediatorType }
  get mediatorType (): MediatorType { return FlatMediatorType }

  get isFlatMediator (): true { return true }

  static of<P, C> (atom: Mutation<P, C>, options?: FlatMediatorOptions): FlatMutationMediator<P, C>
  static of<I extends FlatMediatorUnion> (atom: I): I
  static of<I extends Mutation<any, any> | FlatMediatorUnion> (
    atom: I, options: FlatMediatorOptions = DEFAULT_FLAT_MEDIATOR_OPTIONS
  ): FlatMediatorUnion {
    if (!isAtom(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a FlatMediatorUnion.'))
    }
    if (isMediator(atom) && !isFlatMediator(atom)) {
      // throw (new TypeError('"atom" is expected to be a general Atom or a FlatMediatorUnion.'))
      console.warn('"atom" is expected to be a general Atom or a FlatMediatorUnion.')
    }
    if (isFlatMediator(atom)) {
      return atom
    }

    const _options = { ...DEFAULT_FLAT_MEDIATOR_OPTIONS, ...options }

    return new FlatMutationMediator(atom, _options)
  }

  connect (): void {
    const tempData = Data.empty<C>()
    this._subscription = tempData.subscribe(({ value }: (typeof tempData)['datar']) => {
      this.disconnect()
      if (isData(value)) {
        // Mutation -> tempData -> extract value(Data) -> newMutation(this._atom)
        const subscription2 = this._atom.observe(value)
        const subscription1 = tempData.observe(this._originAtom)
        this._connection = {
          unsubscribe: () => {
            subscription1.unsubscribe()
            subscription2.unsubscribe()
          }
        }
      } else if (isMutation(value)) {
        // Mutation -> tempData -> extract value(Mutation) -> tempData2 -> newMutation(this._atom)
        const tempData2 = Data.empty<P>()
        const subscription3 = this._atom.observe(tempData2)
        const subscription2 = tempData2.observe(value)
        const subscription1 = tempData.observe(this._originAtom)
        this._connection = {
          unsubscribe: () => {
            subscription1.unsubscribe()
            subscription2.unsubscribe()
            subscription3.unsubscribe()
          }
        }
      } else {
        throw (new TypeError('"value" is expected to be a Data or a Mutation.'))
      }
    })
  }

  disconnect (): void {
    this._connection?.unsubscribe()
    this._connection = null
  }

  release (): void {
    this._subscription?.unsubscribe()
    super.release()
  }
}

/******************************************************************************************************
 *
 *                                      FlatMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class FlatMediator {
  constructor () {
    throw (new TypeError('"FlatMediator" is not meant to be instantiated.'))
  }

  get type (): MediatorType { return FlatMediatorType }
  get mediatorType (): MediatorType { return FlatMediatorType }

  get isFlatMediator (): true { return true }

  static of<V> (atom: Data<V>, options?: FlatMediatorOptions): FlatDataMediator<V>
  static of<P, C> (atom: Mutation<P, C>, options?: FlatMediatorOptions): FlatMutationMediator<P, C>
  static of<I extends FlatMediatorUnion> (atom: I, options?: FlatMediatorOptions): I
  static of<I extends Data<any> | Mutation<any, any> | FlatMediatorUnion> (
    atom: I, options: FlatMediatorOptions = DEFAULT_FLAT_MEDIATOR_OPTIONS
  ): FlatMediatorUnion {
    if (!isAtom(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a FlatMediatorUnion.'))
    }
    if (isMediator(atom) && !isFlatMediator(atom)) {
      // throw (new TypeError('"atom" is expected to be a general Atom or a FlatMediatorUnion.'))
      console.warn('"atom" is expected to be a general Atom or a FlatMediatorUnion.')
    }
    if (isFlatMediator(atom)) {
      return atom
    }

    const _options = { ...DEFAULT_FLAT_MEDIATOR_OPTIONS, ...options }

    if (isData(atom)) {
      return FlatDataMediator.of(atom, _options)
    } else if (isMutation(atom)) {
      return FlatMutationMediator.of(atom, _options)
    } else {
      throw (new TypeError('Invalid atom type!'))
    }
  }
}

interface IWithValueFlatted {
  <V = any> (atom: Data<V>, options?: FlatMediatorOptions): FlatDataMediator<V>
  <P = any, C = any> (atom: Mutation<P, C>, options?: FlatMediatorOptions): FlatMutationMediator<P, C>
  <I extends FlatMediatorUnion> (atom: I, options?: FlatMediatorOptions): I
}
/**
 * Make a flat mediator which will flatten the data and mutation of the given atom.
 *  - Data\<Data> -> Data
 *  - Data\<Mutation> -> Data
 *  - Mutation\<Mutation> -> Mutation
 *  - Mutation\<Data> -> Mutation
 */
export const withValueFlatted: IWithValueFlatted = looseCurryN(1, (
  atom: any, options: FlatMediatorOptions = DEFAULT_FLAT_MEDIATOR_OPTIONS
): any => {
  return FlatMediator.of(atom, options)
})
