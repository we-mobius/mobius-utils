
export type AnyFunction = (...args: any[]) => any

/**
 * Predicate whether the target is of type function.
 */
export type IsFunction<T> = T extends AnyFunction ? true : false

export type CastFunction<T> = T extends AnyFunction ? T : AnyFunction
