import { isObject } from '../../internal/base'
import { isAtomLike, isData, isMutation } from '../atoms'
import {
  DataMediator, MutationMediator
} from './base.mediators'

import type {
  AtomTriggerRegisterOptions, TriggerController, DataLike, MutationLike,
  DataTrigger, MutationTrigger
} from '../atoms'
import type { MediatorTypeMaker, MediatorType } from './base.mediators'

/******************************************************************************************************
 *
 *                                      TriggerMediator Predicatess
 *
 ******************************************************************************************************/

/**
 * @param tar anything
 * @return whether the target is a TriggerMediator instance
 */
export const isTriggerMediator = (tar: any): tar is TriggerMediatorUnion =>
  isObject(tar) && tar.isTriggerMediator

/******************************************************************************************************
 *
 *                                      TriggerMediator Classes
 *
 ******************************************************************************************************/

/**
 *
 */
export const TriggerMediatorType = '[mediator Trigger]' as MediatorTypeMaker<'[mediator Trigger]'>

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TriggerMediatorOptions {}

export const DEFAULT_TRIGGER_MEDIATOR_OPTIONS: Required<TriggerMediatorOptions> = {}

export type TriggerMediatorUnion
  = TriggerDataMediator<any>
  | TriggerMutationMediator<any, any>

type TriggerDataMediatorMap<V = any> = Map<DataTrigger<V>, TriggerController>
type TriggerMutationMediatorMap<P = any, C = any> = Map<MutationTrigger<P, C>, TriggerController>

/******************************************************************************************************
 *
 *                                      TriggerDataMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class TriggerDataMediator<V = any> extends DataMediator<V> {
  private readonly _map: TriggerDataMediatorMap<V>

  constructor (atom: DataLike<V>) {
    super(atom)
    this._map = new Map()
  }

  get type (): MediatorType { return TriggerMediatorType }
  get mediatorType (): MediatorType { return TriggerMediatorType }

  get isTriggerMediator (): true { return true }

  static of<V> (atom: DataLike<V>): TriggerDataMediator<V>
  static of<I extends TriggerMediatorUnion> (atom: I): I
  static of<I extends DataLike<any> | TriggerMediatorUnion> (
    atom: I
  ): TriggerMediatorUnion {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }
    if (isTriggerMediator(atom)) {
      return atom
    } else {
      return new TriggerDataMediator(atom)
    }
  }

  get map (): TriggerDataMediatorMap<V> { return this._map }

  /**
   * @signature _add :: (Trigger, TriggerController) -> Map
   */
  private _add (trigger: DataTrigger<V>, controller: TriggerController): TriggerDataMediatorMap<V> {
    return this._map.set(trigger, controller)
  }

  /**
   * @signature _remove :: Trigger -> Boolean
   */
  private _remove (trigger: DataTrigger<V>): boolean {
    return this._map.delete(trigger)
  }

  register (trigger: DataTrigger<V>, options?: AtomTriggerRegisterOptions): TriggerController {
    const controller = this._atom.registerTrigger(trigger, options)
    this._add(trigger, controller)
    return controller
  }

  getController (trigger: DataTrigger<V>): TriggerController | undefined {
    return this._map.get(trigger)
  }

  /**
   * @signature remove :: Trigger -> Boolean
   */
  remove (trigger: DataTrigger<V>): boolean {
    const controller = this._map.get(trigger)
    controller?.cancel?.()
    return this._remove(trigger)
  }

  /**
   * @signature removeAll :: () -> Boolean
   */
  removeAll (): boolean {
    let successFlag = false
    this._map.forEach((controller, trigger) => {
      controller.cancel?.()
      successFlag = this._remove(trigger) && successFlag
    })
    return successFlag
  }

  release (): void {
    this.removeAll()
    super.release()
  }
}

/******************************************************************************************************
 *
 *                                      TriggerMutationMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class TriggerMutationMediator<P = any, C = any> extends MutationMediator<P, C> {
  private readonly _map: TriggerMutationMediatorMap<P, C>

  constructor (atom: MutationLike<P, C>) {
    super(atom)
    this._map = new Map()
  }

  get type (): MediatorType { return TriggerMediatorType }
  get mediatorType (): MediatorType { return TriggerMediatorType }

  get isTriggerMediator (): true { return true }

  static of<P, C> (atom: MutationLike<P, C>): TriggerMutationMediator<P, C>
  static of<I extends TriggerMediatorUnion> (atom: I): I
  static of<I extends MutationLike<any, any> | TriggerMediatorUnion> (
    atom: I
  ): TriggerMediatorUnion {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }
    if (isTriggerMediator(atom)) {
      return atom
    } else {
      return new TriggerMutationMediator(atom)
    }
  }

  get map (): TriggerMutationMediatorMap<P, C> { return this._map }

  /**
   * @signature _add :: (Trigger, TriggerController) -> Map
   */
  private _add (trigger: MutationTrigger<P, C>, controller: TriggerController): TriggerMutationMediatorMap<P, C> {
    return this._map.set(trigger, controller)
  }

  /**
   * @signature _remove :: Trigger -> Boolean
   */
  private _remove (trigger: MutationTrigger<P, C>): boolean {
    return this._map.delete(trigger)
  }

  register (trigger: MutationTrigger<P, C>, options?: AtomTriggerRegisterOptions): TriggerController {
    const controller = this._atom.registerTrigger(trigger, options)
    this._add(trigger, controller)
    return controller
  }

  getController (trigger: MutationTrigger<P, C>): TriggerController | undefined {
    return this._map.get(trigger)
  }

  /**
   * @signature remove :: Trigger -> Boolean
   */
  remove (trigger: MutationTrigger<P, C>): boolean {
    const controller = this._map.get(trigger)
    controller?.cancel?.()
    return this._remove(trigger)
  }

  /**
   * @signature removeAll :: () -> Boolean
   */
  removeAll (): boolean {
    let successFlag = false
    this._map.forEach((controller, trigger) => {
      controller.cancel?.()
      successFlag = this._remove(trigger) && successFlag
    })
    return successFlag
  }

  release (): void {
    this.removeAll()
    super.release()
  }
}

/******************************************************************************************************
 *
 *                                              TriggerMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class TriggerMediator {
  constructor () {
    throw (new TypeError('"TriggerMediator" is not meant to be instantiated.'))
  }

  get type (): MediatorType { return TriggerMediatorType }
  get mediatorType (): MediatorType { return TriggerMediatorType }

  get isTriggerMediator (): true { return true }

  static of<V> (atom: DataLike<V>, options?: TriggerMediatorOptions): TriggerDataMediator<V>
  static of<P, C> (atom: MutationLike<P, C>, options?: TriggerMediatorOptions): TriggerMutationMediator<P, C>
  static of<I extends TriggerMediatorUnion> (atom: I, options?: TriggerMediatorOptions): I
  static of<I extends DataLike<any> | MutationLike<any, any> | TriggerMediatorUnion> (
    atom: I, options: TriggerMediatorOptions = DEFAULT_TRIGGER_MEDIATOR_OPTIONS
  ): TriggerMediatorUnion {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }

    if (isTriggerMediator(atom)) {
      return atom
    }

    // TODO: Check if this is the best way to do this.(type Predicates)
    if (isData(atom)) {
      return TriggerDataMediator.of(atom)
    } else if (isMutation(atom)) {
      return TriggerMutationMediator.of(atom)
    } else {
      throw (new TypeError('Invalid atom type!'))
    }
  }
}
