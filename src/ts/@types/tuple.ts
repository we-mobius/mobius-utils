/**
 * Tuple Utils Types are strongly reference to [typescript-tuple](https://github.com/ksxnodemodules/typescript-tuple).
 *
 * @see: https://github.com/ksxnodemodules/typescript-tuple/blob/master/lib/utils.ts
 */

/**
 * @example
 * ```typescript
 * type Foo = First<['a', 'b', 'c']> // Expect: 'a'
 * ```
 */
export type First<Tuple extends any[], Default = never> =
  Tuple extends [any, ...any[]] ? Tuple[0] : Default

/**
 * @example
 * ```typescript
 * type Foo = Last<['a', 'b', 'c']> // Expect: 'c'
 * ```
 */
export type Last<Tuple extends any[], Default = never> =
  Tuple extends [] ? Default :
    Tuple extends [infer SoleElement] ? SoleElement :
      Tuple extends Array<infer Element> ?
        Element[] extends Tuple ? Element :
          Tuple extends [any, ...infer Next] ? Last<Next> : Default
        : never
