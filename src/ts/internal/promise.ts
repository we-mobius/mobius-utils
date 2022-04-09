import { isPlainObject, isFunction } from './base'

/**
 * @see {@link https://crocks.dev/docs/functions/helpers.html#composep}
 * @see {@link catchReject}
 */
export const thenDo = async <T = any, R = any>(
  doer: (value: T) => R | PromiseLike<R>, target: Promise<T>
): Promise<R> => await target.then(doer)

/**
 * @see {@link thenDo}
 */
export const catchReject = async <T = any, R = any>(
  catcher: (reason: any) => R | PromiseLike<R>, target: Promise<T>
): Promise<T | R> => {
  return await target.catch(catcher)
}

const FAILED_PROMISE_RESULT_TYPE = Symbol('failed')
/**
 * NOTE: `FailedPromiseResult` is a library specified type.
 */
export interface FailedPromiseResult {
  __type__: typeof FAILED_PROMISE_RESULT_TYPE
  reason: any
}
export interface IndexedFailedPromiseResult extends FailedPromiseResult {
  index: number
}
/**
 * Predicate whether the target is a failed promise result.
 *
 * @see {@link FailedPromiseResult}
 */
export const isFailedPromiseResult = (tar: any): tar is FailedPromiseResult => {
  return isPlainObject(tar) && tar.__type__ === FAILED_PROMISE_RESULT_TYPE
}
/**
 * Designed to use as `onrejected` callback of `Promise.catch` to return a standard `FailedPromiseResult`.
 *
 * @see {@link FailedPromiseResult}
 */
const failedPromiseCatcher = (reason: any): FailedPromiseResult => {
  return { __type__: FAILED_PROMISE_RESULT_TYPE, reason }
}
/**
 * Giving a array, filter non-`FailedPromiseResult` items.
 */
export const filterSuccessfulPromiseResults = <T>(results: Array<T | FailedPromiseResult>): T[] => {
  return results.filter((result) => !isFailedPromiseResult(result)) as T[]
}
/**
 * Giving a array, filter `FailedPromiseResult` items, with extra `index` property
 * which indicate the index of the item in the original array.
 */
export const filterFailedPromiseResults = <T>(
  results: Array<T | FailedPromiseResult>
): IndexedFailedPromiseResult[] => {
  return results.reduce<IndexedFailedPromiseResult[]>((accumulatedResults, currentResult, index) => {
    if (isFailedPromiseResult(currentResult)) {
      accumulatedResults.push({ ...currentResult, index })
    }
    return accumulatedResults
  }, [])
}

export interface QueuePromiseOptions {
  breakTime?: number
}
export const DEFAULT_QUEUE_PROMISES_OPTIONS: Required<QueuePromiseOptions> = {
  breakTime: 0
}
export const queuePromises = async <T = any>(
  promiseMakers: Array<(index: number, previousResult?: T | FailedPromiseResult) => Promise<T>>,
  options: QueuePromiseOptions = DEFAULT_QUEUE_PROMISES_OPTIONS
): Promise<Array<T | FailedPromiseResult>> => {
  if (promiseMakers.length === 0) { return [] }

  const { breakTime } = { ...DEFAULT_QUEUE_PROMISES_OPTIONS, ...options }
  const results: Array<T | FailedPromiseResult> = []

  const [firstPromiseMaker, ...restPromiseMakers] = promiseMakers
  const lastPromise = restPromiseMakers.reduce(async (accumulatedPromise, currentPromise, index) => {
    return await accumulatedPromise
      .catch(failedPromiseCatcher)
      .then(async (result) => {
        results.push(result)
        return await new Promise((resolve) => {
          setTimeout(() => {
            resolve(currentPromise(index + 1, result))
          }, breakTime)
        })
      })
  }, firstPromiseMaker(0, undefined))

  return await lastPromise
    .catch(failedPromiseCatcher)
    .then(result => {
      results.push(result)
      return results
    })
}

