import { isObject, isString, isPlainObject, isFunction } from '../internal/base'

import { Vain } from './vain'
import { VACUO, isVacuo } from './metas'

import type { Vacuo } from './metas'
import type { DataLike, MutationLike } from './atoms'

/******************************************************************************************************
 *                                                Particles
 *
 * Chaos      -> Chaos of Datar & Mutator.
 *
 * Datar      -> Designed to carry the value of Data.
 *
 * Mutator    -> Designed to carry the transformation of Mutation.
 ******************************************************************************************************/

/**
 * Number of particles is finite. Using a `enum` to group them is reasonable.
 */
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
 * @param target anything
 * @return { boolean } whether the target is a Particle instance
 */
export const isParticle = (target: any): target is Particle => isObject(target) && target.isParticle
/**
  * @param target anything
  * @return { boolean } whether the target is a Chaos instance
  */
export const isChaos = (target: any): target is Chaos => isObject(target) && target.isChaos
/**
  * @param target anything
  * @return { boolean } whether target is a Datar instance
  */
export function isDatar <V = any> (target: Datar<V>): target is Datar<V>
export function isDatar <V = any> (target: unknown): target is Datar<V>
export function isDatar <V = any> (target: any): target is Datar<V> {
  return isObject(target) && target.isDatar
}
/**
  * @param target anything
  * @return { boolean } whether target is a Mutator instance
  */
export function isMutator <P = any, C = any> (target: Mutator<P, C>): target is Mutator<P, C>
export function isMutator <P = any, C = any> (target: unknown): target is Mutator<P, C>
export function isMutator <P = any, C = any> (target: any): target is Mutator<P, C> {
  return isObject(target) && target.isMutator
}

/******************************************************************************************************
 *
 *                                           Particle Classes
 *
 ******************************************************************************************************/

/**
 *
 */
