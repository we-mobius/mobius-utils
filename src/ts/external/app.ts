import { isPlainObject, isFunction } from '../internal/base'
import {
  isVacuo, TERMINATOR,
  Mutation, Data, isAtomLike,
  pipeAtom,
  filterT, pluckT,
  createDataFromEvent,
  binaryTweenPipeAtom
} from '../atom'
import { makeCustomEvent } from './event'

import type {
  Terminator,
  AtomLikeOfOutput, AtomLikeOfInput
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

interface MessageDetail extends Record<string, any> {
  from?: string | undefined
  to?: string | undefined
}
type MessageOptions = EventInit
interface FormattedMessage { detail: MessageDetail, options?: MessageOptions }
type Message = FormattedMessage | MessageDetail

type MessageType = 'onymous' | 'anonymous'
/**
 * Format for sending messages.
 */
interface MessageGate { type: MessageType, message: Message }
/**
 * The format of the send message.
 */
interface SendedMessage { type: string, detail: MessageDetail, options: EventInit }
/**
 * Custom message event, specify the format of `event.detail` property.
 */
type MessageReceivedEvent = CustomEvent<MessageDetail & { eventType: string }>

/**
 * Format message to standard form for sending.
 */
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

class ElementBasedMessageProxy {
  element: Element
  /**
   * proxy's default name
   */
  name: string
  /**
   * proxy's default event type
   */
  type: string

  /**
   * Mutate `messageGateD` to send message.
   */
  messageGateD: Data<MessageGate>

  /**
   * Sended messages will be gathered in `sendedD`.
   */
  sendedD: Data<SendedMessage>

  broadReceiver: Data<MessageReceivedEvent>
  onymousReceiver: Data<MessageReceivedEvent>
  anonymousReceiver: Data<MessageReceivedEvent>

  constructor (element: Element, type: string, name: string) {
    this.element = element
    this.type = type
    this.name = name

    const [receivedD] = createDataFromEvent<Element, MessageReceivedEvent>({ target: element, type })

    this.messageGateD = Data.empty<MessageGate>()
    const sendM = Mutation.ofLiftBoth<MessageGate, SendedMessage | Terminator>((prev) => {
      if (isVacuo(prev)) return TERMINATOR

      const { type: messageType, message } = prev
      const { detail, options } = formatMessage(message)

      if (messageType === 'onymous') {
        detail.from = name
      } else if (messageType === 'anonymous') {
        detail.from = undefined
      } else {
        throw (new TypeError('"messageType" is expected to be "onymous" | "anonymous".'))
      }

      element.dispatchEvent(makeCustomEvent(type, detail, options))
      return { type, detail, options }
    })
    const sendedD = Data.empty<SendedMessage>()
    pipeAtom(this.messageGateD, sendM, sendedD)
    this.sendedD = sendedD

    const namedReceiver = filterT(prev => prev.detail.to === name, receivedD)
    this.broadReceiver = receivedD
    this.onymousReceiver = namedReceiver
    this.anonymousReceiver = filterT(prev => prev.detail.from === undefined, receivedD)
  }

  customizeReveiver (predicate: (target: MessageReceivedEvent) => boolean): Data<MessageReceivedEvent> {
    if (isFunction(predicate)) {
      return filterT(predicate, this.broadReceiver)
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

  receive (handler: ((message: MessageReceivedEvent) => void) | AtomLikeOfInput<MessageReceivedEvent>): void {
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
