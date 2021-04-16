import { isObject } from '../../internal.js'
import { looseCurryN } from '../../functional.js'
import {
  Data, Mutation, isAtom
} from '../../atom.js'
import { BaseMediator } from './base.mediator.js'

export const isFlatMediator = tar => isObject(tar) && tar.isFlatMediator

export class FlatMediator extends BaseMediator {
  constructor (atom, options) {
    const flattedD = Data.empty()
    super(flattedD)
    this._atom = flattedD
    this._origin_atom = atom
    this._connection = null
    this._subscribeController = null
    this.options = options

    // initialize
    const { autoConnect } = this.options
    if (autoConnect) {
      this.connect()
    }
  }

  get type () {
    return 'FlatMediator'
  }

  get isFlatMediator () {
    return true
  }

  static of (atom, options) {
    if (!isAtom(atom)) {
      throw (new TypeError('FlatMediator can apply to an Atom only.'))
    }
    const { autoConnect = true } = options
    return new FlatMediator(atom, { autoConnect })
  }

  connect () {
    if (this._origin_atom.isData) {
      // Data -> extract value(Data) -> asIsM -> newData
      const asIsM = Mutation.ofLiftLeft(prevD => prevD)
      this._subscribeController = this._origin_atom.subscribe(({ value }) => {
        const subscribeController1 = this._atom.observe(asIsM)
        const subscribeController2 = asIsM.observe(value)
        // value is a normal Data which means it will not replay the latest value automatically
        value.trigger()
        this._connection = {
          unsubscribe: () => {
            subscribeController1.unsubscribe()
            subscribeController2.unsubscribe()
          }
        }
      })
    } else if (this.isMutation) {
      // Mutation -> tempData -> extract value(Data) -> asIsM -> newData
      const tempData = Data.empty()
      const asIsM = Mutation.ofLiftLeft(prevD => prevD)
      this._subscribeController = tempData.subscribe(({ value }) => {
        const subscribeController1 = this._atom.observe(asIsM)
        const subscribeController2 = asIsM.observe(value)
        // value is a normal Data which means it will not replay the latest value automatically
        value.trigger()
        this._connection = {
          unsubscribe: () => {
            subscribeController1.unsubscribe()
            subscribeController2.unsubscribe()
          }
        }
      })
      tempData.observe(this._origin_atom)
    }
  }

  disconnect () {
    if (this._connection) {
      this._connection.unsubscribe()
      this._connection = null
    }
  }

  release () {
    this._subscribeController.unsubscribe()
    super.release()
  }
}

export const withValueFlatted = looseCurryN(1, (atom, options = {}) => {
  return FlatMediator.of(atom, options)
})
