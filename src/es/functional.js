import { asIs, isObject, isFunction } from './base.js'

export const argPlaceholder = {
  // compatible with ramda.js
  '@@functional/placeholder': true,
  isArgPlaceholder: true
}
export const isArgPlaceholder = placeholder => isObject(placeholder) && Object.prototype.hasOwnProperty.call(placeholder, 'isArgPlaceholder') && placeholder.isArgPlaceholder

export const simpleCurry = (fn, ...args) => {
  if (args.length >= fn.length) {
    return fn(...args)
  } else {
    return (...args2) => simpleCurry(fn, ...args, ...args2)
  }
}
export const internalCurry = (fn, filled, ...args) => {
  let innerArgs = filled || []
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? (args.shift() || innerArg) : innerArg)
  innerArgs = innerArgs.concat(args)
  const innerLen = innerArgs.slice(0, fn.length).filter(complement(isArgPlaceholder)).length
  if (innerLen >= fn.length) {
    return fn(...innerArgs)
  } else {
    return (...args2) => internalCurry(fn, innerArgs, ...args2)
  }
}
export const curry = (fn, ...args) => internalCurry(fn, [], ...args)

export const internalCurryN = (n, fn, filled, ...args) => {
  let innerArgs = filled || []
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? (args.shift() || innerArg) : innerArg)
  innerArgs = innerArgs.concat(args)
  const innerLen = innerArgs.slice(0, n).filter(complement(isArgPlaceholder)).length
  if (innerLen >= n) {
    return fn(...innerArgs)
  } else {
    return (...args2) => internalCurryN(n, fn, innerArgs, ...args2)
  }
}
export const curryN = (n, fn, ...args) => internalCurryN(n, fn, [], ...args)
export const curry1 = (fn, ...args) => internalCurryN(1, fn, [], ...args) // just for consistency
export const curry2 = (fn, ...args) => internalCurryN(2, fn, [], ...args)
export const curry3 = (fn, ...args) => internalCurryN(3, fn, [], ...args)
export const curry4 = (fn, ...args) => internalCurryN(4, fn, [], ...args)
export const curry5 = (fn, ...args) => internalCurryN(5, fn, [], ...args)
export const curry6 = (fn, ...args) => internalCurryN(6, fn, [], ...args)
// ...

// NOTE: 另外一种 compose 实现
// @see: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
// const compose = (...args) => value => args.reduceRight((acc, fn) => fn(acc), value)
// 本质是一个闭包，直觉上不喜欢（虽然能够带来一些调试上的好处）
//   -> @see: https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
// 下面这种更符合函数式思维，实现上更接近数学定义
export const composeL = (...fns) => fns.reduce((g, f) => (...args) => f(g(...args)), fns.shift() || asIs)
export const composeR = (...fns) => composeL(...fns.reverse())
export const compose = composeR
export const pipe = composeL

export const memorize = (fn, hasher) => {
  const cache = {}
  hasher = hasher || ((...args) => JSON.stringify(args))
  return (...args) => {
    const hash = hasher(args)
    if (!cache[hash]) {
      cache[hash] = fn.apply(this, args)
    }
    return cache[hash]
  }
}

export const invoker = (n, key) => curryN(n, (...args) => {
  const target = args[n - 1]
  if (!target[key]) throw Error(`Can not find "${key}" method in target.'`)
  if (!isFunction(target[key])) throw Error(`"${key}" property in target is not a function.`)
  return target[key](...args.slice(0, n - 1))
})

export const not = x => !x
export const complement = fn => compose(not, fn)

// NOTE: call 接受不定长参数，无法进行一般柯里化
export const call = (f, ...args) => f(...args)

// identity :: a -> a
export const identity = x => x
// constant :: a -> b -> a
export const constant = x => y => x
// apply :: (a -> b) -> a -> b
export const apply = curryN(2, (f, args) => f(...args))
// thrush :: a -> (a -> b) -> b
export const thrush = curryN(2, (x, f) => f(x))
export const applyTo = thrush
// duplication :: (a -> a -> b) -> a -> b
export const duplication = curryN(2, (f, x) => f(x, x)) // => f(x)(x)
// flip :: (a -> b -> c) -> b -> a -> c
export const flip = curryN(3, (f, x, y) => f(y, x)) // => f(y)(x)
// compose :: (b -> c) -> (a -> b) -> a -> c

// substitution :: (a -> b -> c) -> (a - b) -> a -> c
export const substitution = curryN(3, (f, g, x) => f(x, g(x))) // => f(x)(g(x))

// coverage :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
export const coverage = curryN(4, (f, g, h, x) => f(g(x), h(x))) // => f(g(x)(h(x))

// Y :: (a -> a) -> a
export const Y = g => (f => g((...args) => f(f)(...args)))(f => g((...args) => f(f)(...args)))
