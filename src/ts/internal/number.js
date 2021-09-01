import { curryN } from '../functional/helpers.js'

export const isEven = x => x % 2 === 0
export const isOdd = x => x % 2 !== 0

export const maxTo = curryN(2, (max, x) => x > max ? max : x)
export const minTo = curryN(2, (min, x) => x < min ? min : x)
export const minOf = curryN(2, (x, y) => x < y ? x : y)
export const maxOf = curryN(2, (x, y) => x > y ? x : y)
export const between = curryN(3, (a, b, x) => {
  const min = minOf(a, b)
  const max = maxOf(a, b)
  return x < min ? min : (x > max ? max : x)
})
