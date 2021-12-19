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
export class Maybe<V = any> {
  static of <V>(a: V): Just<V> {
    return Maybe.just(a)
  }

  static just <V>(a: V): Just<V> {
    return new Just(a)
  }

  static nothing (): Nothing {
    return new Nothing()
  }

  static fromNullable <V>(a: V): Just<NonNullable<V>> | Nothing {
    return isNull(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromUndefinedable (a) {
    return isUndefined(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromFalsyable (a) {
    return isFalsy(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromNilable (a: null | undefined): Nothing
  static fromNilable <V>(a: V): Just<V>
  static fromNilable (a: any): Just<any> | Nothing {
    return isNil(a) ? Maybe.nothing() : Maybe.just(a)
  }

  static fromEmptyable (a) {
    return isEmpty(a) ? Maybe.nothing() : Maybe.just(a)
  }

  get isMaybe (): true { return true }
}

// Derived class Just -> Presence of a value
// Or named `Some` in some other monad implements
export class Just<V> extends Maybe<V> {
  _value: V

  constructor (value: V) {
    super()
    this._value = value
  }

  get value (): V { return this._value }

  get isJust (): true { return true }

  get isNothing (): false { return false }

  inspect (): string {
    return `Maybe.Just(${inspect(this._value)})`
  }

  map <R>(fn: (value: V) => R): Just<R> {
    return Maybe.just(fn(this._value))
  }

  join (): V { return this._value }

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
  get value (): void { throw new TypeError("Can't extract the value of a Nothing.") }

  get isNothing (): true { return true }

  get isJust (): false { return false }

  inspect (): string { return 'Maybe.Nothing' }

  map (fn: (...args: any[]) => any): this { return this }

  join (): this { return this }

  chain (fn: (...args: any[]) => any): this { return this }

  ap (mfn: (...args: any[]) => any): this { return this }

  orJust (dlft) {
    return Maybe.of(dlft)
  }

  orElse (maybeMonad) {
    return maybeMonad
  }

  filter (): this { return this }

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

const add = (value: number): number => value + 1

const square = (value: number): number => value ** 2

const double = (value: number): number => value * 2

const a = Maybe.of(1).map(add).map(square).map(double).map(String)
// -> '8'

const b = Maybe.nothing().map(add).map(square).map(double)
// -> null

const c = Maybe.fromNilable(null).map(add).map(square).map(double)
// -> null
