import { isObject, isNumber } from '../../internal.js'
import { isAtom } from '../atom.js'
import { BaseMediator } from './base.mediator.js'
import { curryN } from '../../functional.js'

export const isReplayMediator = tar => isObject(tar) && tar.isReplayMediator

export class ReplayMediator extends BaseMediator {
  constructor (atom, replayTime = 1) {
    super(atom)
    this._history = []
    this._consumers = []
    this.setReplayTime(replayTime)
    this._subscribeController = atom.subscribe(val => {
      this._history.push(val)
      this._setHistory()
    })
  }

  get type () {
    return 'ReplayMediator'
  }

  get isReplayMediator () {
    return true
  }

  /**
   * @param options Number | Object
   */
  static of (atom, options) {
    if (!isAtom(atom)) {
      throw (new TypeError('ReplayMediator can apply to an Atom only.'))
    }
    if (isReplayMediator(atom)) {
      return atom
    }

    let _options = {}
    if (isNumber(options)) {
      _options.replayTime = options
    } else if (isObject(options)) {
      _options = {
        ..._options,
        ...options
      }
    } else {
      throw new TypeError(`"options" argument of ReplayMediator is expected to be type of "Number" | "Object", but received ${typeof options}.`)
    }

    const { replayTime, autoTrigger = true } = _options

    const _mediator = new ReplayMediator(atom, replayTime)

    if (autoTrigger) {
      atom.trigger()
    }
    return _mediator
  }

  setReplayTime (replayTime) {
    if (!isNumber(replayTime)) {
      throw (new TypeError('repalyTime is expected to be a Number.'))
    }
    this._replayTime = Math.floor(Math.abs(replayTime))
    this._setHistory()
  }

  _setHistory () {
    const t = this._history.length - this._replayTime
    this._history = this._history.slice(t >= 0 ? t : 0)
  }

  replayTo (consumer) {
    this._history.forEach(val => {
      consumer(val)
    })
  }

  replay () {
    this._consumers.forEach((consumer) => {
      this.replayTo(consumer)
    })
  }

  subscribe (consumer) {
    this._consumers.push(consumer)
    const subscribeController = this._atom.subscribe(consumer)
    this.replayTo(consumer)
    return subscribeController
  }

  // NOTE: important!!!
  // !!! important
  beObservedBy (...args) {
    return args[0].observe(this)
  }

  release () {
    this._subscribeController.unsubscribe()
    super.release()
  }
}

export const replayWithoutLatest = curryN(2, (replayTime, atom) => {
  return ReplayMediator.of(atom, { replayTime, autoTrigger: false })
})
export const replayWithLatest = curryN(2, (replayTime, atom) => {
  return ReplayMediator.of(atom, { replayTime, autoTrigger: true })
})
