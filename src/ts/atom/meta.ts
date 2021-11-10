import { isUndefined, isString, isObject, isFunction } from '../internal/base'
import { looseCurryN } from '../functional'

/**
 *    Metas
 * Void       -> Void's role in Atom world is same as undefined & null 's role in normal JavaScript world.
 *               It is designed to replace values that can be converted to false, such as undefined & null.
 *               So falsy values can flowing through the Atoms as normal values flowing.
 *               For the typical usages, please check nilToVoidT & defaultT.
 * Terminator -> Terminator is designed as a signal for "interruption" of Atom Flow.
 *               Mutation will not mutate(trigger an operation to update the downstream data's value)
 *                 a Data or Datar which value is Terminator.
 *               Data will not mutate(update own value to income operation's result) a Mutation or Mutator or Operation
 *                 which result is Terminator.
 *               For the typical usages, please check filterT or skipT or takeT.
 * Vacuo      -> A value that can serve as the value (for Datar, or operation for Mutator)
 *                 of Datar and Mutator at the same time.
 * Datar      -> Designed to carry the value of Data.
 * Mutator    -> Designed to carry the operation of Mutation.
 */

export const isDatar = tar => isObject(tar) && tar.isDatar
export const isMutator = tar => isObject(tar) && tar.isMutator

export const isVoid = tar => isObject(tar) && tar.isVoid
export const isTerminator = tar => isObject(tar) && tar.isTerminator
export const isVacuo = tar => isFunction(tar) && tar.isVacuo

/**
 *—————————————————————————————————————————————— Nothing Particle ————————————————————————————————————————————————————
 */
/**
 *
 */
export class Void {
  get isVoid () { return true }
}
export const VOID = new Void()

/**
 *—————————————————————————————————————————————— Terminator Particle ————————————————————————————————————————————————————
 */
/**
 *
 */
export class Terminator {
  get isTerminator () { return true }
}
export const TERMINATOR = new Terminator()

/**
 *—————————————————————————————————————————————— Vacuo Particle ————————————————————————————————————————————————————
 */
/**
 * 利用 JavaScript Function is also an Object 的特性，
 * 使 Vacuo 既能够作为 Datar.of() 也能作为 Mutator.of() 的参数，
 * 从而实现 Empty Datar 和 Empty Mutator。
 *
 * 因为要兼容浏览器扩展的执行环境，所以 class Vacuo extends Function 语法无法使用
 *   -> Refer: https://developer.chrome.com/docs/apps/contentSecurityPolicy/
 */
export const Vacuo = () => {
  const internalVacuo = function () {}
  Object.defineProperty(internalVacuo, 'isVacuo', {
    get: () => { return true }
  })
  Object.defineProperty(internalVacuo, 'isEmpty', {
    get: () => { return true }
  })
  return internalVacuo
}
export const VACUO = Vacuo()

/**
 *—————————————————————————————————————————————— Datar Particle ————————————————————————————————————————————————————
 */
/**
 *
 */
export class Datar {
  constructor (value, mutator = VACUO, options = {}) {
    if (!isUndefined(mutator) && !isMutator(mutator) && !isVacuo(mutator)) {
      throw (new TypeError(
        `The 2nd parameter of Datar's constructor is expected to be type of "Mutator" | "Vacuo" | "Undefined", but received "${typeof mutator}".`
      ))
    }

    this._options = options

    this.value = value
    this.mutator = mutator
  }

  static of (value, mutator = undefined, options = {}) {
    return new Datar(value, mutator, options)
  }

  static empty () {
    return new Datar(VACUO)
  }

  get isDatar () { return true }

  get isEmpty () { return isVacuo(this.value) }

  /**
   * @param { Mutator | Vacuo } mutator
   * @return { Datar } this(Datar)
   */
  fill (mutator) {
    if (!isMutator(mutator) && !isVacuo(mutator)) {
      throw (new TypeError(
        `The 1st parameter of Datar's fill method is expected to be type of "Mutator" | "Vacuo", but received "${typeof mutator}".`
      ))
    }
    this.mutator = mutator
    return this
  }

  fillEmpty () {
    this.mutator = VACUO
    return this
  }

  fillAuto (mutator = VACUO) {
    return this.fill(mutator)
  }

  /**
   * Rarely used, this method exists to ensure the symmetry of Datar and Mutator.
   *
   * @param { Mutator | Vacuo } mutator default to VACUO
   * @return { function | Vacuo } operation function | Vacuo
   */
  run (mutator = VACUO, ...args) {
    if (!isMutator(mutator) && !isVacuo(mutator)) {
      throw (new TypeError(
        `The 1st parameter of Datar's run method is expected to be type of "Mutator" | "Vacuo", but received "${typeof mutator}".`
      ))
    }
    // return operation or vacuo
    return isMutator(mutator) ? mutator.operation : mutator
  }
}

/**
 *—————————————————————————————————————————————— Mutator Particle ————————————————————————————————————————————————————
 */
/**
 * @param { any } operation
 */
