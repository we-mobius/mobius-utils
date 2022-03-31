
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

export interface QueuePromiseOptions {
  breakTime?: number
}
export const DEFAULT_QUEUE_PROMISES_OPTIONS: Required<QueuePromiseOptions> = {
  breakTime: 0
}
export const queuePromises = async <T = any>(
  promiseMakers: Array<() => Promise<T>>, options: QueuePromiseOptions = DEFAULT_QUEUE_PROMISES_OPTIONS
): Promise<T[]> => {
  if (promiseMakers.length === 0) { return [] }

  const { breakTime } = { ...DEFAULT_QUEUE_PROMISES_OPTIONS, ...options }

  const results: T[] = []
  const lastPromise = promiseMakers.slice(1).reduce(async (accumulatedPromise, currentPromise) => {
    return await accumulatedPromise.then(async (result) => {
      results.push(result)
      return await new Promise((resolve) => {
        setTimeout(() => { resolve(currentPromise()) }, breakTime)
      })
    })
  }, promiseMakers[0]())

  return await lastPromise.then(result => {
    results.push(result)
    return results
  })
}

export interface RetryPromiseOptions {
  breakTime?: number
}
export const DEFAULT_RETRY_PROMISES_OPTIONS: Required<RetryPromiseOptions> = {
  breakTime: 0
}

/**
 * @see {@link retryPromiseUntil}
 */
export const retryPromiseWhile = async <T = any>(
  predicate: (value: T) => boolean, promiseMaker: (time: number, previousResult?: any) => Promise<T>,
  options: RetryPromiseOptions = DEFAULT_RETRY_PROMISES_OPTIONS
): Promise<T> => {
  const { breakTime } = { ...DEFAULT_RETRY_PROMISES_OPTIONS, ...options }
  let time = 1
  let result = await promiseMaker(time)
  while (predicate(result)) {
    time = time + 1
    result = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(promiseMaker(time, result))
      }, breakTime)
    })
  }
  return result
}

/**
 * @see {@link retryPromiseWhile}
 */
export const retryPromiseUntil = async <T = any>(
  predicate: (value: T) => boolean, promiseMaker: (time: number, previousResult?: any) => Promise<T>,
  options: RetryPromiseOptions = DEFAULT_RETRY_PROMISES_OPTIONS
): Promise<T> => {
  const { breakTime } = { ...DEFAULT_RETRY_PROMISES_OPTIONS, ...options }
  let time = 1
  let result = await promiseMaker(time)
  while (!predicate(result)) {
    time = time + 1
    result = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(promiseMaker(time, result))
      }, breakTime)
    })
  }
  return result
}
