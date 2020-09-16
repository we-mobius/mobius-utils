const { invoker, curry, curry2, compose, complement, flip } = require('./functional.js')

// @see: https://github.com/mqyqingfeng/Blog/issues/51
exports.shuffle = a => {
  a = [].concat(a)
  for (let i = a.length; i; i--) {
    const j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]]
  }
  return a
}

const includes = invoker(2, 'includes')
exports.includes = includes

exports.every = invoker(2, 'every')
exports.map = invoker(2, 'map')
exports.forEach = invoker(2, 'forEach')
const filter = invoker(2, 'filter')
exports.filter = filter
exports.reject = curry((f, arr) => arr.filter(complement(f)))
exports.reduce = invoker(3, 'reduce')
exports.some = invoker(2, 'some')

exports.slice = invoker(3, 'slice')
exports.join = invoker(2, 'join')

const unique = arr => [...new Set(arr)]
exports.unique = unique

const concat = invoker(2, 'concat')
exports.concat = concat

exports.union = curry2(compose(unique, flip(concat)))

// @see ramda, it is more efficient when the array length gap is large
const _longer = (arr1, arr2) => arr1.length > arr2.length ? arr1 : arr2
const _shorter = (arr1, arr2) => arr1.length > arr2.length ? arr2 : arr1
const intersection = curry((arr1, arr2) => {
  const lookupArr = _longer(arr1, arr2)
  const filteredArr = _shorter(arr1, arr2)
  return unique(filter(flip(includes)(lookupArr), filteredArr))
})
exports.intersection = intersection
