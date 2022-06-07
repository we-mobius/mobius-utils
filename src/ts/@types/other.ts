import type { StringLiteral } from './string'

/**
 * Brand
 * @desc Define nominal type of U based on type of T. Similar to Opaque types in Flow.
 * @example
 *   type USD = Brand<number, "USD">
 *   type EUR = Brand<number, "EUR">
 *
 *   const tax = 5 as USD;
 *   const usd = 10 as USD;
 *   const eur = 10 as EUR;
 *
 *   function gross(net: USD): USD {
 *     return (net + tax) as USD;
 *   }
 *
 *   // Expect: No compile error
 *   gross(usd);
 *   // Expect: Compile error (Type '"EUR"' is not assignable to type '"USD"'.)
 *   gross(eur);
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 *                , mixed with {@link https://github.com/ts-essentials/ts-essentials/blob/5aa1f264e77fb36bb3f673c49f00927c7c181a7f/lib/types.ts#L416}
 * @see Alternative - Name it as `Type` or `Opaque`, {@link https://millsp.github.io/ts-toolbelt/modules/any_type.html}
 */
export type Brand<Target, Token extends string> = Token extends StringLiteral<Token> ? Target & { __brand__: Token }: never

/**
 * @see Usecase - https://github.com/ts-essentials/ts-essentials#exact
 * @see Copyright - The code is copy from {@link https://github.com/ts-essentials/ts-essentials/blob/5aa1f264e77fb36bb3f673c49f00927c7c181a7f/lib/types.ts#L479}
 * @see Reference - There is an other version of `Exact` {@link https://github.com/dsherret/conditional-type-checks/blob/fc9ed57bc0b5a65bc1e3bfcbc5299a7c157b2e2e/mod.ts#L44}
 */
export type Exact<Target, Shape> = Target extends Shape ? (Exclude<keyof Target, keyof Shape> extends never ? Target : never) : never

/**
 * @see Usecase - https://github.com/ts-essentials/ts-essentials#isexact
 * @see Copyright - The code is copy from {@link https://github.com/ts-essentials/ts-essentials/blob/5aa1f264e77fb36bb3f673c49f00927c7c181a7f/lib/functions.ts#L17}
 */
export const isExactType = <ExpectedShape>() => <ActualShape>(x: Exact<ActualShape, ExpectedShape>): ExpectedShape => x