export interface RetryPromiseOptions {
  breakTime?: number
  maxTryTimes?: number
}
export const DEFAULT_RETRY_PROMISES_OPTIONS: Required<RetryPromiseOptions> = {
  breakTime: 0,
  maxTryTimes: Infinity
}

/**
 * @see {@link retryPromiseUntil}
 */
export const retryPromiseWhile = async <T = any>(
  predicate: (value: T) => boolean,
  promiseMaker: (time: number, previousResult?: T | FailedPromiseResult) => Promise<T>,
  options: RetryPromiseOptions = DEFAULT_RETRY_PROMISES_OPTIONS
): Promise<T | FailedPromiseResult> => {
  const { breakTime, maxTryTimes } = { ...DEFAULT_RETRY_PROMISES_OPTIONS, ...options }
  if (maxTryTimes < 1) {
    throw new Error('`maxTryTimes` must be greater than 0.')
  }

  let time = 1
  let result = await promiseMaker(time).catch(failedPromiseCatcher)

  while ((isFailedPromiseResult(result) || predicate(result)) && time < maxTryTimes) {
    time = time + 1
    result = await new Promise<T | FailedPromiseResult>((resolve) => {
      setTimeout(() => {
        resolve(promiseMaker(time, result))
      }, breakTime)
    }).catch(failedPromiseCatcher)
  }

  return result
}

/**
 * @see {@link retryPromiseWhile}
 */
export const retryPromiseUntil = async <T = any>(
  predicate: (value: T) => boolean,
  promiseMaker: (time: number, previousResult?: T | FailedPromiseResult) => Promise<T>,
  options: RetryPromiseOptions = DEFAULT_RETRY_PROMISES_OPTIONS
): Promise<T | FailedPromiseResult> => {
  const { breakTime, maxTryTimes } = { ...DEFAULT_RETRY_PROMISES_OPTIONS, ...options }
  if (maxTryTimes < 1) {
    throw new Error('`maxTryTimes` must be greater than 0.')
  }

  let time = 1
  let result = await promiseMaker(time).catch(failedPromiseCatcher)

  while ((isFailedPromiseResult(result) || !predicate(result)) && time < maxTryTimes) {
    time = time + 1
    result = await new Promise<T | FailedPromiseResult>((resolve) => {
      setTimeout(() => {
        resolve(promiseMaker(time, result))
      }, breakTime)
    }).catch(failedPromiseCatcher)
  }

  return result
}

export const intervalPromise = <T = any>(
  interval: number, promiseMaker: (time: number) => Promise<T>
): (() => void) => {
  let time = 1

  const intervalID = setTimeout(() => {
    void promiseMaker(time)
    time = time + 1
  }, interval)

  return () => {
    clearInterval(intervalID)
  }
}

export interface ForeverPromiseOptions {
  breakTime?: number
  onRejected?: (time: number, result: FailedPromiseResult) => void
}
export const DEFAULT_FOREVER_PROMISES_OPTIONS: Required<Omit<ForeverPromiseOptions, 'onRejected'>> = {
  breakTime: 0
}
export const foreverPromise = <T = any>(
  promiseMaker: (time: number, previousResult?: T | FailedPromiseResult) => Promise<T>,
  options: ForeverPromiseOptions = DEFAULT_FOREVER_PROMISES_OPTIONS
): void => {
  const { breakTime, onRejected } = { ...DEFAULT_FOREVER_PROMISES_OPTIONS, ...options }
  let time = 1

  const handlePromise = (result: T | FailedPromiseResult): void => {
    time = time + 1
    setTimeout(() => {
      runPromise(time, result)
    }, breakTime)
  }
  const runPromise = (time: number, previousResult?: T | FailedPromiseResult): void => {
    void promiseMaker(time, previousResult)
      .catch(reason => {
        const failedResult = failedPromiseCatcher(reason)
        if (isFunction(onRejected)) {
          try {
            onRejected(time, failedResult)
          } catch (exception) {
            // omit exceptions from execution of `onRejected`
          }
        }
        return failedResult
      })
      .then(result => handlePromise(result))
  }
  runPromise(time, undefined)
}
