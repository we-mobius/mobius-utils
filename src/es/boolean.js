import { complement, curry, applyTo } from './functional.js'
import { every } from './array.js'

export const isTrue = v => v === true
export const isFalse = v => v === false

export const isStrictTruthy = v => !!v === true
export const isStrictFalsy = v => !!v === false
export const isLooseFalsy = v => v === null || v === undefined
export const isLooseTruthy = complement(isLooseFalsy)
export const isTruthy = isStrictTruthy
export const isFalsy = isStrictFalsy

export const allPass = curry((tests, tar) => every(applyTo(tar), tests))
