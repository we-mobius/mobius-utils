import { isUndefined, isFunction, isObject, isEmpty } from '../../internal.js'
import { Mutator, Datar, isDatar, isMutator, isTerminator } from '../meta.js'
import { isMutation } from './mutation.atom.js'
import { BaseAtom } from './base.atom.js'

/**
 * @param { any } tar
 * @return { boolean }
 */
export const isData = tar => isObject(tar) && tar.isData

export class Data extends BaseAtom {
  constructor (value, options = {}) {
    super()
    if (!isObject(options)) {
      throw (new TypeError(
        `"options" is expected to be type of "Object", but received "${typeof options}".`
      ))
    }
    this._options = options

    if (isDatar(value)) {
      this._datar = value
    } else {
      this._datar = Datar.of(value)
    }
    this._consumers = new Set()
  }

  /**
   * @return { 'DataAtom' } 'DataAtom'
   */
  get type () { return 'DataAtom' }

  /**
   * @return { true } true
   */
  get isData () { return true }

  get isEmpty () { return this._datar.isEmpty }

  static of (value, options = {}) {
    return new Data(value, options)
  }

  /**
   * Same as Data.of(VACUO)
   *
   * @return { Data }
   */
  static empty (options = {}) {
    return new Data(Datar.empty(), options)
  }

  /**
   * Static value of Data.
   *
   * @return { Datar } datar
   */
  get datar () { return this._datar }
  /**
   * Static value of Data, same as Data.datar.value.
   *
   * @return { any } value
   */
  get value () { return this._datar.value }

  /**
   * Steram value of Data.
   *
   * @param { function } consumer The consumer will be invoked by trigger method when there is a adequate value.
   * @return { { unsubscribe: function } } SubscriptionController
   */
  subscribe (consumer) {
    this._consumers.add(consumer)
    return {
      unsubscribe: () => {
        return this._consumers.delete(consumer)
      }
    }
  }

  /**
   * @param { Datar | undefined } datar
   * @return { void }
   */
  trigger (datar) {
    if (!isUndefined(datar) && !isDatar(datar)) {
      throw (new TypeError('Data must be triggered with a Datar.'))
    }
    const _datar = datar || this.datar

    if (!isEmpty(_datar)) {
      this._consumers.forEach(consumer => {
        consumer(_datar, this)
      })
    }
  }

  triggerValue (value) {
    return this.trigger(Datar.of(value))
  }

  /**
   * Change the value of Data in a stream manner.
   *
   * Given "mutation" will be **upstream** of current Data, which is different from "beObservedBy" method.
   *
   * @param { Mutation } mutation (other data ->) mutation -> current data
   */
  observe (mutation) {
    if (!isMutation(mutation)) {
      throw (new TypeError('Data can only observe a Mutation!'))
    }
    return mutation.subscribe((mutator, mutation) => {
      this.mutate(mutator, mutation)
    })
  }

  /**
   * Change the value of Data in a stream manner.
   *
   * Given "mutation" will be **downstream** of current Data, which is different from "observe" method.
   *
   * @param { Mutation } mutation current data -> mutation (-> other data)
   */
  beObservedBy (mutation) {
    return mutation.observe(this)
  }

  /**
   * Change the value of Data in a static manner.
   *
   * take mutator-like param(convert to mutator)
   *   -> run mutator with current datar & contexts
   *   -> wrap and save result of mutator.run as new datar
   *   -> trigger consumers with new datar & contexts
   *
   * @param { Mutator | Mutation | function } mutator Used to produce new value with current datar.
   * @param { Mutation } mutation Provide to mutator's operation (function) as execute contexts.
   * @return { Data } Data(this)
   */
  mutate (mutator, mutation) {
    let _mutator
    if (isMutator(mutator)) {
      _mutator = mutator
    } else if (isMutation(mutator)) {
      _mutator = mutator.mutator
    } else if (isFunction(mutator)) {
      _mutator = Mutator.of(mutator)
    } else {
      throw (new TypeError(`"mutator" is expected to be type of "Mutator" | "Mutation" | "Function", but received "${typeof mutator}".`))
    }
    let _mutation
    if (!mutation) {
      _mutation = isMutation(mutator) ? mutator : _mutation
    } else {
      if (isMutation(mutation)) {
        _mutation = mutation
      } else {
        throw (new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`))
      }
    }

    const _tempDatar = Datar.of(_mutator.run(this._datar, _mutation)).fill(_mutator)

    // NOTE: If result of operation is TERMINATOR,
    // do not update the datar or trigger the subscribers
    if (!isTerminator(_tempDatar.value)) {
      this._datar = _tempDatar
      this.trigger()
    }

    return this
  }

  /**
   * @param { function } trigger Takes an internalTrigger(Function) as first parameter,
   *                             invoke internalTrigger with any value will lead to
   *                             Data's trigger method be triggerd with given value.
   * @param { { forceWrap?: boolean } } options
   * @accept ((datar -> trigger(datar)) -> controller, options)
   * @accept ((value -> trigger(datar)) -> controller, { forceWrap: true })
   * @return { {} } TriggerController
   */
  registerTrigger (trigger, options = {}) {
    if (!trigger) {
      throw (new TypeError(`"trigger" is required, but received "${trigger}".`))
    }
    if (!isFunction(trigger)) {
      throw (new TypeError(`"trigger" is expected to be type of "Function", but received "${typeof trigger}".`))
    }
    if (!isObject(options)) {
      throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
    }

    const { forceWrap = false } = options

    const _internalTriggerFunction = (...args) => {
      if (!isDatar(args[0]) || forceWrap) {
        args[0] = Datar.of(args[0])
      }
      return this.trigger(...args)
    }

    const controller = trigger(_internalTriggerFunction)
    return controller
  }
}
