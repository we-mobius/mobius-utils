import { isPlainObject, isFunction } from '../internal/base'
import {
  isVacuo, TERMINATOR,
  Mutation, Data, isAtomLike,
  pipeAtom, dataToData,
  filterT_, pluckT,
  createDataFromFunction, createDataFromEvent, createFunctionTriggerAgent,
  binaryTweenPipeAtom
} from '../atom'
import { completeStateRD } from './event'
import { makeCustomEvent } from './dom'

import type {
  Terminator,
  AtomLikeOfOutput, AtomLikeOfInput,
  ReplayDataMediator,
  Trigger, TriggerController,
  TriggerDataMediator, TriggerMediatorOptions
} from '../atom'

const GLOBAL_VARS = new Map()
/**
 * Set or get global variable.
 */
export const globalVar = <V = any>(key: any, value?: V): V => {
  if (value !== undefined) {
    GLOBAL_VARS.set(key, value)
  }
  return GLOBAL_VARS.get(key)
}

type EventHandler = (event: Event) => void

/**
 * @see {@link makeGeneralEventHandler}
 */
export const makeEventHandler = <R = Event>(
  handler?: (event: Event) => R
): [EventHandler, Data<R>, TriggerDataMediator<R>, TriggerMediatorOptions, Trigger<R>, TriggerController] => {
  const defaultHandler = (event: Event): Event => event
  const agent = createFunctionTriggerAgent<[event: Event], R>(handler ?? defaultHandler as any)
  const collection = createDataFromFunction<R>({ ...agent })

  return [agent.emit!, ...collection]
}

/**
 * @see {@link makeEventHandler}
 */
export const makeGeneralEventHandler = <R = Event>(
  handler?: (event: Event) => R
): [ReplayDataMediator<EventHandler>, EventHandler, Data<R>, TriggerDataMediator<R>, TriggerMediatorOptions, Trigger<R>, TriggerController] => {
  const eventHandlerCollection = makeEventHandler(handler)
  const [eventHandler] = eventHandlerCollection
  const eventHandlerRD = dataToData(() => eventHandler, completeStateRD)
  return [eventHandlerRD, ...eventHandlerCollection]
}

type MessageDetail = Record<string, any>
type MessageOptions = EventInit
interface FormattedMessage { detail: MessageDetail, options?: MessageOptions }
type Message = FormattedMessage | MessageDetail

type MessageType = 'Onymous' | 'Anonymous'
interface MessageGate { type: MessageType, message: Message }

interface SendedMessage { type: string, detail: MessageDetail, options: EventInit }
type ReceivedMessage = CustomEvent<MessageDetail> & { eventType: string }

class ElementBasedMessageProxy {
  element: Element
  // proxy's default name
  name: string
  // proxy's default event type
  type: string

  messageGateD: Data<MessageGate>

  sendedD: Data<SendedMessage>

  broadReceiver: Data<ReceivedMessage>
  onymousReceiver: Data<ReceivedMessage>
  anonymousReceiver: Data<ReceivedMessage>

