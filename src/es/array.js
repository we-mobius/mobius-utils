import { invoker, curry, curry2, compose, complement, flip } from './functional.js'

// TODO: enhance
export const toArray = val => [...val]

// @see: https://github.com/mqyqingfeng/Blog/issues/51
export const shuffle = a => {
  a = [].concat(a)
  for (let i = a.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]]
  }
  return a
}

export const includes = invoker(2, 'includes')

export const every = invoker(2, 'every')
export const map = invoker(2, 'map')
export const forEach = invoker(2, 'forEach')
export const filter = invoker(2, 'filter')
export const reject = curry((f, arr) => arr.filter(complement(f)))
export const reduce = invoker(3, 'reduce')
export const some = invoker(2, 'some')

export const slice = invoker(3, 'slice')
export const join = invoker(2, 'join')

export const push = curry((item, arr) => {
  arr = [...arr]
  arr.push(item)
  return arr
})
export const pop = arr => {
  arr = [...arr]
  arr.pop()
  return arr
}
export const unshift = curry((item, arr) => {
  arr = [...arr]
  arr.unshift(item)
  return arr
})
export const shift = arr => {
  arr = [...arr]
  arr.shift()
  return arr
}

export const unique = arr => [...new Set(arr)]

export const concat = invoker(2, 'concat')

export const union = curry2(compose(unique, flip(concat)))

// @see ramda, it is more efficient when the array length gap is large
const _longer = (arr1, arr2) => arr1.length > arr2.length ? arr1 : arr2
const _shorter = (arr1, arr2) => arr1.length > arr2.length ? arr2 : arr1
export const intersection = curry((arr1, arr2) => {
  const lookupArr = _longer(arr1, arr2)
  const filteredArr = _shorter(arr1, arr2)
  return unique(filter(flip(includes)(lookupArr), filteredArr))
})
