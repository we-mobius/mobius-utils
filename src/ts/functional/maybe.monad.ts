import { inspect } from './_private'
import { isNull, isUndefined, isEmpty, isFalsy, isNil } from '../internal'

import { invoker, curry } from './helpers'

/**
 * Custom Maybe Monad used in FP in JS book written in ES6
 * Author: Luis Atencio
 * Customized by cigaret.
 * ref: https://stackoverflow.com/questions/50512370/folktale-fantasyland-maybe-not-working-as-expected/57552439#57552439
 * comment: Just\Some
 */
export class Maybe {
  static of (a) {
    return Maybe.just(a)
  }

  static just (a) {
    return new Just(a)
  }

  static nothing () {
    return new Nothing()
  }

  static fromNullable (a) {
    return isNull(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromUndefinedable (a) {
    return isUndefined(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromFalsyable (a) {
    return isFalsy(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromNilable (a) {
    return isNil(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromEmptyable (a) {
    return isEmpty(a) ? Maybe.nothing() : Maybe.just(a)
  }

  get isNothing () {
    return false
  }

  get isJust () {
    return false
  }

  get isMaybe () {
    return true
  }
}

// Derived class Just -> Presence of a value
// Or named `Some` in some other monad implements
export class Just<V> extends Maybe {
  constructor (value) {
    super()
    this._value = value
  }

  get value () {
    return this._value
  }

  get isJust () {
    return true
  }

  get isNothing () {
    return false
  }

  inspect () {
    return `Maybe.Just(${inspect(this._value)})`
  }

  map (fn) {
    return Maybe.just(fn(this._value))
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

  orJust () {
    return this
  }

  orElse () {
    return this
  }

  filter (fn) {
    return fn(this._value) ? this : Maybe.nothing()
  }

  cata ({ Just, Nothing }) {
    return Just(this._value)
  }
}

// Derived class Empty -> Abscense of a value
export class Nothing extends Maybe {
  get value () {
    throw new TypeError("Can't extract the value of a Nothing.")
  }

  get isNothing () {
    return true
  }

  get isJust () {
    return false
  }

  inspect () {
    return 'Maybe.Nothing'
  }

  map (fn) {
    return this
  }

  join () {
    return this
  }

  chain (fn) {
    return this
  }

  ap (mfn) {
    return this
  }

  orJust (dlft) {
    return Maybe.of(dlft)
  }

  orElse (maybeMonad) {
    return maybeMonad
  }

  filter () {
    return this
  }

  cata ({ Just, Nothing }) {
    return Nothing()
  }
}

// just :: Maybe a -> Just a
export const just = a => new Just(a)
// nothing :: Maybe () -> Nothing
export const nothing = () => new Nothing()
// @see: https://crocks.dev/docs/crocks/Maybe.html#safe
// safe :: (a -> Boolean) -> a -> Maybe a
export const safe = curry((pred, val) => pred(val) ? just(val) : nothing())

// helpers
export const orElse = invoker(2, 'orElse')
export const orJust = invoker(2, 'orJust')

// maybe :: b -> (a -> b) -> Maybe a -> b
export const maybe = curry((v, f, m) => {
  if (m.isNothing) {
    return v
  }
  return f(m.value)
})
