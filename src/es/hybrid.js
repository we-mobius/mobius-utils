import { filter } from './array.js'
import { isTruthy, isFalsy } from './boolean.js'

export const filterTruthy = filter(isTruthy)
export const filterFalsy = filter(isFalsy)
