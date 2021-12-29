
/**
 * Predicate whether the target is `undefined`.
 */
export type IsUndefined<T> = Exclude<T, undefined> extends never ? true : false
/**
 * Predicate whether the target is `null`.
 */
export type IsNull<T> = Exclude<T, null> extends never ? true : false
/**
 * Predicate whether the target is `null | undefined`.
 */
export type IsNil<T> = Exclude<T, undefined | null> extends never ? true : false

export type IsUndefinedable<T> = T extends Exclude<T, undefined> ? false : true
export type IsNullable<T> = T extends Exclude<T, null> ? false : true
export type IsNilable<T> = T extends Exclude<T, null | undefined> ? false : true

export type Undefinedable<T> = T | undefined
export type Nullable<T> = T | null
export type Nilable<T> = T | null | undefined

export type NonUndefinedable<T> = Exclude<T, undefined>
export type NonNullable<T> = Exclude<T, null>
export type NonNilable<T> = NonNullable<T>

/**
 * Predicate whether the target is `any`.
 */
export type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N
export type IsAny<T> = IfAny<T, true, false>

export type CastAny<T> = T extends any ? T : any

type ExpandedDistribution<T> = T extends any ? T[] : never
type ClosedDistribution<T> = [T] extends [any] ? T[] : never
/**
 * Predicate whether the target is `Union` type.
 */
export type IsUnion<T> = ClosedDistribution<T> extends ExpandedDistribution<T> ? false : true

/**
 * Predicate whether the target is `boolean`.
 */
export type IsBoolean<T> = T extends boolean ? true : false
export type CastBoolean<T> = T extends boolean ? T : boolean

/**
 * Predicate whether the target is `number`.
 */
export type IsNumber<T> = T extends number ? true : false
export type CastNumber<T> = T extends number ? T : number
