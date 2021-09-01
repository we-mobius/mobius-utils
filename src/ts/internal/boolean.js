import { compose, curry } from '../functional/helpers.js'

export const and = curry((x, y) => !!x && !!y)
export const or = curry((x, y) => !!x || !!y)
export const not = x => !x
export const complement = fn => compose(not, fn)

export const isTrue = v => v === true
export const isFalse = v => v === false

// @see https://developer.mozilla.org/en-US/docs/Glossary/Truthy
export const isTruthy = v => !!v === true
export const isFalsy = v => !!v === false
export const isNil = v => v === null || v === undefined
export const isNotNil = complement(isNil)

export const strictEquals = curry((v1, v2) => v1 === v2)
export const equals = strictEquals
// eslint-disable-next-line eqeqeq
export const looseEquals = curry((v1, v2) => v1 == v2)

export const ifElse = curry((pred, f, g, x) => pred(x) ? f(x) : g(x))
export const when = curry((pred, f, x) => pred(x) ? f(x) : x)
export const unless = curry((pred, f, x) => !pred(x) ? f(x) : x)
export const iif = curry((cond, x, y) => cond ? x : y)
