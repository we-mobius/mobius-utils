
export type Cast<T, SafeT> = T extends SafeT ? T : SafeT

/**
 * Predicate whether the target is `undefined`.
 */
export type IsUndefined<T> = Exclude<T, undefined> extends never ? true : false
export type CastUndefined<T> = T extends undefined ? T : undefined
/**
 * Predicate whether the target is `null`.
 */
export type IsNull<T> = Exclude<T, null> extends never ? true : false
export type CastNull<T> = T extends null ? T : null
/**
 * Predicate whether the target is `null | undefined`.
 */
export type IsNil<T> = Exclude<T, undefined | null> extends never ? true : false
export type CastNil<T> = T extends undefined | null ? T : undefined | null

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
 * Predicate whether the target is `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false
export type CastNever<T> = T extends never ? T : never

/**
 * Predicate whether the target is `any`.
 */
export type IsAny<T> = 0 extends (1 & T) ? true : false
export type IfAny<T, TRUE = true, FALSE = false> = 0 extends (1 & T) ? TRUE : FALSE
export type CastAny<T> = T extends any ? T : any

/**
 * Predicate whether the target is `boolean`.
 */
export type IsBoolean<T> = T extends boolean ? true : false
export type CastBoolean<T> = T extends boolean ? T : boolean
export type IsBooleanLiteral<T> = T extends boolean ? (boolean extends T ? false : true) : false

/**
 * Predicate whether the target is `string`.
 */
export type IsString<T> = T extends string ? true : false
export type CastString<T> = T extends string ? T : string
export type IsStringLiteral<T> = T extends string ? (string extends T ? false : true) : false

/**
 * Predicate whether the target is `number`.
 */
export type IsNumber<T> = T extends number ? true : false
export type CastNumber<T> = T extends number ? T : number
export type IsNumberLiteral<T> = T extends number ? (number extends T ? false : true) : false

/**
 * Predicate whether the target is `symbol`.
 */
export type IsSymbol<T> = T extends symbol ? true : false
export type CastSymbol<T> = T extends symbol ? T : symbol

/**
 * Predicate whether the target is of type function.
 */
export type IsFunction<T> = T extends AnyFunction ? true : false
export type CastFunction<T> = T extends AnyFunction ? T : AnyFunction

type ExpandedDistribution<T> = T extends any ? T[] : never
type ClosedDistribution<T> = [T] extends [any] ? T[] : never
/**
 * Predicate whether the target is `Union` type.
 *
 * @refer https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 */
export type IsUnion<T> = ClosedDistribution<T> extends ExpandedDistribution<T> ? false : true

/**
 * Predicate whether the target is `tuple`.
 *
 * @refer https://github.com/type-challenges/type-challenges/issues/4491#issuecomment-975808109
 */
export type IsTuple<T> = T extends readonly any[] ? (number extends T['length'] ? false : true) : false
