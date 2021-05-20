// use '../internal/base.js' instead of '../internal.js' to avoid ↓
//   - ReferenceError: Cannot access '***' before initialization
//   - because some of internal modules import the "../functional.js"
import { asIs, isObject, isFunction } from '../internal/base.js'

// NOTE: 重复实现了 boolean.js 中的 complement 以避免循环引用
const _complement = fn => compose(x => !x, fn)

export const argPlaceholder = {
  // compatible with ramda.js
  '@@functional/placeholder': true,
  isArgPlaceholder: true
}
export const isArgPlaceholder = placeholder =>
  isObject(placeholder) && Object.prototype.hasOwnProperty.call(placeholder, 'isArgPlaceholder') && placeholder.isArgPlaceholder

// loose curry will pass all of the args it received to target function,
// even if the arg's num greater than initial N
export const looseCurryS = (fn, ...args) => {
  if (args.length >= fn.length) {
    return fn(...args)
  } else {
    return (...args2) => looseCurryS(fn, ...args, ...args2)
  }
}
export const curryS = (fn, ...args) => {
  const targetNum = fn.length
  if (args.length >= targetNum) {
    return fn(...args.slice(0, targetNum))
  } else {
    return (...args2) => curryS(fn, ...args, ...args2)
  }
}

// loose curry will pass all of the args it received to target function,
// even if the arg's num greater than initial N
export const internalLooseCurry = (fn, filled, ...args) => {
  let innerArgs = filled || []
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? (args.length > 0 ? args.shift() : innerArg) : innerArg)
  innerArgs = innerArgs.concat(args)
  const targetNum = fn.length
  const validArgs = innerArgs.slice(0, targetNum)
  const validLen = validArgs.filter(_complement(isArgPlaceholder)).length
  if (validLen >= targetNum) {
    return fn(...innerArgs)
  } else {
    return (...extraArgs) => internalLooseCurry(fn, innerArgs, ...extraArgs)
  }
}
export const looseCurry = (fn, ...args) => internalLooseCurry(fn, [], ...args)
export const internalCurry = (fn, filled, ...args) => {
  let innerArgs = filled || []
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? (args.length > 0 ? args.shift() : innerArg) : innerArg)
  innerArgs = innerArgs.concat(args)
  const targetNum = fn.length
  const validArgs = innerArgs.slice(0, targetNum)
  const validLen = validArgs.filter(_complement(isArgPlaceholder)).length
  if (validLen >= targetNum) {
    return fn(...validArgs)
  } else {
    return (...extraArgs) => internalCurry(fn, validArgs, ...extraArgs)
  }
}
export const curry = (fn, ...args) => internalCurry(fn, [], ...args)

// loose curry will pass all of the args it received to target function,
// even if the arg's num greater than initial N
export const internalCurryN = (n, fn, filled, ...args) => {
  let innerArgs = filled || []
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? (args.length > 0 ? args.shift() : innerArg) : innerArg)
  innerArgs = innerArgs.concat(args)
  const validArgs = innerArgs.slice(0, n)
  const validLen = validArgs.filter(_complement(isArgPlaceholder)).length
  if (validLen >= n) {
    return fn(...validArgs)
  } else {
    return (...args2) => internalCurryN(n, fn, validArgs, ...args2)
  }
}
export const curryN = (n, fn, ...args) => internalCurryN(n, fn, [], ...args)
// export const curry1 = (fn, ...args) => internalCurryN(1, fn, [], ...args) // just for consistency
// export const curry2 = (fn, ...args) => internalCurryN(2, fn, [], ...args)
// ...
export const internalLooseCurryN = (n, fn, filled, ...args) => {
  let innerArgs = filled || []
  innerArgs = innerArgs.map(innerArg => isArgPlaceholder(innerArg) ? (args.length > 0 ? args.shift() : innerArg) : innerArg)
  innerArgs = innerArgs.concat(args)
  const validArgsLen = innerArgs.slice(0, n).filter(_complement(isArgPlaceholder)).length
  if (validArgsLen >= n) {
    return fn(...innerArgs)
  } else {
    return (...extraArgs) => internalLooseCurryN(n, fn, innerArgs, ...extraArgs)
  }
}
/**
 * @return { function | any }
 */
export const looseCurryN = (n, fn, ...args) => internalLooseCurryN(n, fn, [], ...args)

// NOTE: 另外一种 compose 实现
// @see: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight
// const compose = (...args) => value => args.reduceRight((acc, fn) => fn(acc), value)
// 本质是一个闭包，直觉上不喜欢（虽然能够带来一些调试上的好处）
//   -> @see: https://www.freecodecamp.org/news/pipe-and-compose-in-javascript-5b04004ac937/
// 下面这种更符合函数式思维，实现上更接近数学定义
export const composeL = (...fns) => fns.reduce((g, f) => (...args) => f(g(...args)), fns.shift() || asIs)
export const composeR = (...fns) => composeL(...fns.reverse())
export const pipeL = composeR
export const pipeR = composeL
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

const invokerFactory = curryFn => (n, key) => curryFn(n, (...args) => {
  // curry function controlls how many args will be passed in
  const target = args[args.length - 1]
  if (!target[key]) throw Error(`Can not find "${key}" method in target.'`)
  if (!isFunction(target[key])) throw Error(`"${key}" property in target is not a function.`)
  return target[key](...args.slice(0, args.length - 1))
})
export const invoker = invokerFactory(curryN)
export const looseInvoker = invokerFactory(looseCurryN)

export const nAry = curry((n, fn) => curryN(n, fn))
export const looseNAry = curry((n, fn) => looseCurryN(n, fn))
export const binary = fn => curry((x, y) => fn(x, y)) // nAry(2, fn)
export const looseBinary = fn => looseCurry((x, y, ...args) => fn(x, y, ...args)) // looseNAry(2, fn)
export const unary = fn => x => fn(x)
export const looseUnary = fn => (x, ...args) => fn(x, ...args)

export const tap = fn => (...args) => {
  fn(...args)
  return args[0]
}
/*
                  arguments num controller & curry test
*/
// const add = (x, y, z) => { console.log(x, y, z) }
// unary(add)(1, 2, 3) // 1, undefined, undefined
// binary(add)(1, 2, 3) // 1, 2, undefined
// nAry(1, add)(1, 2, 3) // 1, undefined, undefined
// nAry(2, add)(1, 2, 3) // 1, 2, undefined
// nAry(3, add)(1, 2, 3) // 1, 2, 3
// looseUnary(add)(1, 2, 3) // 1, 2, 3
// looseBinary(add)(1, 2, 3) // 1, 2, 3
// looseNAry(1, add)(1, 2, 3) // 1, 2, 3
// looseNAry(2, add)(1, 2, 3) // 1, 2, 3
// looseNAry(3, add)(1, 2, 3) // 1, 2, 3

// const gg = (a, b) => {
//   console.warn(a, b)
// }

// const ff = (a, b) => {
//   curry(gg)(a)
// }

// ff(1)
