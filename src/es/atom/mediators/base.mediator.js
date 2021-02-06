import { isObject } from '../../internal.js'
import { pipe, compose } from '../../functional.js'

export const isMediator = tar => isObject(tar) && tar.isMediator

export class BaseMediator {
  constructor (atom) {
    if (new.target === BaseMediator) {
      throw new Error('BaseMediator can not be instantiated!')
    }
    this._atom = atom
  }

  /***********************************************************
   *             Mediator's propertys and methods
   ***********************************************************/

  get isMediator () {
    return true
  }

  /***********************************************************
   *                Atom's propertys and methods
   ***********************************************************/

  get atom () {
    return this._atom
  }

  get isAtom () {
    return this._atom.isAtom
  }

  get isData () {
    return this._atom.isData
  }

  get isMutation () {
    return this._atom.isMutation
  }

  get isEmpty () {
    return this._atom.isEmpty
  }

  get datar () {
    if (this.isData) {
      return this._atom.datar
    } else {
      throw (new TypeError('There is no "datar" property on Mutation instance.'))
    }
  }

  get value () {
    if (this.isData) {
      return this._atom.value
    } else {
      throw (new TypeError('There is no "value" property on Mutation instance.'))
    }
  }

  get mutator () {
    if (this.isMutation) {
      return this._atom.mutator
    } else {
      throw (new TypeError('There is no "mutator" property on Data instance.'))
    }
  }

  get operation () {
    if (this.isMutation) {
      return this._atom.operation
    } else {
      throw (new TypeError('There is no "operation" property on Data instance.'))
    }
  }

  subscribe (...args) {
    return this._atom.subscribe(...args)
  }

  trigger (...args) {
    return this._atom.trigger(...args)
  }

  triggerValue (...args) {
    if (this.isData) {
      return this._atom.triggerValue(...args)
    } else {
      throw (new TypeError('There is no "triggerValue" method on Mutation instance.'))
    }
  }

  triggerOperation (...args) {
    if (this.isMutation) {
      return this._atom.triggerOperation(...args)
    } else {
      throw (new TypeError('There is no "triggerOperation" method on Data instance.'))
    }
  }

  observe (...args) {
    return this._atom.observe(...args)
  }

  beObservedBy (...args) {
    return this._atom.beObservedBy(...args)
  }

  mutate (...args) {
    return this._atom.mutate(...args)
  }

  registerTrigger (...args) {
    return this._atom.registerTrigger(...args)
  }

  pipe (...args) {
    // ! do not use:
    // ! return this._atom.pipe(...args)
    return pipe(...args)(this)
  }

  compose (...args) {
    // ! do not use:
    // ! return this._atom.compose(...args)
    return compose(...args)(this)
  }

  release () {
    this._atom = null
  }
}