  constructor (element: Element, type: string, name: string) {
    this.element = element
    this.type = type
    this.name = name

    const [data] = createDataFromEvent({ target: element, type })

    this.messageGateD = Data.empty<MessageGate>()

    const formatMessage = (message: any): Required<FormattedMessage> => {
      if (isPlainObject(message)) {
        const { detail, options } = message
        if (detail !== undefined) {
          return { detail, options: options ?? {} }
        } else {
          return { detail: message, options: {} }
        }
      } else {
        return { detail: { data: message }, options: {} }
      }
    }

    const onymousSendM = Mutation.ofLiftBoth<MessageGate, SendedMessage | Terminator>((prev) => {
      if (isVacuo(prev)) return TERMINATOR

      const { type: messageType, message } = prev

      if (messageType === 'Anonymous') {
        return TERMINATOR
      } else {
        const { detail, options } = formatMessage(message)
        detail.from = name
        element.dispatchEvent(makeCustomEvent(type, detail, options))
        return { type, detail, options }
      }
    })
    const anonymousSendM = Mutation.ofLiftBoth<MessageGate, SendedMessage | Terminator>((prev) => {
      if (isVacuo(prev)) return TERMINATOR

      const { type: messageType, message } = prev
      if (messageType === 'Onymous') {
        return TERMINATOR
      } else {
        const { detail, options } = formatMessage(message)
        detail.from = undefined
        element.dispatchEvent(makeCustomEvent(type, detail, options))
        return { type, detail, options }
      }
    })
    const sendedD = Data.empty<SendedMessage>()
    pipeAtom(this.messageGateD, onymousSendM, sendedD)
    pipeAtom(this.messageGateD, anonymousSendM, sendedD)
    this.sendedD = sendedD

    const namedReceiver = filterT_(prev => prev.detail.to === name, data)
    this.broadReceiver = data
    this.onymousReceiver = namedReceiver
    this.anonymousReceiver = filterT_(prev => prev.detail.from === undefined, data)
  }

  customizeReveiver (predicate: (target: ReceivedMessage) => boolean): Data<ReceivedMessage> {
    if (isFunction(predicate)) {
      return filterT_(predicate, this.broadReceiver)
    } else if (isPlainObject(predicate)) {
      // TODO
      console.warn("TODO: PlainObject type of predicate as customizeReveiver's argument, you got a broadReceiver instead.")
      return this.broadReceiver
    } else {
      throw (new TypeError('"predicate" is expected to be type of "Function" | "PlainObject".'))
    }
  }

  send (message: MessageGate | AtomLikeOfOutput<MessageGate>): void {
    if (isAtomLike(message)) {
      binaryTweenPipeAtom(message, this.messageGateD)
    } else {
      this.messageGateD.mutate(() => message as MessageGate)
    }
  }

  // TODO: sendAnonymous
  // TODO: sendOnymous

  receive (handler: ((message: ReceivedMessage) => void) | AtomLikeOfInput<ReceivedMessage>): void {
    if (isAtomLike(handler)) {
      binaryTweenPipeAtom(this.broadReceiver, handler)
    } else if (isFunction(handler)) {
      this.broadReceiver.subscribeValue(message => {
        handler(message)
      })
    }
  }

  // TODO: receiveAnonymous
  // TODO: receiveOnymous

  receiveDetail (handler: ((message: MessageDetail) => void) | AtomLikeOfInput<MessageDetail>): void {
    if (isAtomLike(handler)) {
      const mapped: Data<MessageDetail> = pluckT('detail', this.broadReceiver)
      binaryTweenPipeAtom(mapped, handler)
    } else if (isFunction(handler)) {
      this.broadReceiver.subscribeValue(value => {
        handler(value.detail)
      })
    } else {
      throw (new TypeError('"handler" is expected to be type of "Function" | "AtomLike".'))
    }
  }
}

globalVar('ElementBasedMessageProxyMap', new Map())
/**
 * Different proxy can use same type of event on same element,
 *   so the proxy's can live in different sandbox such as contentScript & injectScript.
 *
 * @param id element id
 * @param type event type on element
 * @param name name of proxy instance
 * @return ElementBasedMessageProxy
 */
export const makeElementBasedMessageProxy = (id: string, type: string, name: string): ElementBasedMessageProxy => {
  const existProxy = globalVar('ElementBasedMessageProxyMap').get(id)
  if (existProxy !== undefined) {
    return existProxy
  }

  let element = document.getElementById(id)
  if (element == null) {
    const tempElement = document.createElement('div')
    tempElement.id = id
    tempElement.style.display = 'none'
    document.body.appendChild(tempElement)
    element = tempElement
  }

  const newProxy = new ElementBasedMessageProxy(element, type, name)
  globalVar('ElementBasedMessageProxyMap').set(id, newProxy)

  return newProxy
}
