import { isUndefined, isFunction } from './base'

export function tryCatch <Target extends any = any> (tryer: () => Target, catcher: ((exception: unknown) => Target)): Target
export function tryCatch <Target extends any = any> (tryer: () => Target, catcher: Target): Target
export function tryCatch <Target extends any = any> (tryer: () => Target): Target | undefined
export function tryCatch (tryer: () => void): void
export function tryCatch <Target extends any = any> (
  tryer: () => Target, catcher?: Target | ((exception: unknown) => Target)
): Target | undefined {
  try {
    return tryer()
  } catch (exception) {
    if (!isUndefined(catcher) && isFunction(catcher)) {
      return catcher(exception)
    } else if (isUndefined(catcher)) {
      return (() => undefined)()
    } else {
      return catcher
    }
  }
}
