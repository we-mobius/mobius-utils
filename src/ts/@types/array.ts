
/**
 * Get an array type which at least has one element.
 * @see example - For usecases, see {@link https://github.com/ts-essentials/ts-essentials#nonemptyarray}
 */
export type NonEmptyArray<T> = [T, ...T[]]
