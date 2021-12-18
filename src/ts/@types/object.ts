
export type UndefinedableByKeys<Target, Keys> = {
  [K in keyof Target]: K extends Keys ? Target[K] | undefined : Target[K]
}
