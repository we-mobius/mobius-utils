import {
  Mutation, Data, isMutation, isData, isAtom,
  pipeAtom, dataToData, mutationToDataS, dataToMutationS, atomToMutation,
  filterT_,
  createDataFromFunction, createDataFromEvent
} from '../atom'
import { completeStateRD } from './event'
import { isObject, isFunction, hasOwnProperty } from '../internal'
import { makeCustomEvent } from './dom'

const GLOBAL_VARS = new Map()
export const globalVar = (key, value) => {
  if (value) {
    GLOBAL_VARS.set(key, value)
  }
  return GLOBAL_VARS.get(key)
}

export const makeEventHandler = (handler = v => v) => {
  let eventHandler
  const agent = handler => {
    eventHandler = handler
  }
  const [data, triggerMediator, trigger] = createDataFromFunction({ agent, handler: e => handler(e) })

  return [eventHandler, data, triggerMediator, trigger]
}

export const makeGeneralEventHandler = (handler = v => v) => {
  const [eventHandler, data, triggerMediator, trigger] = makeEventHandler(handler)
  const eventHandlerRD = dataToData(() => eventHandler, completeStateRD)
  return [eventHandlerRD, eventHandler, data, triggerMediator, trigger]
}

const _elementBasedMessageProxyMap = new Map()
globalVar('elementBasedMessageProxyMap', _elementBasedMessageProxyMap)
export const makeElementBasedMessageProxy = (id, type, name) => {
  const proxy = _elementBasedMessageProxyMap.get(id + type)
  if (proxy) {
    return proxy
  }

  let ele = document.getElementById(id)
  if (ele == null) {
    const tempEle = document.createElement('div')
    tempEle.id = id
    tempEle.style.display = 'none'
    document.body.appendChild(tempEle)
    ele = tempEle
  }

  const ElementBasedMessageProxy = class {
    constructor (ele, type, name) {
      const [data] = createDataFromEvent({ target: ele, type })

      const onymousInnerMessageD = Data.empty()
      const onymousSendM = Mutation.ofLiftBoth((prev) => {
        let detail, options
        if (isObject(prev)) {
          if (hasOwnProperty('detail', prev) && hasOwnProperty('options', prev)) {
            detail = prev.detail
            options = prev.options
          } else {
            detail = prev
          }
        } else {
          detail = { data: prev }
        }
        detail.from = name
        ele.dispatchEvent(makeCustomEvent(type, detail, options))
        return { type, detail, options }
      })
      const anonymousSendM = Mutation.ofLiftBoth((prev) => {
        let detail, options
        if (isObject(prev)) {
          if (hasOwnProperty('detail', prev) && hasOwnProperty('options', prev)) {
            detail = prev.detail
            options = prev.options
          } else {
            detail = prev
          }
        } else {
          detail = { data: prev }
        }
        ele.dispatchEvent(makeCustomEvent(type, detail, options))
        return { type, detail, options }
      })
      const sendedD = Data.empty()
      pipeAtom(onymousInnerMessageD, onymousSendM, sendedD)
      pipeAtom(anonymousSendM, sendedD)

      this.element = ele
      this.type = type
      this.name = name

      this.innerMessageD = onymousInnerMessageD
      this.sender = onymousSendM
      this.onymousSender = onymousSendM
      this.anonymousSender = onymousSendM
      this.sendedD = sendedD
      const namedReceiver = filterT_(prev => prev.detail.to === name, data)
      this.receiver = namedReceiver
      this.broadReceiver = data
      this.namedReceiver = namedReceiver
      this.anonymousReceiver = filterT_(prev => prev.detail.from === undefined, data)
    }

    customizeReveiver (cond) {
      if (isFunction(cond)) {
        return filterT_(cond, this.broadReceiver)
      } else if (isObject(cond)) {
        // TODO
        console.warn("TODO: Object type of cond as customizeReveiver's argument, you got a broadReceiver instead.")
        return this.broadReceiver
      } else {
        throw (new TypeError('"cond" is expected to be a Function or an Object'))
      }
    }

    send (message) {
      if (isData(message)) {
        return this.sender.observe(message)
      } else if (isMutation(message)) {
        return this.sender.observe(mutationToDataS(message))
      } else {
        this.innerMessageD.triggerValue(message)
      }
    }

    receive (handler) {
      if (isMutation(handler)) {
        return handler.observe(this.receiver)
      } else if (isData(handler)) {
        return dataToMutationS(handler).observe(this.receiver)
      } else if (isFunction(handler)) {
        return this.receiver.subscribe(({ value }) => {
          handler(value)
        })
      } else {
        throw (new TypeError('"handler" is expected to be type of Mutation | Data | Function.'))
      }
    }

    receiveDetail (handler) {
      if (isFunction(handler)) {
        return this.receiver.subscribe(({ value: e }) => {
          handler(e.detail)
        })
      } else if (isAtom(handler)) {
        return atomToMutation(e => e.detail, handler).observe(this.receiver)
      } else {
        throw (new TypeError('"handler" is expected to be type of Mutation | Data | Function.'))
      }
    }
  }

  const _proxy = new ElementBasedMessageProxy(ele, type, name)
  _elementBasedMessageProxyMap.set(id + type, _proxy)
  return _proxy
}
