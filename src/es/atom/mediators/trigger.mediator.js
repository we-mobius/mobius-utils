import { isAtom } from '../atom.js'
import { isObject } from '../../internal.js'
import { BaseMediator } from './base.mediator.js'

export const isTriggerMediator = tar => isObject(tar) && tar.isTriggerMediator

export class TriggerMediator extends BaseMediator {
  constructor (atom) {
    super(atom)
    // _map :: (trigger, controller)
    this._map = new WeakMap()
  }

  get type () {
    return 'TriggerMediator'
  }

  get isTriggerMediator () {
    return true
  }

  static of (atom) {
    if (!isAtom(atom)) {
      throw (new TypeError('TriggerManager can apply to an Atom (Data or Mutation) only.'))
    }
    return new TriggerMediator(atom)
  }

  get map () {
    return this._map
  }

  // _add :: (trigger, controller) -> Map
  _add (trigger, controller) {
    return this._map.set(trigger, controller)
  }

  // _remove :: trigger -> Boolean
  _remove (trigger) {
    return this._map.delete(trigger)
  }

  register (trigger, options) {
    const controller = this._atom.registerTrigger(trigger, options)
    controller && this._add(trigger, controller)
    return controller
  }

  get (trigger) {
    return this._map.get(trigger)
  }

  // remove :: trigger -> Boolean
  remove (trigger) {
    const controller = this._map.get(trigger)
    controller && controller.cancel()
    return this._remove(trigger)
  }

  // removeAll :: () -> Boolean
  removeAll () {
    let successFlag = false
    this._map.forEach((controller, trigger) => {
      controller.cancel()
      successFlag = this._remove(trigger) && successFlag
    })
    return successFlag
  }

  release () {
    this.removeAll()
    super.release()
  }
}
