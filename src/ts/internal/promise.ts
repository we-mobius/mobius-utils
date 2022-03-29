
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
  promises: Array<Promise<T>>, options: QueuePromiseOptions = DEFAULT_QUEUE_PROMISES_OPTIONS
): Promise<T[]> => {
  if (promises.length === 0) { return [] }

  const { breakTime } = { ...DEFAULT_QUEUE_PROMISES_OPTIONS, ...options }

  const results: T[] = []
  const lastPromise = promises.slice(1).reduce(async (accumulatedPromise, currentPromise) => {
    return await accumulatedPromise.then(async (result) => {
      results.push(result)
      return await new Promise((resolve) => {
        setTimeout(() => { resolve(currentPromise) }, breakTime)
      })
    })
  }, promises[0])

  return await lastPromise.then(result => {
    results.push(result)
    return results
  })
}
