import { isObject } from '../internal/base'

/******************************************************************************************************
 *
 *                                              Vain Predicates
 *
 ******************************************************************************************************/

/**
 * @param value
 * @return { boolean } whether the value is a Vain instance
 */
export const isVain = (tar: any): tar is Vain => isObject(tar) && tar.isVain

/******************************************************************************************************
 *
 *                                              Vain Class
 *
 ******************************************************************************************************/

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
