import { curry } from '../functional/helpers'

export const isEven = (x: number): boolean => x % 2 === 0
export const isOdd = (x: number): boolean => x % 2 !== 0

export const maxTo = curry((max, x) => x > max ? max : x)
export const minTo = curry((min, x) => x < min ? min : x)
export const minOf = curry((x, y) => x < y ? x : y)
export const maxOf = curry((x, y) => x > y ? x : y)
export const between = curry((a, b, x) => {
  const min = minOf(a, b)
  const max = maxOf(a, b)
  return x < min ? min : (x > max ? max : x)
})
