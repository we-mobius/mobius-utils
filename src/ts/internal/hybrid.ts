import { filter, every, some } from './array'
import { isTruthy, isFalsy } from './boolean'

import { curry } from '../functional/helpers'
import { applyTo } from '../functional/combinators'

export const filterTruthy = filter(isTruthy)
export const filterFalsy = filter(isFalsy)

export const allPass = curry((tests, tar) => every(applyTo(tar), tests))
export const anyPass = curry((tests, tar) => some(applyTo(tar), tests))
