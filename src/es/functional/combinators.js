import { curryN, curry } from './helpers.js'

// @ref: https://www.youtube.com/watch?v=3VQ382QG-y4
// A combinator is a function with no free variables.
//   -> 函数体中所有的变量都来自于参数
//   -> isCombinator: x => x, x => y => x
//   -> isNotCombinator: x => y, x => x * y

// @ref: https://gist.github.com/Avaq/1f0636ec5c8d6aed2e45
// @ref: https://crocks.dev/docs/functions/combinators.html

// I
// @Haskell: id
// @use: identity
// identity :: a -> a
export const identity = x => x

// O, omega
// @use: self-application
// O :: f -> f
export const omega = f => f(f)

// K, Kestrel
// @Haskell: const
// @use: true, first, const
// constant :: a -> b -> a
export const constant = x => () => x
export const always = constant

// KI, Kite = KI = CK
// @Haskell: const id
// derived from: constant(identity)
// @use: false, second
// kite :: a -> b -> b
export const kite = a => b => b

// C, Cardinal
// @Haskell: flip
// @use: reverse arguments
// flip :: (a -> b -> c) -> b -> a -> c
export const flip = curryN(3, (f, x, y) => curry(f)(y)(x))

// apply :: (a -> b) -> a -> b
export const apply = curryN(2, (f, x) => f(x))

// T, Thrush = CI
// @Haskell: flip id
// @use: hold an argument
// thrush :: a -> (a -> b) -> b
export const applyTo = curryN(2, (x, f) => f(x))
export const thrush = applyTo

// V, Vireo = BCT
// @Haskell: flip . flip id
// @use: hold a pair of args
// vireo :: a -> b -> (a -> b -> c) -> c
export const vireo = curryN(3, (x, y, f) => curry(f)(x)(y))

// W, join
// duplication :: (a -> a -> b) -> a -> b
export const duplication = curryN(2, (f, x) => curry(f)(x)(x))

// substitution :: (a -> b -> c) -> (a - b) -> a -> c
export const substitution = curryN(3, (f, g, x) => curry(f)(x)(g(x)))
// sustitution2 :: (a -> b -> c) -> (b -> a) -> b -> c
export const substitution2 = curryN(3, (f, g, x) => curry(f)(g(x))(x))

// converge :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
export const converge = curryN(4, (f, g, h, x) => curry(f)(g(x))(h(x)))

// compose2 ::  (c -> d -> e) -> (a -> c) -> (b -> d) -> a -> b -> e
export const compose2 = curryN(5, (f, g, h, x, y) => curry(f)(g(x))(h(y)))

// on
// psi :: (b → b → c) → (a → b) → a → a → c
export const psi = curryN(4, (f, g, x, y) => curry(f)(g(x))(g(y)))

// B, Bluebird
// @Haskell: (.)
// @use: composition
// composeB :: (b -> c) -> (a -> b) -> a -> c
export const composeB = curryN(3, (f, g, x) => f(g(x)))

// Y :: (a -> a) -> a
// export const Y = fixPoint = ...
// ! Can not build in JavaScript

// Z
// Y Combinator's variation in JavaScript
export const Z = g => (f => g((...args) => f(f)(...args)))(f => g((...args) => f(f)(...args)))
