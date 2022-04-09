import { isUndefined, isFunction } from './base'

export function tryCatch <Target = any> (tryer: () => Target, catcher: ((exception: unknown) => Target)): Target
export function tryCatch <Target = any> (tryer: () => Target, catchallValue: Target): Target
/**
 * 未提供 `catcher` 或 `catchallValue` 的情况下，若 `tryer` 抛出异常，则返回 `undefined`
 */
export function tryCatch <Target = any> (tryer: () => Target): Target | undefined
export function tryCatch (tryer: () => void): void
export function tryCatch <Target = any> (
  tryer: () => Target, catcherOrCatchallValue?: Target | ((exception: unknown) => Target)
): Target | undefined {
  try {
    return tryer()
  } catch (exception) {
    // NOTE: intended redundant type guard
    if (!isUndefined(catcherOrCatchallValue)) {
      if (isFunction(catcherOrCatchallValue)) {
        return catcherOrCatchallValue(exception)
      } else {
        return catcherOrCatchallValue
      }
    } else {
      return (() => undefined)()
    }
  }
}
