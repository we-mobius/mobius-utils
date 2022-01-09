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

/**
 * @param selector element's id or selector
 * @param interval polling interval (in ms)
 * @return { void } no return value
 */
export const pollingToGetElement = (selector: string, interval: number, callback: (node: Element) => void): void => {
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
}

interface IPollingToGetElement {
  (selector: string, interval: number, callback: (node: Element) => void): void
  (selector: string): (interval: number, callback: (node: Element) => void) => void
  (selector: string, interval: number): (callback: (node: Element) => void) => void
  (selector: string): (interval: number) => (callback: (node: Element) => void) => void
}
/**
 * @see {@link pollingToGetElement}
 */
export const pollingToGetElement_: IPollingToGetElement = curry(pollingToGetElement)
