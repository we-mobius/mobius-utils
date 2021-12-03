
/**
 * Invoke target function immediately.
 */
export const syncScheduler = (target: () => void): void => {
  target()
}

/**
 * Invoke target function in setTimeout.
 */
export const asyncScheduler = (target: () => void): void => {
  setTimeout(target, 0)
}
