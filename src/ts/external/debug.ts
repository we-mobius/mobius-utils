/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil, isArray, isPlainObject, isFunction } from '../internal/base'
import { curry } from '../functional'

export const perf = {
  get now (): number {
    return Math.round(performance.now())
  }
}

/**
 * @deprecated 重新规划一个更好的日志方案，支持运行时日志和应用监控两个主要场景
 * @param { string } file file name
 * @param { string } functionName function name
 * @param { string } description description
 * @return { void } no return value
 */
export const stdLineLog = curry(
  (file: string, functionName: string, description: string) => `[${perf.now}][${file}] ${functionName}: ${description}`
)

// reference: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/content/appendix_a.html

/**
 * @signature inspect :: a -> string
 */
export const inspect = (x: any): string => {
  if (isNil(x)) {
    return String(x)
  } else if (typeof x.inspect === 'function') {
    return x.inspect()
  } else {
    const inspectTerm = (target: any): string => {
      if (isFunction(target)) {
        return target.name !== '' ? target.name : target.toString()
      } else if (isArray(target)) {
        return `[${target.map(inspect).join(', ')}]`
      } else if (isPlainObject(target)) {
        const pairs = Object.entries(target).map(([k, v]) => [k, inspect(v)])
        return `{${pairs.map(kv => kv.join(': ')).join(', ')}}`
      } else {
        return String(target)
      }
    }
    return inspectTerm(x)
  }
}
