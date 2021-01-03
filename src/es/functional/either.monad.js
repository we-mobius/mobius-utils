import { inspect } from './_private.js'
import { curry } from './helpers.js'
import { identity } from './combinators.js'
// @ref: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/

export class Either {
  constructor (x) {
    this._value = x
  }

  get value () {
    return this._value
  }

  static of (x) {
    return new Right(x)
  }

  static right (x) {
    return new Right(x)
  }

  static left (x) {
    return new Left(x)
  }
}

export class Left extends Either {
  get isLeft () {
    return true
  }

  get isRight () {
    return false
  }

  static of (x) {
    throw new Error('`of` called on class Left (value) instead of Either (type)')
  }

  inspect () {
    return `Left(${inspect(this._value)})`
  }

  map () {
    return this
  }

  join () {
    return this
  }

  chain () {
    return this
  }

  ap () {
    return this
  }

  cata ({ Left, Right }) {
    return Left(this._value)
  }

  // ----- Traversable (Either a)
  sequence (of) {
    return of(this)
  }

  traverse (of, fn) {
    return of(this)
  }
}

export class Right extends Either {
  get isLeft () {
    return false
  }

  get isRight () {
    return true
  }

  static of (x) {
    throw new Error('`of` called on class Right (value) instead of Either (type)')
  }

  inspect () {
    return `Right(${inspect(this._value)})`
  }

  map (fn) {
    return Either.of(fn(this._value))
  }

  join () {
    return this._value
  }

  chain (fn) {
    return fn(this._value)
  }

  ap (mfn) {
    return this.map(mfn._value)
  }

  cata ({ Left, Right }) {
    return Right(this._value)
  }

  // ----- Traversable (Either a)
  sequence (of) {
    return this.traverse(of, identity)
  }

  traverse (of, fn) {
    fn(this._value).map(Either.of)
  }
}

// left :: a -> Either a b
export const left = a => new Left(a)
// right :: b -> Either a b
export const right = b => new Right(b)

// either :: (a -> c) -> (b -> c) -> Either a b -> c
export const either = curry((f, g, e) => {
  if (e.isLeft) {
    return f(e.value)
  }
  return g(e.value)
})
