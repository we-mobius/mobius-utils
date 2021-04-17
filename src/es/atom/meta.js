import { isUndefined, isString, isObject, isFunction } from '../internal/base.js'
import { looseCurryN } from '../functional.js'

// metas
// Terminator
// Vacuo
// Datar
// Mutator

export const isDatar = tar => isObject(tar) && tar.isDatar
export const isMutator = tar => isObject(tar) && tar.isMutator

export const isVoid = tar => isObject(tar) && tar.isVoid
export const isTerminator = tar => isObject(tar) && tar.isTerminator
export const isVacuo = tar => isFunction(tar) && tar.isVacuo

/**
 *—————————————————————————————————————————————— Nothing Particle ————————————————————————————————————————————————————
 */
export class Void {
  get isVoid () {
    return true
  }
}
export const VOID = new Void()

/**
 *—————————————————————————————————————————————— Terminator Particle ————————————————————————————————————————————————————
 */
export class Terminator {
  get isTerminator () {
    return true
  }
}
export const TERMINATOR = new Terminator()

/**
 *—————————————————————————————————————————————— Vacuo Particle ————————————————————————————————————————————————————
 */
//  利用 JavaScript Function is also an Object 的特性
//  使 Vacuo 既能够作为 Datar.of() 也能作为 Mutator.of() 的参数
//    从而实现 Empty Datar 和 Empty Mutator
//  https://developer.chrome.com/docs/apps/contentSecurityPolicy/
//  因为要兼容浏览器扩展的执行环境，所以 class Vacuo extends Function 语法无法使用
export const Vacuo = () => {
  const internalVacuo = function () {}
  Object.defineProperty(internalVacuo, 'isVacuo', {
    get: () => {
      return true
    }
  })
  Object.defineProperty(internalVacuo, 'isEmpty', {
    get: () => {
      return true
    }
  })
  return internalVacuo
}
export const VACUO = Vacuo()

/**
 *—————————————————————————————————————————————— Datar Particle ————————————————————————————————————————————————————
 */
export class Datar {
  constructor (value, mutator = VACUO) {
    if (!isUndefined(mutator) && !isMutator(mutator) && !isVacuo(mutator)) {
      throw (new TypeError('Only the Mutator or Vacuo type of particle is expected to be received as 2nd parameter of Datar particle constructor.'))
    }
    this.value = value
    this.mutator = mutator
  }

  static of (value) {
    return new Datar(value)
  }

  static empty () {
    return new Datar(VACUO)
  }

  get isDatar () {
    return true
  }

  get isEmpty () {
    return isVacuo(this.value)
  }

  fill (mutator) {
    if (!isMutator(mutator) && !isVacuo(mutator)) {
      throw (new TypeError('Only the Mutator or Vacuo type of particle is expected to be received by "fill" method of Datar particle.'))
    }
    this.mutator = mutator
    return this
  }

  // 很少用到，之所以存在是为了保证 Datar 和 Mutator 的对称性
  run (mutator = VACUO) {
    if (!isMutator(mutator) && !isVacuo(mutator)) {
      throw (new TypeError('Only the Mutator or Vacuo type of particle is expected to be received by "run" method of Datar particle.'))
    }
    return isMutator(mutator) ? mutator.operation : mutator
  }
}

const checkOperation = operation => {
  if (!isFunction(operation)) {
    throw (new TypeError('operation must be the type of Function.'))
  }
}
// isValidOpTar(isValidOperationTarget) :: any -> Boolean
const isValidOpTar = tar => {
  return isDatar(tar) || isVacuo(tar)
}
/**
 *—————————————————————————————————————————————— Mutator Particle ————————————————————————————————————————————————————
 */
export class Mutator {
  constructor (operation, datar = VACUO) {
    if (!isUndefined(datar) && !isValidOpTar(datar)) {
      throw (new TypeError('Only the Datar or Vacuo type of particle is expected to be received as 2nd parameter of Mutator particle constructor.'))
    }
    checkOperation(operation)
    this.operation = operation
    this.datar = datar
  }

  static of (operation) {
    return new Mutator(operation)
  }

  static empty () {
    return new Mutator(VACUO)
  }

  get isMutator () {
    return true
  }

  get isEmpty () {
    return isVacuo(this.operation)
  }

  static checkOperation (operation) {
    checkOperation(operation)
  }

  static isValidOpTar (tar) {
    return isValidOpTar(tar)
  }

  // lift dispatcher
  static lift (operation, options) {
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
      throw (new TypeError(`"type" of lift must be one of "both" | "left" | "right", but received "${type}".`))
    }
  }

  // Automatically unwrap both left & right param to value
  static liftBoth (operation) {
    checkOperation(operation)
    return looseCurryN(2, (prevDatar, datar, ...args) => {
      return operation(
        isValidOpTar(prevDatar) ? prevDatar.value : prevDatar,
        isValidOpTar(datar) ? datar.value : datar,
        ...args
      )
    })
  }

  // Automatically unwrap left param to value， keep right param Datar
  static liftLeft (operation) {
    checkOperation(operation)
    return looseCurryN(2, (prevDatar, datar, ...args) => {
      return operation(
        isValidOpTar(prevDatar) ? prevDatar.value : prevDatar,
        datar,
        ...args
      )
    })
  }

  // Automatically unwrap right param to value， keep left param Datar
  static liftRight (operation) {
    checkOperation(operation)
    return looseCurryN(2, (prevDatar, datar, ...args) => {
      return operation(
        prevDatar,
        isValidOpTar(datar) ? datar.value : datar,
        ...args
      )
    })
  }

  fill (datar) {
    if (!isValidOpTar(datar)) {
      throw (new TypeError('Only the Datar or Vacuo type of particle is expected to be received by "fill" method of Mutator particle.'))
    }
    this.datar = datar
    return this
  }

  run (datar = VACUO, ...args) {
    // 保证 Mutator 的 operation 接收到的两个必要参数都是合法的操作对象
    return this.operation(this.datar, isValidOpTar(datar) ? datar : Datar.of(datar), ...args)
  }
}
