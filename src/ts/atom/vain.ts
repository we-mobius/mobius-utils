import { isObject } from '../internal/base'

/******************************************************************************************************
 *
 *                                              Vain Predicates
 *
 ******************************************************************************************************/

/**
 * @param target anything
 * @return { boolean } whether the value is a Vain instance
 */
export const isVain = (target: any): target is Vain => isObject(target) && target.isVain

/******************************************************************************************************
 *
 *                                              Vain Class
 *
 ******************************************************************************************************/

/**
 *
 */
export abstract class Vain {
  isVain: boolean

  constructor () {
    this.isVain = true

    if (new.target === Vain) {
      throw new Error('Vain class can not be instantiated!')
    }
  }

  abstract get type (): string
}
