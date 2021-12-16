
export type OptionalByKey<Target, Keys> = {
  [K in keyof Target]: K extends Keys ? Target[K] | undefined : Target[K]
}
