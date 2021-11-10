import { inspect } from './_private'
import { isFunction } from '../internal'
import { constant } from './combinators'
import { compose, looseCurryN } from './helpers'

export class IO {
  constructor (fn) {
    if (!isFunction(fn)) {
      throw new Error('IO requires a function.')
    }
    this._value = fn
  }

  static of (fn) {
    return new IO(fn)
  }

  static const (x) {
    return new IO(constant(x))
  }

  get isIO () {
    return true
  }

  inspect () {
    return `IO(${inspect(this._value)})`
  }

  run (...args) {
    return this._value(...args)
  }

  perform (...args) {
    return this._value(...args)
  }

  performUnsafeIO (...args) {
    return this._value(...args)
  }

  map (fn) {
    return new IO(compose(fn, this._value))
  }

  join () {
    return new IO(() => this.performUnsafeIO().performUnsafeIO())
  }

  chain (fn) {
    return this.map(fn).join()
    // return new IO(() => fn(this.performUnsafeIO()).performUnsafeIO())
    // return fn(this.performUnsafeIO())
  }

  // !
  ap (mfn) {
    return this.chain(mfn._value)
  }
}

// creator
export const io = fn => new IO(fn)

// helpers
export const run = looseCurryN(1, (mIO, ...args) => mIO.run(...args))
export const perform = looseCurryN(1, (mIO, ...args) => mIO.perform(...args))
export const performUnsafeIO = looseCurryN(1, (mIO, ...args) => mIO.performUnsafeIO(...args))
