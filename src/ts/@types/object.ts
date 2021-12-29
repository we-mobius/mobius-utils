
export type AnyStringRecord = Record<string, any>

export type UndefinedableByKeys<Target, Keys> = {
  [K in keyof Target]: K extends Keys ? Target[K] | undefined : Target[K]
}

export type RecursiveRequiredRecord<T> = {
  [P in keyof T]-?: T[P] extends (Record<string, any> | undefined) ? RecursiveRequiredRecord<T[P]> :
    T[P];
}
