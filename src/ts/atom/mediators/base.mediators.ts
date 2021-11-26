import { isObject, isEmpty } from '../../internal/base'
import { pipe, compose } from '../../functional'

import { Vain } from '../vain'
import { isAtom, isData, isMutation, GC_DATA, GC_MUTATION } from '../atoms'

import type { AtomLike, BaseAtom, Data, Mutation } from '../atoms'

type AnyFunction = (...args: any[]) => any

/******************************************************************************************************
 *
 *                                           Mediator Predicatess
 *
 ******************************************************************************************************/

/**
 * @param { any } tar anything
 * @return { boolean } whether the target is an Mediator instance
 */
export const isMediator = <A extends BaseAtom>(tar: any): tar is BaseMediator<A> => isObject(tar) && tar.isMediator

/******************************************************************************************************
 *
 *                                           Mediator Classes
 *
 ******************************************************************************************************/

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

  get consumers (): BA['consumers'] { return this._atom.consumers }

  get isAtom (): boolean { return isAtom(this._atom) }

  get isData (): boolean { return isData(this._atom) }

  get isMutation (): boolean { return isMutation(this._atom) }

  get isEmpty (): boolean { return isEmpty(this._atom) }

  pipe (...args: Parameters<BA['pipe']>): ReturnType<BA['pipe']> {
    // ! do not use:
    // ! return this._atom.pipe(...args)
    return (pipe(...args) as AnyFunction)(this)
  }

  compose (...args: Parameters<BA['compose']>): ReturnType<BA['compose']> {
    // ! do not use:
    // ! return this._atom.compose(...args)

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
export abstract class DataMediator<I extends Data<any>, V> extends BaseMediator<Data<V>> implements AtomLike {
  get datar (): Data<V>['datar'] {
    return this._atom.datar
  }

  get value (): Data<V>['value'] {
    return this._atom.value
  }

  subscribe (...args: Parameters<I['subscribe']>): ReturnType<I['subscribe']> {
    // return this._atom.subscribe(...args) as ReturnType<I['subscribe']>
    // NOTE: for type support
    return this._atom.subscribe(args[0], args[1]) as ReturnType<I['subscribe']>
  }

  subscribeValue (...args: Parameters<I['subscribeValue']>): ReturnType<I['subscribeValue']> {
    // return this._atom.subscribeValue(...args) as ReturnType<I['subscribeValue']>
    // NOTE: for type support
    return this._atom.subscribeValue(args[0], args[1]) as ReturnType<I['subscribeValue']>
  }

  trigger (...args: Parameters<I['trigger']>): ReturnType<I['trigger']> {
    return this._atom.trigger(...args) as ReturnType<I['trigger']>
  }

  triggerValue (...args: Parameters<I['triggerValue']>): ReturnType<I['triggerValue']> {
    return this._atom.triggerValue(...args) as ReturnType<I['triggerValue']>
  }

  observe (...args: Parameters<I['observe']>): ReturnType<I['observe']> {
    // return this._atom.observe(...args) as ReturnType<I['observe']>
    // NOTE: for type support
    return this._atom.observe(args[0]) as ReturnType<I['observe']>
  }

  beObservedBy (...args: Parameters<I['beObservedBy']>): ReturnType<I['beObservedBy']> {
    // return this._atom.beObservedBy(...args) as ReturnType<I['beObservedBy']>
    // NOTE: for type support
    return this._atom.beObservedBy(args[0]) as ReturnType<I['beObservedBy']>
  }

  mutate (...args: Parameters<I['mutate']>): ReturnType<I['mutate']> {
    // return this._atom.mutate(...args) as ReturnType<I['mutate']>
    // NOTE: for type support
    return this._atom.mutate(args[0], args[1]) as ReturnType<I['mutate']>
  }

  registerTrigger (...args: Parameters<I['registerTrigger']>): ReturnType<I['registerTrigger']> {
    // return this._atom.registerTrigger(...args) as ReturnType<I['registerTrigger']>
    // NOTE: for type support
    return this._atom.registerTrigger(args[0], args[1]) as ReturnType<I['registerTrigger']>
  }

  release (): void {
    this._atom = GC_DATA as I
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
export abstract class MutationMediator<I extends Mutation<any, any>> extends BaseMediator<I> implements AtomLike {
  get mutator (): I['mutator'] {
    return this._atom.mutator
  }

  get transformation (): I['transformation'] {
    return this._atom.transformation
  }

  subscribe (...args: Parameters<I['subscribe']>): ReturnType<I['subscribe']> {
    // return this._atom.subscribe(...args) as ReturnType<I['subscribe']>
    // NOTE: for type support
    return this._atom.subscribe(args[0], args[1]) as ReturnType<I['subscribe']>
  }

  subscribeTransformation (...args: Parameters<I['subscribeTransformation']>): ReturnType<I['subscribeTransformation']> {
    // return this._atom.subscribeTransformation(...args) as ReturnType<I['subscribeTransformation']>
    // NOTE: for type support
    return this._atom.subscribeTransformation(args[0], args[1]) as ReturnType<I['subscribeTransformation']>
  }

  trigger (...args: Parameters<I['trigger']>): ReturnType<I['trigger']> {
    return this._atom.trigger(...args) as ReturnType<I['trigger']>
  }

  triggerTransformation (...args: Parameters<I['triggerTransformation']>): ReturnType<I['triggerTransformation']> {
    return this._atom.triggerTransformation(...args) as ReturnType<I['triggerTransformation']>
  }

  observe (...args: Parameters<I['observe']>): ReturnType<I['observe']> {
    // return this._atom.observe(...args) as ReturnType<I['observe']>
    // NOTE: for type support
    return this._atom.observe(args[0]) as ReturnType<I['observe']>
  }

  beObservedBy (...args: Parameters<I['beObservedBy']>): ReturnType<I['beObservedBy']> {
    // return this._atom.beObservedBy(...args) as ReturnType<I['beObservedBy']>
    // NOTE: for type support
    return this._atom.beObservedBy(args[0]) as ReturnType<I['beObservedBy']>
  }

  mutate (...args: Parameters<I['mutate']>): ReturnType<I['mutate']> {
    // return this._atom.mutate(...args) as ReturnType<I['mutate']>
    // NOTE: for type support
    return this._atom.mutate(args[0], args[1]) as ReturnType<I['mutate']>
  }

  registerTrigger (...args: Parameters<I['registerTrigger']>): ReturnType<I['registerTrigger']> {
    // return this._atom.registerTrigger(...args) as ReturnType<I['registerTrigger']>
    // NOTE: for type support
    return this._atom.registerTrigger(args[0], args[1]) as ReturnType<I['registerTrigger']>
  }

  release (): void {
    this._atom = GC_MUTATION as I
  }
}
