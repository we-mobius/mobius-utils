import { isObject } from '../../internal/base'
import { isAtom, Data, isData, Mutation, isMutation } from '../atoms'
import {
  isMediator,
  DataMediator, MutationMediator
} from './base.mediators'

import type { AtomTriggerRegisterOptions, Trigger, TriggerController } from '../atoms'
import type { MediatorTypeMaker, MediatorType } from './base.mediators'

/******************************************************************************************************
 *
 *                                      TriggerMediator Predicatess
 *
 ******************************************************************************************************/

/**
 * @param { Any } tar anything
 * @return { boolean } whether the target is a TriggerMediator instance
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
  = TriggerDataMediator<Data<any>>
  | TriggerMutationMediator<Mutation<any, any>>

type DataTrigger<I extends Data<any>> = Trigger<I['value']>
type MutationTrigger<I extends Mutation<any, any>> = Trigger<I['transformation']>
type TriggerDataMediatorMap<I extends Data<any>> = Map<DataTrigger<I>, TriggerController>
type TriggerMutationMediatorMap<I extends Mutation<any, any>> = Map<MutationTrigger<I>, TriggerController>

/******************************************************************************************************
 *
 *                                      TriggerDataMediator
 *
 ******************************************************************************************************/

/**
 *
 */
export class TriggerDataMediator<I extends Data<any>> extends DataMediator<I> {
  private readonly _map: TriggerDataMediatorMap<I>

  constructor (atom: I) {
    super(atom)
    this._map = new Map()
  }

  get type (): MediatorType { return TriggerMediatorType }
  get mediatorType (): MediatorType { return TriggerMediatorType }

  get isTriggerMediator (): true { return true }

  static of<I extends Data<any>> (atom: I): TriggerDataMediator<I>
  static of<I extends TriggerMediatorUnion> (atom: I): I
  static of<I extends Data<any> | TriggerMediatorUnion> (
    atom: I
  ): TriggerMediatorUnion {
    if (!isAtom(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }
    if (isMediator(atom) && !isTriggerMediator(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }
    if (isTriggerMediator(atom)) {
      return atom
    } else {
      return new TriggerDataMediator(atom)
    }
  }

  get map (): TriggerDataMediatorMap<I> { return this._map }

  /**
   * @signature _add :: (Trigger, TriggerController) -> Map
   */
  private _add (trigger: DataTrigger<I>, controller: TriggerController): TriggerDataMediatorMap<I> {
    return this._map.set(trigger, controller)
  }

  /**
   * @signature _remove :: Trigger -> Boolean
   */
  private _remove (trigger: DataTrigger<I>): boolean {
    return this._map.delete(trigger)
  }

  register (trigger: DataTrigger<I>, options?: AtomTriggerRegisterOptions): TriggerController {
    const controller = this._atom.registerTrigger(trigger, options)
    this._add(trigger, controller)
    return controller
  }

  getController (trigger: DataTrigger<I>): TriggerController | undefined {
    return this._map.get(trigger)
  }

  /**
   * @signature remove :: Trigger -> Boolean
   */
  remove (trigger: DataTrigger<I>): boolean {
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
export class TriggerMutationMediator<I extends Mutation<any, any>> extends MutationMediator<I> {
  private readonly _map: TriggerMutationMediatorMap<I>

  constructor (atom: I) {
    super(atom)
    this._map = new Map()
  }

  get type (): MediatorType { return TriggerMediatorType }
  get mediatorType (): MediatorType { return TriggerMediatorType }

  get isTriggerMediator (): true { return true }

  static of<I extends Mutation<any, any>> (atom: I): TriggerMutationMediator<I>
  static of<I extends TriggerMediatorUnion> (atom: I): I
  static of<I extends Mutation<any, any> | TriggerMediatorUnion> (
    atom: I
  ): TriggerMediatorUnion {
    if (!isAtom(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }
    if (isMediator(atom) && !isTriggerMediator(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }
    if (isTriggerMediator(atom)) {
      return atom
    } else {
      return new TriggerMutationMediator(atom)
    }
  }

  get map (): TriggerMutationMediatorMap<I> { return this._map }

  /**
   * @signature _add :: (Trigger, TriggerController) -> Map
   */
  private _add (trigger: MutationTrigger<I>, controller: TriggerController): TriggerMutationMediatorMap<I> {
    return this._map.set(trigger, controller)
  }

  /**
   * @signature _remove :: Trigger -> Boolean
   */
  private _remove (trigger: MutationTrigger<I>): boolean {
    return this._map.delete(trigger)
  }

  register (trigger: MutationTrigger<I>, options?: AtomTriggerRegisterOptions): TriggerController {
    const controller = this._atom.registerTrigger(trigger, options)
    this._add(trigger, controller)
    return controller
  }

  getController (trigger: MutationTrigger<I>): TriggerController | undefined {
    return this._map.get(trigger)
  }

  /**
   * @signature remove :: Trigger -> Boolean
   */
  remove (trigger: MutationTrigger<I>): boolean {
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

  static of<I extends Data<any>> (atom: I, options?: TriggerMediatorOptions): TriggerDataMediator<I>
  static of<I extends Mutation<any, any>> (atom: I, options?: TriggerMediatorOptions): TriggerMutationMediator<I>
  static of<I extends TriggerMediatorUnion> (atom: I, options?: TriggerMediatorOptions): I
  static of<I extends Data<any> | Mutation<any, any> | TriggerMediatorUnion> (
    atom: I, options: TriggerMediatorOptions = DEFAULT_TRIGGER_MEDIATOR_OPTIONS
  ): TriggerMediatorUnion {
    if (!isAtom(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }
    if (isMediator(atom) && !isTriggerMediator(atom)) {
      throw (new TypeError('"atom" is expected to be a general Atom or a TriggerMediatorUnion.'))
    }

    if (isTriggerMediator(atom)) {
      return atom
    }

    // TODO: Check if this is the best way to do this.(type Predicates)
    if (isData(atom)) {
      return TriggerDataMediator.of(atom) as unknown as TriggerMediatorUnion
    } else if (isMutation(atom)) {
      return TriggerMutationMediator.of(atom) as unknown as TriggerMediatorUnion
    } else {
      throw (new TypeError('Invalid atom type!'))
    }
  }
}
