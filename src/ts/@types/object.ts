import type {
  IsUndefinedable, IsNullable, IsNilable,
  Undefinedable, Nullable, Nilable,
  NonUndefinedable, NonNullable, NonNilable
} from './base'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyInterface {}
export type AnyStringRecord = Record<string, any>

export type UndefinedableByKeys<Target, Keys> = {
  [K in keyof Target]: K extends Keys ? Undefinedable<Target[K]> : Target[K]
}
export type NullableByKeys<Target, Keys> ={
  [K in keyof Target]: K extends Keys ? Nullable<Target[K]> : Target[K]
}
export type NilableByKeys<Target, Keys> = {
  [K in keyof Target]: K extends Keys ? Nilable<Target[K]> : Target[K]
}

// TODO:
// export type NonUndefinedableByKeys<Target, Keys> = {
//   [K in keyof Target]-?: K extends Keys ? NonUndefinedable<Target[K]> : Target[K]
// }
// export type NonNullableByKeys<Target, Keys> = {
//   [K in keyof Target]: K extends Keys ? NonNullable<Target[K]> : Target[K]
// }
// export type NonNilableByKeys<Target, Keys> = {
//   [K in keyof Target]: K extends Keys ? NonNilable<Target[K]> : Target[K]
// }

export type RecursiveRequiredRecord<T> = {
  [P in keyof T]-?: T[P] extends (Record<string, any> | undefined) ? RecursiveRequiredRecord<T[P]> :
    T[P];
}

/**
 * Same as `Partial`.
 *
 * @see {@link Partial}
 */
export type Optional<Target> = Partial<Target>

/**
 * Given a type `{ a?: string, b: number }`, return `'a'`.
 *
 * @see {@link RequiredPropertiesOf}, {@link FlipOptional}
 */
export type OptionalPropertiesOf<Target extends EmptyInterface> = Exclude<{
  [K in keyof Target]: Target extends Record<K, Target[K]> ? never : K
}[keyof Target], undefined>

/**
 * Given a type `{ a?: string, b: number }`, return `'b'`.
 *
 * @see {@link OptionalPropertiesOf}, {@link FlipOptional}
 */
export type RequiredPropertiesOf<Target extends EmptyInterface> = Exclude<{
  [K in keyof Target]: Target extends Record<K, Target[K]> ? K : never
}[keyof Target], undefined>

/**
 * Given a type `{ a?: string, b: number }`, return `{ a: string, b?: number }`.
 *
 * @see {@link FilpRequired}
 * @refer Solution is refer to https://stackoverflow.com/questions/57593022/reverse-required-and-optional-properties
 */
export type FlipOptional<Target> = (
  Required<Pick<Target, OptionalPropertiesOf<Target>>> & Optional<Omit<Target, OptionalPropertiesOf<Target>>>
) extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * Same as `FilpOptional`.
 *
 * @see {@link FlipOptional}
 */
export type FilpRequired<Target> = FlipOptional<Target>
