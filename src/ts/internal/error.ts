import { isUndefined, isFunction } from './base'

export function tryCatch <Target extends any = any> (tryFn: () => Target, catchFn: ((exception: unknown) => Target)): Target
export function tryCatch <Target extends any = any> (tryFn: () => Target, catchFn: Target): Target
export function tryCatch <Target extends any = any> (tryFn: () => Target): Target | undefined
export function tryCatch (tryFn: () => void): void
export function tryCatch <Target extends any = any> (
  tryFn: () => Target, catchFn?: Target | ((exception: unknown) => Target)
): Target | undefined {
  try {
    return tryFn()
  } catch (exception) {
    if (!isUndefined(catchFn) && isFunction(catchFn)) {
      return catchFn(exception)
    } else if (isUndefined(catchFn)) {
      return (() => undefined)()
    } else {
      return catchFn
    }
  }
}
