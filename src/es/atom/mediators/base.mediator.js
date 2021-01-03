
export class BaseMediator {
  constructor (atom) {
    if (new.target === BaseMediator) {
      throw new Error('BaseMediator can not be instantiated!')
    }
    this._atom = atom
  }

  get isMediator () {
    return true
  }

  get atom () {
    return this._atom
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

  subscribe (...args) {
    return this._atom.subscribe(...args)
  }

  trigger (...args) {
    return this._atom.trigger(...args)
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

  release () {
    this._atom = null
  }
}
