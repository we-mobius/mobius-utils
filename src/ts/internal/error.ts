
export const tryCatch = <Target extends any>(tryFn: () => Target, catchFn: (exception: unknown) => Target): Target => {
  try {
    return tryFn()
  } catch (exception) {
    return catchFn(exception)
  }
}
