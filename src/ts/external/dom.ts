import { isString, isNumber, isFunction } from '../internal'
import { curry } from '../functional'

type InjectScript = (src: string, onload?: GlobalEventHandlers['onload'], removeAfterLoaded?: boolean) => HTMLScriptElement
export const injectScript: InjectScript = (
  src: string, onload, removeAfterLoaded = false
): HTMLScriptElement => {
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.src = src
  script.onload = (...args) => {
    if (isFunction(onload)) {
      onload.bind(script)(...args)
    }
    if (removeAfterLoaded) {
      script.parentNode?.removeChild(script)
    }
  }
  document.head.appendChild(script)
  return script
}

type CustomEventMaker = <T extends string, D extends Record<string, unknown>>
  (type: T, detail: D, options: EventInit) => CustomEvent<D>

/**
 * "event.detail" is of type object always,
 * and there is an "eventType" property in it,
 * which equals to custom type's name.
 */
export const makeCustomEvent: CustomEventMaker = (type, detail, options) =>
  new CustomEvent(type, { ...(options ?? {}), detail: { eventType: type, ...(detail ?? {}) } })

/**
 * @param { string } selector element's id or selector
 * @param { number } interval polling interval (in ms)
 * @return { void } no return value
 */
export const pollingToGetNode = curry((selector: string, interval: number, callback: (node: Element) => void): void => {
  if (!isString(selector)) {
    throw (new TypeError('"selector" is expected to be type of "String".'))
  }
  if (!isNumber(interval)) {
    throw (new TypeError('"interval" is expected to be type of "Number".'))
  }
  let node: Element | null = null
  const timer = setInterval(() => {
    if (selector.includes('#') || selector.includes('.')) {
      node = node ?? document.querySelector(selector)
    } else {
      node = node ?? document.getElementById(selector)
    }
    if (node !== null) {
      clearInterval(timer)
      callback(node)
    }
  }, interval)
})
