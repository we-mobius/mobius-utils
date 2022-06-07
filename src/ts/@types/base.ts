/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/ban-types */

/**
 * @see https://devblogs.microsoft.com/typescript/announcing-typescript-2-9-2/#support-for-symbols-and-numeric-literals-in-keyof-and-mapped-object-types
 */
export type KeyofBase = keyof any
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types}
 */
export type Primative = string | number | boolean | bigint | symbol | null | undefined
/**
  * @see {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#object-type}
  */
export type NonPrimative = object
export interface EmptyInterface {}

export type Cast<T, SafeT> = T extends SafeT ? T : SafeT
export type Try<T, SafeT, Catch = never> = T extends SafeT ? T : Catch

/**
 * Predicate whether the target is `undefined`.
 */
export type IsUndefined<T> = Exclude<T, undefined> extends never ? true : false
export type IfUndefined<T, TRUE = true, FALSE = never> = IsUndefined<T> extends true ? TRUE : FALSE
export type CastUndefined<T> = T extends undefined ? T : undefined
/**
 * Predicate whether the target is `null`.
 */
export type IsNull<T> = Exclude<T, null> extends never ? true : false
export type IfNull<T, TRUE = true, FALSE = never> = IsNull<T> extends true ? TRUE : FALSE
export type CastNull<T> = T extends null ? T : null
/**
 * Predicate whether the target is `null | undefined`.
 */
export type IsNil<T> = Exclude<T, undefined | null> extends never ? true : false
export type IfNil<T, TRUE = true, FALSE = never> = IsNil<T> extends true ? TRUE : FALSE
export type CastNil<T> = T extends undefined | null ? T : undefined | null

export type IsUndefinedable<T> = T extends Exclude<T, undefined> ? false : true
export type IsNullable<T> = T extends Exclude<T, null> ? false : true
export type IsNilable<T> = T extends Exclude<T, null | undefined> ? false : true

export type IfUndefinedable<T, TRUE = true, FALSE = never> = IsUndefinedable<T> extends true ? TRUE : FALSE
export type IfNullable<T, TRUE = true, FALSE = never> = IsNullable<T> extends true ? TRUE : FALSE
export type IfNilable<T, TRUE = true, FALSE = never> = IsNilable<T> extends true ? TRUE : FALSE

export type Undefinedable<T> = T | undefined
export type Nullable<T> = T | null
export type Nilable<T> = T | null | undefined

export type NonUndefinedable<T> = Exclude<T, undefined>
export type NonNullable<T> = Exclude<T, null>
export type NonNilable<T> = Exclude<T, null | undefined>

/**
 * Predicate whether the target is `never`.
 */
export type IsNever<T> = [T] extends [never] ? true : false
export type IfNever<T, TRUE = true, FALSE = never> = IsNever<T> extends true ? TRUE : FALSE
export type CastNever<T> = T extends never ? T : never

/**
 * Predicate whether the target is `any`.
 * @see Copyright - The idea is get from {@link https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360}
 */
export type IsAny<T> = 0 extends (1 & T) ? true : false
export type IfAny<T, TRUE = true, FALSE = never> = 0 extends (1 & T) ? TRUE : FALSE
export type CastAny<T> = T extends any ? T : any

/**
 * @see {@link https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability}
 */
export type IsUnknown<T> = IsNever<T> extends true
  ? false
  : (
      T extends unknown
        ? (
            unknown extends T
              ? (IsAny<T> extends true ? false : true)
              : false
          )
        : false
    )
export type IfUnknown<T, TRUE = true, FALSE = never> = IsUnknown<T> extends true ? TRUE : FALSE
export type CastUnknown<T> = T extends unknown ? T : unknown

/**
 * Predicate whether the target is `boolean`.
 */
export type IsBoolean<T> = T extends boolean ? true : false
export type IfBoolean<T, TRUE = true, FALSE = never> = IsBoolean<T> extends true ? TRUE : FALSE
export type CastBoolean<T> = T extends boolean ? T : boolean
// FIXME: there is a bug
export type IsBooleanLiteral<T> = T extends boolean ? (boolean extends T ? false : true) : false

/**
 * Predicate whether the target is `string`.
 */
export type IsString<T> = T extends string ? true : false
export type IfString<T, TRUE = true, FALSE = never> = IsString<T> extends true ? TRUE : FALSE
export type CastString<T> = T extends string ? T : string
export type IsStringLiteral<T> = T extends string ? (string extends T ? false : true) : false

/**
 * Predicate whether the target is `number`.
 */
export type IsNumber<T> = T extends number ? true : false
export type IfNumber<T, TRUE = true, FALSE = never> = IsNumber<T> extends true ? TRUE : FALSE
export type CastNumber<T> = T extends number ? T : number
export type IsNumberLiteral<T> = T extends number ? (number extends T ? false : true) : false

/**
 * Predicate whether the target is `symbol`.
 */
export type IsSymbol<T> = T extends symbol ? true : false
export type IfSymbol<T, TRUE = true, FALSE = never> = IsSymbol<T> extends true ? TRUE : FALSE
export type CastSymbol<T> = T extends symbol ? T : symbol

/**
 * Predicate whether the target is of type function.
 */
export type IsFunction<T> = T extends AnyFunction ? true : false
export type IfFunction<T, TRUE = true, FALSE = never> = IsFunction<T> extends true ? TRUE : FALSE
export type CastFunction<T> = T extends AnyFunction ? T : AnyFunction

type ExpandedDistribution<T> = T extends any ? T[] : never
type ClosedDistribution<T> = [T] extends [any] ? T[] : never
/**
 * Predicate whether the target is `Union` type.
 *
 * @see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 */
export type IsUnion<T> = ClosedDistribution<T> extends ExpandedDistribution<T> ? false : true
export type IfUnion<T, TRUE = true, FALSE = never> = IsUnion<T> extends true ? TRUE : FALSE

/**
 * Predicate whether the target is `tuple`.
 *
 * @see https://github.com/type-challenges/type-challenges/issues/4491#issuecomment-975808109
 */
export type IsTuple<T> = T extends readonly any[] ? (number extends T['length'] ? false : true) : false
export type IfTuple<T, TRUE = true, FALSE = never> = IsTuple<T> extends true ? TRUE : FALSE

export type IsPrimative<T> =
  T extends string ? true : T extends number ? true : T extends boolean ? true : T extends symbol ? true
    : T extends bigint ? true : T extends undefined ? true : T extends null ? true :false
export type IfPrimative<T, TRUE = true, FALSE = never> = IsPrimative<T> extends true ? TRUE : FALSE

export type IsPrimativeUnion<T> = T extends Primative ? true : false
export type IfPrimativeUnion<T, TRUE = true, FALSE = never> = IsPrimativeUnion<T> extends true ? TRUE : FALSE

/**
 * @see Copyright - The code is copy from {@Link https://github.com/millsp/ts-toolbelt/blob/319e55123b9571d49f34eca3e5926e41ca73e0f3/sources/Any/Keys.ts#L11}
 */
export type Keys<A extends any> = A extends readonly any[]
  ? Exclude<keyof A, keyof any[]> | number
  : keyof A
