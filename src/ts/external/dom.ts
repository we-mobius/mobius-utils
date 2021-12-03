import { isString, isNumber, isFunction } from '../internal/base'
import { curry } from '../functional'

export const injectScript = (
  src: string, onload: GlobalEventHandlers['onload'] = null, removeAfterLoaded = false
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

const DEFAULT_CUSTOM_EVENT_DEFAULT: Record<string, unknown> = {}
/**
 * "event.detail" is always of type object which has an "eventType" property in it,
 *   "eventType"'s value equals to name of custom type.
 */
export const makeCustomEvent = <D extends Record<string, unknown>>(
  type: string,
  detail: D = DEFAULT_CUSTOM_EVENT_DEFAULT as D,
  options: EventInit = {}
): CustomEvent<{ eventType: string } & D> =>
    new CustomEvent(type, { ...options, detail: { eventType: type, ...detail } })

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
