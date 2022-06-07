/**
 * @example
 * ```
 *   type Temp = 'mobius'
 *   // Expect: 'mobius'
 *   type test1 = StringLiteral<Temp>
 * ```
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never
