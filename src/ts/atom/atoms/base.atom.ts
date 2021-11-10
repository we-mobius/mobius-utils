import { pipe, compose } from '../../functional'
import { isObject } from '../../internal'

export const isAtom = tar => isObject(tar) && tar.isAtom

/**
 * !! please consider BaseMediator when add property or method to BaseAtom
 */
export class BaseAtom {
  get isAtom () {
    return true
  }

  pipe (...args) {
    return pipe(...args)(this)
  }

  compose (...args) {
    return compose(...args)(this)
  }
}
