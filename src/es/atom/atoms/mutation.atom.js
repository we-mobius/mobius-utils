import { isUndefined, isFunction, isObject, isEmpty } from '../../internal.js'
import { Mutator, Datar, isDatar, isMutator, isTerminator } from '../meta.js'
import { isData } from './data.atom.js'
import { BaseAtom } from './base.atom.js'

/**
 * @param { any } tar
 * @return { boolean }
 */
export const isMutation = tar => isObject(tar) && tar.isMutation

export class Mutation extends BaseAtom {
  constructor (operation, options = {}) {
    super()
    if (!isObject(options)) {
      throw (new TypeError(
        `"options" is expected to be type of "Object", but received "${typeof options}".`
      ))
    }
    this._options = options

    if (isMutator(operation)) {
      this._mutator = operation
    } else if (isFunction(operation)) {
      this._mutator = Mutator.of(operation)
    } else {
      throw new TypeError(
        `"operation" is expected to be type of "Mutator" | "Function", but received "${typeof operation}".`
      )
    }

    this._consumers = new Set()
  }

  /**
   * @return { 'MutationAtom' } 'MutationAtom'
   */
  get type () { return 'MutationAtom' }

  /**
   * @return { true } true
   */
  get isMutation () { return true }

  get isEmpty () { return this._mutator.isEmpty }

  static of (operation, options = {}) {
    return new Mutation(operation, options)
  }

  static empty (options = {}) {
    return new Mutation(Mutator.empty(), options)
  }

  static ofLift (operation, options = {}) {
    const { liftType: type } = options
    return new Mutation(Mutator.lift(operation, { type }), { ...options, isLifted: true, origin_operation: operation })
  }

  static ofLiftBoth (operation, options = {}) {
    return new Mutation(Mutator.liftBoth(operation), { ...options, isLifted: true, origin_operation: operation })
  }

  static ofLiftLeft (operation, options = {}) {
    return new Mutation(Mutator.liftLeft(operation), { ...options, isLifted: true, origin_operation: operation })
  }

  static ofLiftRight (operation, options = {}) {
    return new Mutation(Mutator.liftRight(operation), { ...options, isLifted: true, origin_operation: operation })
  }

  /**
   * Static value of Mutation.
   *
   * @return { Mutator } mutator
   */
  get mutator () { return this._mutator }
  /**
   * @return { function } operation
   */
  get operation () {
    if (this._options && this._options.isLifted) {
      return this._options.origin_operation
    } else {
      return this._mutator.operation
    }
  }

  /**
   * Steram value of Mutation.
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
   * @param { Mutator | undefined } mutator
   * @return { void }
   */
  trigger (mutator) {
    if (!isUndefined(mutator) && !isMutator(mutator)) {
      throw (new TypeError('Mutation must be triggered with a Mutator.'))
    }
    const _mutator = mutator || this.mutator

    if (!isEmpty(_mutator)) {
      this._consumers.forEach(consumer => {
        consumer(_mutator, this)
      })
    }
  }

  triggerOperation (operation) {
    return this.trigger(Mutator.of(operation))
  }

  /**
   * Change the value of Mutation in a stream manner.
   *
   * Given "data" will be **upstream** of current Mutation, which is different from "beObservedBy" method.
   *
   * @param { Mutation } mutation data -> current mutation (-> other data)
   */
  observe (data) {
    if (!isData(data)) {
      throw (new TypeError('Mutation can only observe a Data!'))
    }
    return data.subscribe((datar, data) => {
      this.mutate(datar, data)
    })
  }

  /**
   * Change the value of Mutation in a stream manner.
   *
   * Given "data" will be **downstream** of current Mutation, which is different from "observe" method.
   *
   * @param { Mutation } mutation (other data ->) current mutation -> data
   */
  beObservedBy (data) {
    return data.observe(this)
  }

  /**
   * Change the value of Mutation in a static manner.
   *
   * take datar-like param(convert to datar)
   *   -> run datar with current mutator & contexts
   *   -> wrap and save result of datar.run as new mutator
   *   -> trigger consumers with new mutator & contexts
   *
   * @param { Datar | Data | any } datar Will be the 2nd param of mutator's operation.
   * @param { Data } data
   * @return { Mutation } Mutation(this)
   */
  mutate (datar, data) {
    let _datar = null
    if (isDatar(datar)) {
      _datar = datar
    } else if (isData(datar)) {
      _datar = datar.datar
    } else {
      _datar = Datar.of(datar)
    }

    if (isTerminator(_datar.value)) return this

    let _data
    if (!data) {
      _data = isData(data) ? datar : _data
    } else {
      if (isData(data)) {
        _data = data
      } else {
        throw (new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`))
      }
    }

    // NOTE: 运行效果相当于：const _tempMutator = this._mutator.fill(_datar)
    // 但实际意义完全不同
    const _tempMutator = Mutator.of(_datar.run(this._mutator, _data)).fill(_datar)

    this._mutator = _tempMutator
    this.trigger()

    return this
  }

  /**
   * @param { function } trigger Takes an internalTrigger(Function) as first parameter,
   *                             invoke internalTrigger with any value will lead to
   *                             Mutation's trigger method be triggerd with given value.
   * @param { { forceWrap?: boolean } } options
   * @accept ((mutator -> trigger(mutator)) -> controller, options)
   * @accept ((operation -> trigger(mutator)) -> controller, { forceWrap: true })
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
      if (!isMutator(args[0]) || forceWrap) {
        args[0] = Mutator.of(args[0])
      }
      this.trigger(...args)
    }
    const controller = trigger(_internalTriggerFunction)
    return controller
  }
}
