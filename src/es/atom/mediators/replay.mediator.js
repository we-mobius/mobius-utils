import { isObject, isNumber } from '../../internal.js'
import { isAtom } from '../atom.js'
import { BaseMediator } from './base.mediator.js'

export const isReplayMediator = tar => isObject(tar) && tar.isReplayMediator

export class ReplayMediator extends BaseMediator {
  constructor (atom, replayTime = 1) {
    super(atom)
    this._history = []
    this.setReplayTime(replayTime)
    this._subscribeController = atom.subscribe(val => {
      this._history.push(val)
      this._setHistory()
    })
  }

  get isReplayMediator () {
    return true
  }

  static of (atom, options) {
    if (!isAtom(atom)) {
      throw (new TypeError('ReplayMediator can apply to an Atom (Data or Mutation) only.'))
    }

    let _options = {}
    if (isNumber(options)) {
      _options.replayTime = options
    } else if (isObject(options)) {
      _options = {
        ..._options,
        ...options
      }
    }

    const { replayTime, autoTrigger = false } = _options

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

  replay (consumer) {
    this._history.forEach(val => {
      consumer(val)
    })
  }

  subscribe (consumer) {
    const subscribeController = this._atom.subscribe(consumer)
    this.replay(consumer)
    return subscribeController
  }

  release () {
    this._subscribeController.unsubscribe()
    super.release()
  }
}
