import { isUndefined, isFunction, isObject, isEmpty } from '../../internal.js'
import { Mutator, Datar, isDatar, isMutator, isTerminator } from '../meta.js'
import { isData } from './data.atom.js'

export const isMutation = tar => isObject(tar) && tar.isMutation

export class Mutation {
  // mutation 其实是一个函数
  // mutation :: a -> a
  constructor (operation, options) {
    if (isMutator(operation)) {
      this._mutator = operation
    } else if (isFunction(operation)) {
      this._mutator = Mutator.of(operation)
    } else {
      throw new TypeError('Param of Mutation constructor must be a Mutator or a Function.')
    }
    if (options) {
      this._options = options
    }
    this._consumers = new Set()
  }

  get isMutation () {
    return true
  }

  get isEmpty () {
    return this._mutator.isEmpty
  }

  // operation :: (datar, datar) -> any
  // operation :: (value, datar) -> any
  // operation :: (datar, value) -> any
  // operation :: (value, value) -> any
  static of (operation) {
    return new Mutation(operation)
  }

  static empty () {
    return new Mutation(Mutator.empty())
  }

  static ofLift (operation, options) {
    return new Mutation(Mutator.lift(operation, options), { isLifted: true, origin_operation: operation })
  }

  static ofLiftBoth (operation) {
    return new Mutation(Mutator.liftBoth(operation), { isLifted: true, origin_operation: operation })
  }

  static ofLiftLeft (operation) {
    return new Mutation(Mutator.liftLeft(operation), { isLifted: true, origin_operation: operation })
  }

  static ofLiftRight (operation) {
    return new Mutation(Mutator.liftRight(operation), { isLifted: true, origin_operation: operation })
  }

  // Mutation 常规值
  get mutator () { return this._mutator }
  get operation () {
    if (this._options && this._options.isLifted) {
      return this._options.origin_operation
    } else {
      return this._mutator.operation
    }
  }

  // Mutation 流式值
  // consumer :: f -> ()
  // subscribe :: (f -> ()) -> SubscribeController
  subscribe (consumer) {
    // 维护 consumer 列表
    // 保证数据 mutate 之后 notify/trigger consumer
    // unsubscribe 机制
    this._consumers.add(consumer)
    return {
      unsubscribe: () => {
        return this._consumers.delete(consumer)
      }
    }
  }

  trigger (mutator) {
    if (!isUndefined(mutator) && !isMutator(mutator)) {
      throw (new TypeError('Mutation must be triggered with a Mutator.'))
    }
    const _mutator = mutator || this.mutator
    if (!isEmpty(_mutator)) {
      this._consumers.forEach(consumer => {
        consumer(_mutator)
      })
    }
  }

  // Mutation 流式变更 1
  observe (data) {
    if (!isData(data)) {
      throw (new TypeError('Mutation can only observe a Data!'))
    }
    return data.subscribe(datar => {
      this.mutate(datar)
    })
  }

  // Mutation 流式变更 2
  beObservedBy (data) {
    return data.observe(this)
  }

  // Mutation 常规变更
  // mutate :: Datar -> Mutation
  // mutate :: Data -> Mutation
  // mutate :: Any -> Mutation
  mutate (data) {
    let _datar = null
    if (isDatar(data)) {
      _datar = data
    } else if (isData(data)) {
      _datar = data.datar
    } else {
      _datar = Datar.of(data)
    }

    if (isTerminator(_datar.value)) return this

    // 运行效果相当于：const _tempMutator = this._mutator.fill(_datar)
    // 但实际意义完全不同
    const _tempMutator = Mutator.of(_datar.run(this._mutator)).fill(_datar)

    this._mutator = _tempMutator
    this.trigger()

    return this
  }

  // registerTrigger :: ((mutator -> trigger(mutator)) -> controller, options) -> controller
  // registerTrigger :: ((operation -> trigger(mutator)) -> controller, options) -> controller
  registerTrigger (trigger, { forceWrap = false } = {}) {
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
