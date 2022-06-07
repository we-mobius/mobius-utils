
export type If<T extends boolean, TRUE, FALSE = never> = T extends true ? TRUE : FALSE

/**
 * WARNING: https://github.com/ts-essentials/ts-essentials/blob/5aa1f264e77fb36bb3f673c49f00927c7c181a7f/lib/types.ts#L440
 * @see https://stackoverflow.com/a/52473108/1815209 with comments
 * @see https://github.com/millsp/ts-toolbelt/blob/319e551/sources/Any/Equals.ts#L15
 */
export type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false
export type IfEqual<X, Y, TRUE = true, FALSE = false> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? TRUE : FALSE

/**
 * @example
 * ```
 *   // Expect: true
 *   type test1 = BooleanNot<false>
 *   // Expect: false
 *   type test2 = BooleanNot<true>
 * ```
 */
export type BooleanNot<T extends boolean> = T extends true ? false : true

/**
 * @example
 * ```
 *   // Expect: true
 *   type test1 = BooleanAnd<true, true>
 *   // Expect: false
 *   type test2 = BooleanAnd<true, false>
 *   // Expect: false
 *   type test3 = BooleanAnd<false, true>
 *   // Expect: false
 *   type test4 = BooleanAnd<false, false>
 * ```
 */
export type BooleanAnd<T extends boolean, U extends boolean> = T extends true ? (U extends true ? true : false) : false

/**
 * @example
 * ```
 *   // Expect: false
 *   type test1 = BooleanNand<true, true>
 *   // Expect: true
 *   type test2 = BooleanNand<true, false>
 *   // Expect: true
 *   type test3 = BooleanNand<false, true>
 *   // Expect: true
 *   type test4 = BooleanNand<false, false>
 * ```
 */
export type BooleanNand<T extends boolean, U extends boolean> = T extends true ? (U extends true ? false : true) : true

/**
 * @example
 * ```
 *   // Expect: true
 *   type test1 = BooleanOr<true, false>
 *   // Expect: false
 *   type test2 = BooleanOr<false, false>
 *   // Expect: true
 *   type test3 = BooleanOr<false, true>
 *   // Expect: true
 *   type test4 = BooleanOr<true, true>
 * ```
 */
export type BooleanOr<T extends boolean, U extends boolean> = T extends true ? true : (U extends true ? true : false)

/**
 * @example
 * ```
 *   // Expect: false
 *   type test1 = BooleanNor<true, false>
 *   // Expect: true
 *   type test2 = BooleanNor<false, false>
 *   // Expect: false
 *   type test3 = BooleanNor<false, true>
 *   // Expect: false
 *   type test4 = BooleanNor<true, true>
 * ```
 */
export type BooleanNor<T extends boolean, U extends boolean> = T extends true ? false : (U extends true ? false : true)

/**
 * @example
 * ```
 *   // Expect: true
 *   type test1 = BooleanXor<true, false>
 *   // Expect: false
 *   type test2 = BooleanXor<false, false>
 *   // Expect: true
 *   type test3 = BooleanXor<false, true>
 *   // Expect: false
 *   type test4 = BooleanXor<true, true>
 * ```
 */
export type BooleanXor<T extends boolean, U extends boolean> =
  T extends true ? (U extends true ? false : true) : (U extends true ? true : false)

/**
 * @example
 * ```
 *   // Expect: false
 *   type test1 = BooleanXnor<true, false>
 *   // Expect: true
 *   type test2 = BooleanXnor<false, false>
 *   // Expect: false
 *   type test3 = BooleanXnor<false, true>
 *   // Expect: true
 *   type test4 = BooleanXnor<true, true>
 * ```
 */
export type BooleanXnor<T extends boolean, U extends boolean> =
  T extends true ? (U extends true ? true : false) : (U extends true ? false : true)
