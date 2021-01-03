import { inspect } from './_private.js'
import { identity } from './combinators.js'

export class Identity {
  constructor (x) {
    this._value = x
  }

  of (x) {
    return new Identity(x)
  }

  get value () {
    return this._value
  }

  get isIdentity () {
    return true
  }

  inspect () {
    return `Identity(${inspect(this._value)})`
  }

  map (fn) {
    return Identity.of(fn(this._value))
  }

  join () {
    return this._value
  }

  chain (fn) {
    return fn(this._value)
  }

  // ----- Traversable Identity
  sequence (of) {
    return this.traverse(of, identity)
  }

  traverse (of, fn) {
    return fn(this._value).map(Identity.of)
  }
}
