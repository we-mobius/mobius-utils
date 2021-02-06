import { isUndefined, isFunction, isObject, isEmpty } from '../../internal.js'
import { Mutator, Datar, isDatar, isMutator, isTerminator } from '../meta.js'
import { isMutation } from './mutation.atom.js'
import { BaseAtom } from './base.atom.js'

export const isData = tar => isObject(tar) && tar.isData

export class Data extends BaseAtom {
  constructor (value) {
    super()
    if (isDatar(value)) {
      this._datar = value
    } else {
      this._datar = Datar.of(value)
    }
    this._consumers = new Set()
  }

  get type () {
    return 'DataAtom'
  }

  get isData () {
    return true
  }

  get isEmpty () {
    return this._datar.isEmpty
  }

  static of (value) {
    return new Data(value)
  }

  // Data.empty() <=> Data.of(VACUO)
  static empty () {
    return new Data(Datar.empty())
  }

  // Data 常规值
  get datar () { return this._datar }
  get value () { return this._datar.value }

  // Data 流式值
  // consumer:: a -> ()
  // subscribe :: (a -> ()) -> SubscribeController
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

  trigger (datar) {
    if (!isUndefined(datar) && !isDatar(datar)) {
      throw (new TypeError('Data must be triggered with a Datar.'))
    }
    const _datar = datar || this.datar
    if (!isEmpty(_datar)) {
      this._consumers.forEach(consumer => {
        consumer(_datar)
      })
    }
  }

  triggerValue (value) {
    return this.trigger(Datar.of(value))
  }

  // Data 流式变更 1
  observe (mutation) {
    if (!isMutation(mutation)) {
      throw (new TypeError('Data can only observe a Mutation!'))
    }
    return mutation.subscribe(mutator => {
      this.mutate(mutator)
    })
  }

  // Data 流式变更 2
  beObservedBy (mutation) {
    return mutation.observe(this)
  }

  // Data 常规变更
  // 接收 mutation -> mutation 执行数据变更 -> 保存 mutation 结果 -> 广播 mutation 结果
  // mutate :: Mutation -> Data
  // mutator :: Mutator -> Data
  // mutate :: f -> Data
  mutate (mutation) {
    let _mutator = null
    if (isMutator(mutation)) {
      _mutator = mutation
    } else if (isMutation(mutation)) {
      _mutator = mutation.mutator
    } else if (isFunction(mutation)) {
      _mutator = Mutator.of(mutation)
    } else {
      throw (new TypeError('Param of "mutate" must be a Mutation or a Mutator or a normal Function.'))
    }

    const _tempDatar = Datar.of(_mutator.run(this._datar)).fill(_mutator)

    // NOTE: If result of operation is TERMINATOR,
    // do not update the datar or trigger the subscribers
    if (!isTerminator(_tempDatar.value)) {
      this._datar = _tempDatar
      this.trigger()
    }

    return this
  }

  // registerTrigger :: ((datar -> trigger(datar)) -> controller, options) -> controller
  // registerTrigger :: ((value -> trigger(mutator)) -> controller, options) -> controller
  registerTrigger (trigger, { forceWrap = false } = {}) {
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
