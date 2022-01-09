import { isFunction, isNormalFunction, isAsyncFunction } from './base'

import type { AnyFunction } from '../@types'

type LooseArray<T extends any[]> = [...T, ...any[]]

export const iife = <T extends AnyFunction>(fn: T, ...args: LooseArray<Parameters<T>>): ReturnType<T> => fn(...args)

/**
 * Generate a one-off function for a given function.
 * @param fn - The function to generate a one-off function for.
 * @param callback - The callback to call when the one-off function is called twice or more.
 */
export const once = <T extends AnyFunction>(
  fn: T, callback?: (times: number) => void
): ((...args: LooseArray<Parameters<T>>) => ReturnType<T>) => {
  let called = false
  let result: ReturnType<typeof fn>
  let times = 0
  return (...args) => {
    times += 1
    if (!called) {
      result = fn(...args)
      called = true
    }
    if (times >= 2 && isFunction(callback)) {
      callback(times)
    }
    return result
  }
}

type SimpleDebounce = <T extends AnyFunction>(fn: T, ms: number) => (...args: LooseArray<Parameters<T>>) => void
export const debounceS: SimpleDebounce = (fn, ms) => {
  let timer: NodeJS.Timeout
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms) as any
  }
}

type Debounce = <T extends AnyFunction>(fn: T, ms: number) => (...args: LooseArray<Parameters<T>>) => Promise<ReturnType<T>>
export const debounce: Debounce = (fn, ms) => {
  let timer: NodeJS.Timeout
  let waiting: AnyFunction[] = []
  return async (...args) => {
    clearTimeout(timer)
    timer = setTimeout((async () => {
      const res = await fn(...args)
      waiting.forEach(resolve => {
        resolve(res)
      })
      waiting = []
    }) as (() => void), ms) as any

    return await new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

const THROTTLE_TYPE_ERROR = new TypeError('Throttle: fn must be a NormalFunction or AsyncFunction')
type SimpleThrottleTime =
  <T extends AnyFunction>(fn: T, ms: number, strict?: boolean) => (...args: LooseArray<Parameters<T>>) => void
/**
 * @param [strict = false] If true, the window of target function be invoked will
 *                                     greater than maxium of specified ms and target function's
 *                                     execution time. If false, just greater than specified ms.
 * @return { Function } Throttled function
 */
export const throttleTimeS: SimpleThrottleTime = (fn, ms, strict = false) => {
  let isCalling = false
  // NOTE: 对于不同的目标函数，分别返回不同的结果，避免在每次运行时再做条件判断。
  if (isNormalFunction(fn)) {
    return (...args) => {
      let executed = false
      let timerExpired = false
      if (!isCalling) {
        isCalling = true
        setTimeout(() => {
          if (!strict) {
            isCalling = false
          } else {
            // 严格模式下
            // 当 Timer 计时结束后，如果目标函数已经执行完了，重置节流状态
            // 如果目标函数没有执行完，使用 timerExpired 标记（计时器已失效，未重置节流状态）
            if (executed) {
              isCalling = false
            } else {
              timerExpired = true
            }
          }
        }, ms)
        fn(...args)
        executed = true
        // 函数执行完的时候，检查 timerExpired 标记，如果为 true，则重置节流状态
        // 如果为 false，则说明计时器还未生效，需要等待计时器生效
        if (timerExpired) {
          isCalling = false
        }
      }
    }
  } else if (isAsyncFunction(fn)) {
    return (...args) => {
      let executed = false
      let timerExpired = false
      if (!isCalling) {
        isCalling = true
        setTimeout(() => {
          if (!strict) {
            isCalling = false
          } else {
            if (executed) {
              isCalling = false
            } else {
              timerExpired = true
            }
          }
        }, ms)
        ;(fn as AnyFunction)(...args).then(() => {
          executed = true
          if (timerExpired) {
            isCalling = false
          }
        })
      }
    }
  } else {
    throw THROTTLE_TYPE_ERROR
  }
}

type SimpleThrottle = <T extends AnyFunction>(fn: T, ms: number) => (...args: LooseArray<Parameters<T>>) => void
export const throttleS: SimpleThrottle = fn => {
  let isCalling = false
  if (isNormalFunction(fn)) {
    return (...args) => {
      if (!isCalling) {
        isCalling = true
        fn(...args)
        isCalling = false
      }
    }
  } else if (isAsyncFunction(fn)) {
    return (...args) => {
      if (!isCalling) {
        isCalling = true
        return (fn as AnyFunction)(...args).then(() => {
          isCalling = false
        })
      }
    }
  } else {
    throw THROTTLE_TYPE_ERROR
  }
}

type ThrottleTime =
  <T extends AnyFunction>(fn: T, ms: number, strict?: boolean) => (...args: LooseArray<Parameters<T>>) => Promise<ReturnType<T>>
/**
 * @param [strict = false] If true, the window of target function be invoked will
 *                                     greater than maxium of specified ms and target function's
 *                                     execution time. If false, just greater than specified ms.
 * @return { Function } Throttled function
 */
export const throttleTime: ThrottleTime = (fn, ms, strict = false) => {
  // NOTE: 代码实现的注释见 throttleTimeS
  let isCalling = false
  let waiting: AnyFunction[] = []
  return async (...args) => {
    let executed = false
    let timerExpired = false
    if (!isCalling) {
      isCalling = true
      setTimeout(() => {
        if (!strict) {
          isCalling = false
        } else {
          if (executed) {
            isCalling = false
          } else {
            timerExpired = true
          }
        }
      }, ms)
      // NOTE: 一般来说，如果目标函数是同步函数，节流版本也会同步执行，
      // 如果是异步函数，节流版本会异步运行，参见：throttleTimeS & throttleS。
      // 需要拿到结果的节流版本一律按照异步处理。
      void Promise.resolve(fn(...args)).then(res => {
        // 先广播执行结果
        waiting.forEach(resolve => {
          resolve(res)
        })
        waiting = []
        // 后重置节流状态
        executed = true
        if (timerExpired) {
          isCalling = false
        }
      })
    }
    return await new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

type Throttle = <T extends AnyFunction>(fn: T) => (...args: LooseArray<Parameters<T>>) => Promise<ReturnType<T>>
export const throttle: Throttle = (fn) => {
  let isCalling = false
  let waiting: AnyFunction[] = []
  return async () => {
    if (!isCalling) {
      isCalling = true
      void Promise.resolve(fn()).then(res => {
        // 先广播执行结果
        waiting.forEach(resolve => {
          resolve(res)
        })
        waiting = []
        // 后重置节流状态
        isCalling = false
      })
    }
    return await new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}
