/* eslint-disable @typescript-eslint/no-explicit-any */
import { curry } from './helpers'

// reference: https://www.youtube.com/watch?v=3VQ382QG-y4
// A combinator is a function with no free variables.
//   -> 函数体中所有的变量都来自于参数
//   -> isCombinator: x => x, x => y => x
//   -> isNotCombinator: x => y, x => x * y
// postfix S -> strict version

// reference: https://gist.github.com/Avaq/1f0636ec5c8d6aed2e45
// reference: https://crocks.dev/docs/functions/combinators.html

type Identity = <T = any>(x: T) => T
/**
 * I
 * @haskell id
 * @use identity
 * @signature identity :: a -> a
 */
export const identity: Identity = x => x

type Fn<T = any> = (f: Fn<T>) => T
type Omega = <T = any>(f: Fn<T>) => T
/**
 * O, omega
 * @use self-application
 * @signature O :: f -> f
 */
export const omega: Omega = f => f(f)

type Constant = <T = any>(x: T) => (...args: any[]) => T
/**
 * K, Kestrel
 * @haskell const
 * @use true, first, const
 * @signature constant :: a -> b -> a
 */
export const constant: Constant = x => (...args) => x
export const always = constant

type Kite = <T = any>(...args: any[]) => (b: T) => typeof b
/**
 * KI, Kite = KI = CK
 * @haskell const id
 * @derived constant(identity)
 * @use false, second
 * @signature kite :: a -> b -> b
 */
export const kite: Kite = (...args) => b => b

/**
 * C, Cardinal
 * @haskell flip
 * @use reverse arguments
 * @signature flip :: (a -> b -> c) -> b -> a -> c
 */
export const flip = curry((f, x, y) => f(y, x))
export const flipS = curry((f, x, y) => curry(f)(y)(x))

/**
 * @signature apply :: (a -> b) -> a -> b
 */
export const apply = curry((f, x) => f(x))

/**
 * T, Thrush = CI
 * @haskell flip id
 * @use hold an argument
 * @signature thrush :: a -> (a -> b) -> b
 */
export const applyTo = curry((x, f) => f(x))
export const thrush = applyTo

/**
 * V, Vireo = BCT
 * @haskell flip . flip id
 * @use hold a pair of args
 * @signature vireo :: a -> b -> (a -> b -> c) -> c
 */
export const vireo = curry((x, y, f) => f(x, y))
export const vireoS = curry((x, y, f) => curry(f)(x)(y))

/**
 * W, join
 * @signature duplication :: (a -> a -> b) -> a -> b
 */
export const duplication = curry((f, x) => f(x, x))
export const duplicationS = curry((f, x) => curry(f)(x)(x))

/**
 * @signature substitution :: (a -> b -> c) -> (a - b) -> a -> c
 */
export const substitution = curry((f, g, x) => f(x, g(x)))
export const substitutionS = curry((f, g, x) => curry(f)(x)(g(x)))
/**
 * @signature sustitution2 :: (a -> b -> c) -> (b -> a) -> b -> c
 */
export const substitution2 = curry((f, g, x) => f(g(x), x))
export const substitution2S = curry((f, g, x) => curry(f)(g(x))(x))

/**
 * @signature converge :: (b -> c -> d) -> (a -> b) -> (a -> c) -> a -> d
 */
export const converge = curry((f, g, h, x) => f(g(x), h(x)))
export const convergeS = curry((f, g, h, x) => curry(f)(g(x))(h(x)))

/**
 * @signature compose2 :: (c -> d -> e) -> (a -> c) -> (b -> d) -> a -> b -> e
 */
export const compose2 = curry((f, g, h, x, y) => f(g(x), h(y)))
export const compose2S = curry((f, g, h, x, y) => curry(f)(g(x))(h(y)))

/**
 * on
 * @signature psi :: (b → b → c) → (a → b) → a → a → c
 */
export const psi = curry((f, g, x, y) => f(g(x), g(y)))
export const psiS = curry((f, g, x, y) => curry(f)(g(x))(g(y)))

/**
 * B, Bluebird
 * @haskell (.)
 * @use composition
 * @signature composeB :: (b -> c) -> (a -> b) -> a -> c
 */
export const composeB = curry((f, g, x) => f(g(x)))
export const composeBS = curry((f, g, x) => curry(f)(g(x)))

// Y :: (a -> a) -> a
// export const Y = fixPoint = ...
// ! Can not implement with JavaScript

type ZCombinator = <Y extends (...args: any[]) => any>
  (g: (arg: (...args: Parameters<Y>) => ReturnType<Y>) => Y) => (...args: Parameters<Y>) => ReturnType<Y>
/**
 * Z
 * @description Y Combinator's variation in JavaScript
 * @signature Z :: ((a -> b) -> a -> b) -> a -> b
 * @example
 * ```ts
 * const f = g => n => n === 0 ? 1 : n * g(n - 1)
 * console.log(Z(f)(5))
 * ```
 */
export const Z: ZCombinator = g => (f => g((...args) => f(f)(...args)))((f: any) => g((...args) => f(f)(...args)))