export interface BaseParticleOptions {
  /**
   * HP, aka. High Performance
   */
  isHPMode?: boolean
}
export const DEFAULT_BASE_PARTICLE_OPTIONS: Required<BaseParticleOptions> = {
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
/**
 * Global Chaos instance.
 * @see {@link Chaos}
 */
export const CHAOS = new Chaos()

/**
 *—————————————————————————————————————————————— Datar Meta ————————————————————————————————————————————————————
 */

/**
 *
 */
export interface DatarOptions extends BaseParticleOptions {}
export const DEFAULT_DATAR_OPTIONS: Required<DatarOptions> = {
  ...DEFAULT_BASE_PARTICLE_OPTIONS
}
/**
 * mutator of datar's output type should be same as datar's value type.
 */
type MutatorOfDatar<V = any> = Mutator<unknown, V>
type ValidMutatorOfDatar<V = any> =
  | Mutator<any, V>
  | Chaos

/**
 * @return { boolean } whether the target is a valid mutator of datar
 */
export function isValidMutatorOfDatar <V = any> (target: ValidMutatorOfDatar<V>): target is ValidMutatorOfDatar<V>
export function isValidMutatorOfDatar <V = any> (target: unknown): target is ValidMutatorOfDatar<V>
export function isValidMutatorOfDatar <V = any> (target: any): target is ValidMutatorOfDatar<V> {
  return isChaos(target) || isMutator(target)
}

/**
 * Designed to carry the value of Data.
 *
 * @param [options.isHPMode = true] whether the datar is in HPMode, when in HPMode,
 *                                              the mutator of datar will always be Chaos.
 */
export class Datar<V = any> extends Particle {
  value: V
  options: Required<DatarOptions>
  mutator: ValidMutatorOfDatar<V>

  constructor (
    value: V, mutator: ValidMutatorOfDatar<V> = CHAOS, options: DatarOptions = DEFAULT_DATAR_OPTIONS
  ) {
    super()
    if (!isValidMutatorOfDatar(mutator)) {
      throw (new TypeError('"mutator" is expected to be type of "Mutator" | "Chaos".'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    this.options = { ...DEFAULT_DATAR_OPTIONS, ...options }

    const { isHPMode } = this.options

    this.value = value

    // If the datar is in HPMode, the mutator will always be Chaos.
    // So it won't occpy much memory.
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
  static of <V = any>(
    value: V, mutator: ValidMutatorOfDatar<V> = CHAOS, options: DatarOptions = DEFAULT_DATAR_OPTIONS
  ): Datar<V> {
    return new Datar(value, mutator, options)
  }

  /**
   * When we create a new datar instance with `Datar.empty`, its value will be `VACUO` for sure.
   * But the reason we create a empty datar is to contain some type of value in the future.
   * The `const someDatar = Datar.empty() as Datar<any>` seems inevitable.
   * It is advisable to always set a initial value for any type of value.
   */
  static empty (options: DatarOptions = DEFAULT_DATAR_OPTIONS): Datar<Vacuo> {
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
   * @return transformation function of specified mutator
   */
  run <M extends Mutator<V, any>>(mutator: M, data?: DataLike<V>, ...args: any[]): M['transformation'] {
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
export type TransformationLiftPositions = 'unknown' | 'both' | 'left' | 'right' | 'none'
export interface TransformationLiftOptions {
  position?: TransformationLiftPositions
}
export const DEFAULT_TRANSFORMATION_LIFT_OPTIONS: Required<TransformationLiftOptions> = {
  position: 'both'
}

export interface MutatorOptions extends BaseParticleOptions {
  lift?: TransformationLiftOptions
}
export const DEFAULT_MUTATOR_OPTIONS: Required<MutatorOptions> = {
  ...DEFAULT_BASE_PARTICLE_OPTIONS,
  lift: DEFAULT_TRANSFORMATION_LIFT_OPTIONS
}
const _isValidMutatorOptions = (tar: any): tar is MutatorOptions => {
  return isPlainObject(tar) && isPlainObject(tar.lift) && tar.lift.position !== undefined
}

export type MutatorTransformation<P = any, C = any, Contexts extends any[] = any[]> =
  (previous: Chaos | Datar<P>, current: Datar<C>, mutation?: MutationLike<P, C>, ...contexts: Contexts) => C
type DatarOfMutator<P = any, C = any> = Datar<P>
type ValidDatarOfMutator<P = any, C = any> = Datar<P> | Chaos

/**
 * Predicate whether the target is a valid datar of mutator, i.e. Chaos or Datar.
 */
export function isValidDatarOfMutator <P = any, C = any> (target: ValidDatarOfMutator<P, C>): target is ValidDatarOfMutator<P, C>
export function isValidDatarOfMutator <P = any, C = any> (target: unknown): target is ValidDatarOfMutator<P, C>
export function isValidDatarOfMutator <P = any, C = any> (target: any): target is ValidDatarOfMutator<P, C> {
  return isChaos(target) || isDatar(target)
}

export type LiftBothTransformation<P = any, C = any, Contexts extends any[] = any[]> =
  (previous: Vacuo | P, current: C, mutation?: MutationLike<P, C>, ...contexts: Contexts) => C
export type LiftLeftTransformation<P = any, C = any, Contexts extends any[] = any[]> =
  (previous: Vacuo | P, current: Datar<C>, mutation?: MutationLike<P, C>, ...contexts: Contexts) => C
export type LiftRightTransformation<P = any, C = any, Contexts extends any[] = any[]> =
  (previous: Chaos | Datar<P>, current: C, mutation?: MutationLike<P, C>, ...contexts: Contexts) => C
export type MutatorOriginalTransformationUnion<P = any, C = any, Contexts extends any[] = any[]> =
  | MutatorTransformation<P, C, Contexts>
  | LiftBothTransformation<P, C, Contexts>
  | LiftLeftTransformation<P, C, Contexts>
  | LiftRightTransformation<P, C, Contexts>

/**
 * Designed to carry the transformation of Mutation.
 */
export class Mutator<P = any, C = any> extends Particle {
  transformation: MutatorTransformation<P, C>
  options: Required<MutatorOptions>
  datar: ValidDatarOfMutator<P, C>

  constructor (
    transformation: MutatorTransformation<P, C>, datar: ValidDatarOfMutator<P> = CHAOS, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ) {
    super()
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    if (!isValidDatarOfMutator(datar)) {
      throw (new TypeError('"datar" is expected to be type of "Datar".'))
    }
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    // When make Mutator using bare `Mutator.of` or bare `new Mutator()` without specify `lift`,
    //   mark its position as `'unknown'` by default.
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

  static of <P = any, C = any>(
    transformation: MutatorTransformation<P, C>, datar: ValidDatarOfMutator<P> = CHAOS, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    return new Mutator(transformation, datar, options)
  }

  static ofLift <P = any, C = any>(
    transformation: MutatorOriginalTransformationUnion<P, C>, options: MutatorOptions | TransformationLiftOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const preparedOptions = _isValidMutatorOptions(options)
      ? { ...DEFAULT_MUTATOR_OPTIONS, ...options }
      : { ...DEFAULT_MUTATOR_OPTIONS, lift: options }
    return this.of(this.lift(transformation, preparedOptions.lift), undefined, preparedOptions)
  }

  static ofLiftBoth <P, C>(
    transformation: LiftBothTransformation<P, C>, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const preparedOptions = { ...DEFAULT_MUTATOR_OPTIONS, ...options, lift: { ...(options.lift ?? {}), position: 'both' as const } }
    return this.of(this.liftBoth(transformation), undefined, preparedOptions)
  }

  static ofLiftLeft <P, C>(
    transformation: LiftLeftTransformation<P, C>, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const preparedOptions = { ...DEFAULT_MUTATOR_OPTIONS, ...options, lift: { ...(options.lift ?? {}), position: 'left' as const } }
    return this.of(this.liftLeft(transformation), undefined, preparedOptions)
  }

  static ofLiftRight <P, C>(
    transformation: LiftRightTransformation<P, C>, options: MutatorOptions = DEFAULT_MUTATOR_OPTIONS
  ): Mutator<P, C> {
    const preparedOptions = { ...DEFAULT_MUTATOR_OPTIONS, ...options, lift: { ...(options.lift ?? {}), position: 'right' as const } }
    return this.of(this.liftRight(transformation), undefined, preparedOptions)
  }

  static empty (options: MutatorOptions = {}): Mutator<any, Vacuo> {
    // `options` will be complemented in `new Mutator()`
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
  static lift <P = any, C = any>(
    transformation: MutatorOriginalTransformationUnion<P, C>, options: TransformationLiftOptions = DEFAULT_TRANSFORMATION_LIFT_OPTIONS
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
      throw (new TypeError('"type" is expected be one of "none" | "both" | "left" | "right" | "unknown".'))
    }
  }

  /**
   * Automatically unwrap both previous datar & current datar to value.
   *
   * @param transformation
   * @return { AnyFunction } wrapped transformation function
   */
  static liftBoth <P = any, C = any>(transformation: LiftBothTransformation<P, C>): MutatorTransformation<P, C> {
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    return (prevDatar, datar, ...args) => {
      return transformation(prevDatar.value, datar.value, ...args)
    }
  }

  /**
   * Automatically unwrap previous datar to value, keep current datar.
   *
   * @param transformation
   * @return { function } wrapped transformation function
   */
  static liftLeft <P = any, C = any>(transformation: LiftLeftTransformation<P, C>): MutatorTransformation<P, C> {
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    return (prevDatar, datar, ...args) => {
      return transformation(prevDatar.value, datar, ...args)
    }
  }

  /**
   * Automatically unwrap current datar to value, keep previous datar.
   *
   * @param transformation
   * @return { function } wrapped transformation function
   */
  static liftRight <P = any, C = any>(transformation: LiftRightTransformation<P, C>): MutatorTransformation<P, C> {
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
  fill (datar: DatarOfMutator<P, C>): this {
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
   *   -> Data A emits a datar, Mutation takes that datar as the 1st parameter of its inner transformation;
   *
   *   -> Mutation takes datar from Data A, then emits a mutator, Data B will take that mutator;
   *
   *   -> Data B takes mutator from Mutation, then pass its own datar to that mutator's transformation as the 2nd parameter;
   *
   *   -> The transformation evaluates while it has both two parameters, the result will be wrapped in a new datar;
   *
   *   -> The new datar of transformation's evaluate result will be the new datar of Data B.
   *
   * @param datar the datar to be passed to the transformation as 2nd parameter
   * @param args the rest of the arguments (3rd and after) to be passed to the transformation
   * @return Return type of transformation
   */
  run (datar: Datar<C>, mutation?: MutationLike<P, C>, ...args: any[]): C {
    if (!isDatar(datar)) {
      throw (new TypeError('"datar" is expected to be type of "Datar".'))
    }
    return this.transformation(this.datar, datar, mutation, ...args)
  }
}
