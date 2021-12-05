import { isObject, isString, isPlainObject, isFunction } from '../internal/base'

import { Vain } from './vain'
import { VACUO, isVacuo } from './metas'

import type { Vacuo } from './metas'
import type { Data, Mutation } from './atoms'

/******************************************************************************************************
 *                                                Particles
 *
 * Chaos      -> Chaos of Datar & Mutator.
 *
 * Datar      -> Designed to carry the value of Data.
 *
 * Mutator    -> Designed to carry the transformation of Mutation.
 ******************************************************************************************************/

export enum ParticleType {
  Chaos = '[particle Chaos]',
  Datar = '[particle Datar]',
  Mutator = '[particle Mutator]'
}

/******************************************************************************************************
 *
 *                                           Particle Predicates
 *
 ******************************************************************************************************/

/**
 * @param tar anything
 * @return { boolean } whether the target is a Particle instance
 */
export const isParticle = (tar: any): tar is Particle => isObject(tar) && tar.isParticle
/**
  * @param tar anything
  * @return { boolean } whether the target is a Chaos instance
  */
export const isChaos = (tar: any): tar is Chaos => isObject(tar) && tar.isChaos
/**
  * @param tar anything
  * @return { boolean } whether target is a Datar instance
  */
export const isDatar = <V = any>(tar: any): tar is Datar<V> =>
  isObject(tar) && tar.isDatar
/**
  * @param tar anything
  * @return { boolean } whether target is a Mutator instance
  */
export const isMutator = <P = any, C = any>(tar: any): tar is Mutator<P, C> =>
  isObject(tar) && tar.isMutator

/******************************************************************************************************
 *
 *                                           Particle Classes
 *
 ******************************************************************************************************/

/**
 *
 */
interface BaseParticleOptions {
  isHPMode?: boolean
}
export const DEFAULT_BASEPARTICLE_OPTIONS: Required<BaseParticleOptions> = {
  isHPMode: true
}
/**
 * Base particle class.
 */
export abstract class Particle extends Vain {
  isParticle: true

  constructor () {
    super()
    this.isParticle = true

    if (new.target === Particle) {
      throw new Error('Particle class can not be instantiated!')
    }
  }

  abstract get particleType (): ParticleType
}

/**
 *—————————————————————————————————————————————— Chaos Meta ————————————————————————————————————————————————————
 */

/**
 *
 */
export class Chaos extends Particle {
  isChaos: true
  value: Vacuo
  transformation: Vacuo

  constructor () {
    super()
    this.isChaos = true
    this.value = VACUO
    this.transformation = VACUO
  }

  get type (): ParticleType { return ParticleType.Chaos }
  get particleType (): ParticleType { return ParticleType.Chaos }
}
export const CHAOS = new Chaos()

/**
 *—————————————————————————————————————————————— Datar Meta ————————————————————————————————————————————————————
 */

/**
 *
 */
export interface DatarOptions extends BaseParticleOptions {}
export const DEFAULT_DATAR_OPTIONS: Required<DatarOptions> = {
  ...DEFAULT_BASEPARTICLE_OPTIONS
}
type MutatorOfDatar<V = any>
  = Mutator<any, V>
  | Chaos

/**
 * @return { boolean } whether the target is a valid mutator of datar
 */
export const isValidMutatorOfDatar = <P = any, C = any>(tar: any): tar is Mutator<P, C> =>
  isChaos(tar) || isMutator(tar)

/**
 * Designed to carry the value of Data.
 *
 * @param [options.isHPMode = true] whether the datar is in HPMode, when in HPMode,
 *                                              the mutator of datar will always be Chaos.
 */
export class Datar<V = any> extends Particle {
  value: V
  options: Required<DatarOptions>
  mutator: MutatorOfDatar<V>

