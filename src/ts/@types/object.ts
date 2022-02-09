import type {
  IsUndefinedable, IsNullable, IsNilable,
  Undefinedable, Nullable, Nilable,
  NonUndefinedable, NonNullable, NonNilable
} from './base'

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
