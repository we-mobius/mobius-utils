import { filter, every, some } from './array.js'
import { isTruthy, isFalsy } from './boolean.js'

import { curry } from '../functional/helpers.js'
import { applyTo } from '../functional/combinators.js'

export const filterTruthy = filter(isTruthy)
export const filterFalsy = filter(isFalsy)

export const allPass = curry((tests, tar) => every(applyTo(tar), tests))
export const anyPass = curry((tests, tar) => some(applyTo(tar), tests))
