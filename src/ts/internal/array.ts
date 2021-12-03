/* eslint-disable @typescript-eslint/no-explicit-any */
import { invoker, curry, curryN, compose } from '../functional/helpers'
import { flip } from '../functional/combinators'

type FunctionReturnBoolean = (...args: any[]) => boolean

type SpreadToArray = <T = any>(target: Iterable<T>) => T[]
/**
 * Spread the iterable target into the array.
 */
export const spreadToArray: SpreadToArray = (target) => [...target]

type Shuffle = <T>(arr: T[]) => T[]
/**
 * Shuffle the target array.
 * @refer https://github.com/mqyqingfeng/Blog/issues/51
 */
export const shuffle: Shuffle = (target) => {
  const _target = [...target]
  for (let i = _target.length; i !== 0; i--) {
    const j = Math.floor(Math.random() * i);
    [_target[i - 1], _target[j]] = [_target[j], _target[i - 1]]
  }
  return _target
}

export const includes = invoker(3, 'includes')

export const every = invoker(2, 'every')
export const map = invoker(2, 'map')
export const forEach = invoker(2, 'forEach')
export const filter = invoker(2, 'filter')
export const reject = curry((f: FunctionReturnBoolean, arr) => filter((...args: any[]) => !f(...args), arr))
export const reduce = invoker(3, 'reduce')
export const some = invoker(2, 'some')
export const flat = invoker(1, 'flat')

export const slice = invoker(3, 'slice')
export const join = invoker(2, 'join')

export const push = curry((item, arr) => [...arr, item])
type Pop = <T>(arr: T[]) => T[]
export const pop: Pop = arr => arr.slice(1)
export const unshift = curry((item, arr) => [item, ...arr])
type Shift = <T>(arr: T[]) => T[]
export const shift: Shift = ([_, ...rest]) => rest

type Unique = <T = any>(arr: T[]) => T[]
export const unique: Unique = arr => [...(new Set(arr))]

interface IConcat {
  <A extends any[], B extends any[]>(a: A, b: B): [...B, ...A]
  <A extends any[], B extends any[]>(a: A): (b: B) => [...B, ...A]
}
export const concat: IConcat = invoker(2, 'concat')

export const union = curryN(2, compose(unique, flip(concat) as (...args: any[]) => any))

// reference: ramda, it is more efficient when the array length gap is large
type CompareArray = (arr1: any[], arr2: any[]) => any[]
const _longer: CompareArray = (arr1, arr2) => arr1.length > arr2.length ? arr1 : arr2
const _shorter: CompareArray = (arr1, arr2) => arr1.length > arr2.length ? arr2 : arr1
export const intersection = curry((arr1, arr2) => {
  const lookupArr = _longer(arr1, arr2)
  const filteredArr = _shorter(arr1, arr2)
  return unique(filter(flip(includes)(lookupArr), filteredArr))
})