  constructor (
    value: V, mutator: MutatorOfDatar<V> = CHAOS, options: DatarOptions = DEFAULT_DATAR_OPTIONS
  ) {
    super()
    if (!isValidMutatorOfDatar(mutator)) {
      throw (new TypeError('"mutator" is expected to be type of "Mutator" | "null".'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    this.options = { ...DEFAULT_DATAR_OPTIONS, ...options }

    const { isHPMode } = this.options

    this.value = value

    if (!isHPMode) {
      this.mutator = mutator
    } else {
      this.mutator = CHAOS
    }
  }

  get type (): ParticleType { return ParticleType.Datar }
  get particleType (): ParticleType { return ParticleType.Datar }

  /**
   * Same as `new Datar()`.
   */
  static of <V>(
    value: V, mutator: MutatorOfDatar<V> = CHAOS, options: DatarOptions = {}
  ): Datar<V> {
    // `options` will be complemented in `new Datar()`.
    return new Datar(value, mutator, options)
  }

  static empty (options: DatarOptions = DEFAULT_DATAR_OPTIONS): Datar<Vacuo> {
    // `options` will be complemented in `new Datar()`.
    return new Datar(VACUO, CHAOS, options)
  }

  get isDatar (): true { return true }

  get isEmpty (): boolean { return isVacuo(this.value) }

  /**
   * @param mutator
   * @return { Datar } this
   */
  fill (mutator: MutatorOfDatar<V>): this {
    if (!isMutator(mutator)) {
      throw (new TypeError('"mutator" is expected to be type of "Mutator".'))
    }
    this.mutator = mutator
    return this
  }

  /**
   * Rarely used, this method exists to ensure the symmetry of Datar and Mutator.
   *
   * @param mutator the mutator to be applied
   * @param args exists for the symmetry of Mutator.run
   * @return { MutatorOfDatar<V>['transformation'] } transformation function of specified mutator
   */
  run <M extends Mutator<V, any>>(mutator: M, data?: Data<V>, ...args: any[]): M['transformation'] {
    if (!isMutator(mutator)) {
      throw (new TypeError('"mutator" is expected to be type of "Mutator".'))
    }
    return mutator.transformation
  }
}

/**
 *—————————————————————————————————————————————— Mutator Meta ————————————————————————————————————————————————————
 */

/**
  *
  */
export interface TransformationLiftOptions {
  position?: 'unknown' | 'both' | 'left' | 'right' | 'none'
}
export const DEFAULT_TRANSFORMATION_LIFT_OPTIONS: Required<TransformationLiftOptions> = {
  position: 'both'
}

export interface MutatorOptions extends BaseParticleOptions {
  lift?: TransformationLiftOptions
}
export const DEFAULT_MUTATOR_OPTIONS: Required<MutatorOptions> = {
  ...DEFAULT_BASEPARTICLE_OPTIONS,
  lift: DEFAULT_TRANSFORMATION_LIFT_OPTIONS
}

export type MutatorTransformation<P = any, C = any> =
  (prev: Chaos | Datar<P>, cur: Datar<C>, mutation?: Mutation<P, C>, ...args: any[]) => C
type DatarOfMutator<V = any> = Datar<V> | Chaos

/**
 * Predicate whether the target is a valid datar of mutator, i.e. Chaos or Datar.
 */
export const isValidDatarOfMutator = <V = any>(tar: any): tar is DatarOfMutator<V> =>
  isChaos(tar) || isDatar(tar)

export type LiftBothTransformation<P = any, C = any> = (prev: Vacuo | P, cur: C, mutation?: Mutation<P, C>, ...args: any[]) => C
export type LiftLeftTransformation<P = any, C = any> = (prev: Vacuo | P, cur: Datar<C>, mutation?: Mutation<P, C>, ...args: any[]) => C
export type LiftRightTransformation<P = any, C = any> = (prev: Chaos | Datar<P>, cur: C, mutation?: Mutation<P, C>, ...args: any[]) => C
export type MutatorOriginTransformationUnion<P = any, C = any>
  = MutatorTransformation<P, C>
  | LiftBothTransformation<P, C>
  | LiftLeftTransformation<P, C>
  | LiftRightTransformation<P, C>

/**
 * Designed to carry the transformation of Mutation.
 */
export class Mutator<P = any, C = any> extends Particle {
  transformation: MutatorTransformation<P, C>
  options: Required<MutatorOptions>
  datar: DatarOfMutator<P>

  constructor (
    transformation: MutatorTransformation<P, C>, datar: DatarOfMutator<P> = CHAOS, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ) {
    super()
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    if (!isValidDatarOfMutator(datar)) {
      throw (new TypeError('"datar" is expected to be type of "Datar" | "null".'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    // When make Mutator using bare `Mutator.of` or bare `new Mutator()` without specify `lift`,
    //   set it to `'unknown'` by default.
    if (options.lift === undefined) {
      options.lift = { position: 'unknown' as const }
    }

    this.options = { ...DEFAULT_MUTATOR_OPTIONS, ...options }

    const { isHPMode } = options

    this.transformation = transformation
    // NOTE: Mutator's execute is lazy, so it's HPMode is not like Datar's.
    // It's not necessary to make an extremely strict HPMode.
    this.datar = datar
  }

  get type (): ParticleType { return ParticleType.Mutator }
  get particleType (): ParticleType { return ParticleType.Mutator }

  static of <P, C>(
    transformation: MutatorTransformation<P, C>, datar: DatarOfMutator<P> = CHAOS, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    // `options` will be completed in constructor.
    return new Mutator(transformation, datar, options)
  }

  static ofLift <P, C>(
    transformation: LiftBothTransformation<P, C>
    | LiftLeftTransformation<P, C>
    | LiftRightTransformation<P, C>
    | MutatorTransformation<P, C>,
    options: MutatorOptions | TransformationLiftOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const isMutatorOptions = (tar: any): tar is MutatorOptions => tar.lift !== undefined
    if (isMutatorOptions(options)) {
      const _options = { ...DEFAULT_MUTATOR_OPTIONS, ...options }
      return this.of(this.lift(transformation, _options.lift), undefined, _options)
    } else {
      const _options = { ...DEFAULT_MUTATOR_OPTIONS, lift: options }
      return this.of(this.lift(transformation, options), undefined, _options)
    }
  }

  static ofLiftBoth <P, C>(
    transformation: LiftBothTransformation<P, C>, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const _options = { ...DEFAULT_MUTATOR_OPTIONS, ...options, lift: { position: 'both' as const } }
    return this.of(this.liftBoth(transformation), undefined, _options)
  }

  static ofLiftLeft <P, C>(
    transformation: LiftLeftTransformation<P, C>, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const _options = { ...DEFAULT_MUTATOR_OPTIONS, ...options, lift: { position: 'left' as const } }
    return this.of(this.liftLeft(transformation), undefined, _options)
  }

  static ofLiftRight <P, C>(
    transformation: LiftRightTransformation<P, C>, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const _options = { ...DEFAULT_MUTATOR_OPTIONS, ...options, lift: { position: 'right' as const } }
    return this.of(this.liftRight(transformation), undefined, _options)
  }

  static empty (options: MutatorOptions = {}): Mutator<any, Vacuo> {
    return new Mutator(VACUO, CHAOS, options)
  }

  get isMutator (): true { return true }

  get isEmpty (): boolean { return isVacuo(this.transformation) }

  /**
   * Dispatch transformation to correct lift method according to the given options.
   *
   * @param transformation
   * @param [options = DEFAULT_TRANSFORMATION_LIFT_OPTIONS] default to `{ position: 'both' }`
   */
  static lift <P, C>(
    transformation: LiftBothTransformation<P, C>
    | LiftLeftTransformation<P, C>
    | LiftRightTransformation<P, C>
    | MutatorTransformation<P, C>,
    options: TransformationLiftOptions = DEFAULT_TRANSFORMATION_LIFT_OPTIONS
  ): MutatorTransformation<P, C> {
    // transformation will be checked in the specific lift method later
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }
    const { position } = { ...DEFAULT_TRANSFORMATION_LIFT_OPTIONS, ...options }

    if (!isString(position)) {
      throw (new TypeError('"type" is expected to be type of "String".'))
    }

    if (options.position === 'none' || options.position === 'unknown') {
      return transformation as MutatorTransformation<P, C>
    } else if (options.position === 'both') {
      return this.liftBoth(transformation as LiftBothTransformation<P, C>)
    } else if (options.position === 'left') {
      return this.liftLeft(transformation as LiftLeftTransformation<P, C>)
    } else if (options.position === 'right') {
      return this.liftRight(transformation as LiftRightTransformation<P, C>)
    } else {
      throw (new TypeError('"type" is expected be one of "none" | "both" | "left" | "right".'))
    }
  }

  /**
   * Automatically unwrap both left & right param to value.
   *
   * @param transformation
   * @return { AnyFunction } wrapped transformation function
   */
  static liftBoth <P, C>(transformation: LiftBothTransformation<P, C>): MutatorTransformation<P, C> {
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    return (prevDatar, datar, ...args) => {
      return transformation(prevDatar.value, datar.value, ...args)
    }
  }

  /**
   * Automatically unwrap left param to value, keep right param Datar.
   *
   * @param transformation
   * @return { function } wrapped transformation function
   */
  static liftLeft <P, C>(transformation: LiftLeftTransformation<P, C>): MutatorTransformation<P, C> {
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    return (prevDatar, datar, ...args) => {
      return transformation(prevDatar.value, datar, ...args)
    }
  }

  /**
   * Automatically unwrap right param to value, keep left param Datar.
   *
   * @param transformation
   * @return { function } wrapped transformation function
   */
  static liftRight <P, C>(transformation: LiftRightTransformation<P, C>): MutatorTransformation<P, C> {
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    return (prevDatar, datar, ...args) => {
      return transformation(prevDatar, datar.value, ...args)
    }
  }

  /**
   * @param datar
   * @return { Mutator } this
   */
  fill (datar: Datar<P>): this {
    if (!isDatar(datar)) {
      throw (new TypeError('"datar" is expected to be type of "Datar".'))
    }
    this.datar = datar
    return this
  }

  /**
   * Given Atom Flow: Data A -> Mutation -> Data B
   *
   *   -> Data A is observed by Mutation, Mutation is observed by Data B;
   *
   *   -> Data A emits a datar, Mutation takes that datar as the 1st parameter of transformation;
   *
   *   -> Mutation takes datar from Data A, then emits a mutator, Data B will take that mutator;
   *
   *   -> Data B takes mutator from Mutation, then pass its own datar to that mutator's transformation as the 2nd parameter;
   *
   *   -> The transformation evaluates while it has both two parameters, the result will be wrapped in a new datar;
   *
   *   -> The new datar will be the new datar of Data B.
   *
   * @param datar the datar to be passed to the transformation as 2nd parameter
   * @param args the rest of the arguments (3rd and after) to be passed to the transformation
   * @return { ReturnType<MT> } Return type of transformation
   */
  run (datar: Datar<C>, mutation?: Mutation<P, C>, ...args: any[]): ReturnType<MutatorTransformation<P, C>> {
    if (!isDatar(datar)) {
      throw (new TypeError('"datar" is expected to be type of "Datar".'))
    }
    return this.transformation(this.datar, datar, mutation, ...args)
  }
}
