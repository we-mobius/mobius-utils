
/**
 * Strict version of builtin `Extract`, `U` must be subset of `T`.
 */
export type StrictExtract<T, U extends T> = Extract<T, U>
/**
 * Strict version of builtin `Exclude`, `U` must be subset of `T`.
 */
export type StrictExclude<T, U extends T> = Exclude<T, U>

/**
 * SetIntersection (same as Extract)
 * @description Set intersection of given union types `SetA` and `SetB`.
 * @example
 * ```
 *   // Expect: "2" | "3"
 *   SetIntersection<'1' | '2' | '3', '2' | '3' | '4'>;
 *
 *   // Expect: () => void
 *   SetIntersection<string | number | (() => void), Function>;
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type SetIntersection<SetA, SetB> = SetA extends SetB ? SetA : never

/**
 * SetDifference (same as Exclude)
 * @description Set difference of given union types `SetA` and `SetB`.
 * @example
 * ```
 *   // Expect: "1"
 *   SetDifference<'1' | '2' | '3', '2' | '3' | '4'>;
 *
 *   // Expect: string | number
 *   SetDifference<string | number | (() => void), Function>;
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type SetDifference<SetA, SetB> = SetA extends SetB ? never : SetA

/**
 * SetComplement
 * @description Set complement of given union types `SetA` and it's `SubSet`.
 * @example
 * ```
 *   // Expect: "1"
 *   SetComplement<'1' | '2' | '3', '2' | '3'>;
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type SetComplement<Set, SubSet extends Set> = SetDifference<Set, SubSet>

/**
 * SetSymmetricDifference
 * @desc Set difference of union and intersection of given union types `SetA` and `SetB`.
 * @example
 * ```
 *   // Expect: "1" | "4"
 *   SymmetricDifference<'1' | '2' | '3', '2' | '3' | '4'>;
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type SetSymmetricDifference<SetA, SetB> = SetDifference<SetA | SetB, SetA & SetB>

/**
 * UnionToIntersection
 * @desc Get intersection type given union type `Target`.
 * Credit: jcalz
 * @see https://stackoverflow.com/a/50375286/7381355
 * @example
 * ```
 *   // Expect: { name: string } & { age: number } & { visible: boolean }
 *   UnionToIntersection<{ name: string } | { age: number } | { visible: boolean }>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type UnionToIntersection<Target> = (
  Target extends any ? (_: Target) => void : never
) extends (_: infer Result) => void ? Result : never

export type UnionHas<T, U> = [U] extends [T] ? true : false
