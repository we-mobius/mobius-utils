import { curry } from '../functional/helpers'

export const isEven = (x: number): boolean => x % 2 === 0
export const isOdd = (x: number): boolean => x % 2 !== 0

export const maxTo = (max: number, x: number): number => x > max ? max : x
export const maxTo_ = curry(maxTo)

export const minTo = (min: number, x: number): number => x < min ? min : x
export const minTo_ = curry(minTo)

export const minOf = (x: number, y: number): number => x < y ? x : y
export const minOf_ = curry(minOf)

export const maxOf = (x: number, y: number): number => x > y ? x : y
export const maxOf_ = curry(maxOf)

export const between = (a: number, b: number, x: number): number => {
  const min = minOf(a, b)
  const max = maxOf(a, b)
  return x < min ? min : (x > max ? max : x)
}
export const between_ = curry(between)
