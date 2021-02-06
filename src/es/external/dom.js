import { isString, isNumber } from '../internal.js'
import { curryN } from '../functional.js'

export const injectScript = (src, onload = () => {}, removeAfterLoad = false) => {
  const script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.src = src
  script.onload = (...args) => {
    onload(...args)
    if (removeAfterLoad) {
      script.parentNode.removeChild(script)
    }
  }
  document.head.appendChild(script)
  return script
}

export const makeCustomEvent = curryN(3, (type, detail, options) =>
  new CustomEvent(type, { ...(options || {}), detail: { eventType: type, ...(detail || {}) } })
)

/**
 * @param selector String, id | selector
 * @param interval Number, polling interval (in ms)
 * @return undefined
 */
export const pollingToGetNode = curryN(3, (selector, interval, callback) => {
  if (!isString(selector)) {
    throw (new TypeError('"selector" argument of pollingToGetNode is expected to be type of "String".'))
  }
  if (!isNumber(interval)) {
    throw (new TypeError('"interval" argument of pollingToGetNode is expected to be type of "Number".'))
  }
  let node
  let timer = 0
  timer = setInterval(() => {
    if (selector.includes('#') || selector.includes('.')) {
      node = node || document.querySelector(selector)
    } else {
      node = node || document.getElementById(selector)
    }
    if (node) {
      clearInterval(timer)
      callback(node)
    }
  }, interval)
})