const checkOperation = operation => {
  if (!isFunction(operation)) {
    throw (new TypeError(`"operation" is expected to be type of "Function", but received "${typeof operation}".`))
  }
}
/**
 * @param { any } tar
 * @return { boolean } true | false
 */
const isValidOperationTarget = tar => isDatar(tar) || isVacuo(tar)
/**
 *
 */
export class Mutator {
  constructor (operation, datar = VACUO, options = {}) {
    if (!isUndefined(datar) && !isValidOperationTarget(datar)) {
      throw (new TypeError(
        `The 2nd parameter of Mutator's constructor is expected to be type of "Datar" | "Vacuo" | "Undefined", but received "${typeof datar}".`
      ))
    }
    checkOperation(operation)

    this._options = options

    this.operation = operation
    this.datar = datar
  }

  static of (operation, datar = undefined, options = {}) {
    return new Mutator(operation, datar, options)
  }

  static empty () {
    return new Mutator(VACUO)
  }

  get isMutator () { return true }

  get isEmpty () { return isVacuo(this.operation) }

  static checkOperation (operation) {
    checkOperation(operation)
  }

  static isValidOpTar (tar) {
    return isValidOperationTarget(tar)
  }

  static isValidOperationTarget (tar) {
    return isValidOperationTarget(tar)
  }

  /**
   * Dispatch opration to correct lift method according to the given options.
   *
   * @param { function } operation
   * @param { { type: 'both' | 'left' | 'right' } } options
   */
  static lift (operation, options) {
    if (!options) {
      throw (new TypeError(`"options" is required for lift method of Mutator, but received "${options}".`))
    }
    if (!isObject(options)) {
      throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
    }
    const { type } = options

    if (!isString(type)) {
      throw (new TypeError(`"type" is expected to be type of "String", but received "${typeof type}".`))
    }

    if (type === 'both') {
      return this.liftBoth(operation)
    } else if (type === 'left') {
      return this.liftLeft(operation)
    } else if (type === 'right') {
      return this.liftRight(operation)
    } else {
      throw (new TypeError(`"type" is expected be one of "both" | "left" | "right", but received "${type}".`))
    }
  }

  /**
   * Automatically unwrap both left & right param to value.
   *
   * @param { function } operation
   * @return { function } curried function(2, loose)
   */
  static liftBoth (operation) {
    checkOperation(operation)
    return looseCurryN(2, (prevDatar, datar, ...args) => {
      return operation(
        isValidOperationTarget(prevDatar) ? prevDatar.value : prevDatar,
        isValidOperationTarget(datar) ? datar.value : datar,
        ...args
      )
    })
  }

  /**
   * Automatically unwrap left param to value， keep right param Datar.
   *
   * @param { function } operation
   * @return { function } curried function(2, loose)
   */
  static liftLeft (operation) {
    checkOperation(operation)
    return looseCurryN(2, (prevDatar, datar, ...args) => {
      return operation(
        isValidOperationTarget(prevDatar) ? prevDatar.value : prevDatar,
        datar,
        ...args
      )
    })
  }

  /**
   * Automatically unwrap right param to value， keep left param Datar.
   *
   * @param { function } operation
   * @return { function } curried function(2, loose)
   */
  static liftRight (operation) {
    checkOperation(operation)
    return looseCurryN(2, (prevDatar, datar, ...args) => {
      return operation(
        prevDatar,
        isValidOperationTarget(datar) ? datar.value : datar,
        ...args
      )
    })
  }

  /**
   * @param { Datar | Vacuo } mutator
   * @return { Mutator } this(Mutator)
   */
  fill (datar) {
    if (!isValidOperationTarget(datar)) {
      throw (new TypeError(
        `The 1st parameter of Mutator's fill method is expected to be type of "Datar" | "Vacuo", but received "${typeof mutator}".`
      ))
    }
    this.datar = datar
    return this
  }

  fillEmpty () {
    this.datar = VACUO
    return this
  }

  fillAuto (datar = VACUO) {
    return this.fill(datar)
  }

  /**
   * Atom Flow: Data A -> Mutation -> Data B
   *
   *   -> Data A is observed by Mutation, Mutation is observed by Data B;
   *
   *   -> Data A emits a datar, Mutation takes that datar as the 1st parameter of operation;
   *
   *   -> Mutation takes datar from Data A, then emits a mutator, Data B will take that mutator;
   *
   *   -> Data B takes mutator from Mutation, then pass its own datar to that mutator's operation as the 2nd parameter;
   *
   *   -> The operation evaluates while it has both two parameters, the result will be wrapped in a new datar;
   *
   *   -> The new datar will be the new datar of Data B.
   *
   * @param { Datar | Vacuo } datar default to VACUO
   * @return { any }
   */
  run (datar = VACUO, ...args) {
    // 保证 Mutator 的 operation 接收到的两个必要参数都是合法的操作对象
    return this.operation(this.datar, isValidOperationTarget(datar) ? datar : Datar.of(datar), ...args)
  }
}
