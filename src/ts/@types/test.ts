
export type Assert<Target extends true | false, Expected extends Target> = never
export type AssertTrue<Target extends true> = never
export type AssertFalse<Target extends false> = never

/**
 * @example
 * ```
 *   // Expected: Argument of type 'true' is not assignable to parameter of type 'false'.ts(2345)
 *   typeAssert<Has<string, ''>>(true)
 * ```
 * @see Copyright - The idea is get from {@link https://github.com/dsherret/conditional-type-checks/blob/fc9ed57bc0b5a65bc1e3bfcbc5299a7c157b2e2e/mod.ts#L5}
 */
export const typeAssert = <T extends true | false>(expectTrue: T): void => { /* do nothing */ }
