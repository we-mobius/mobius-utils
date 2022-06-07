import type { IsAny } from './base'

/**
 * Checks if type `T` has the specified type `U`.
 * @see Copyright - The code is copy from {@link https://github.com/dsherret/conditional-type-checks/blob/fc9ed57bc0b5a65bc1e3bfcbc5299a7c157b2e2e/mod.ts#L26}
 */
export type Has<T, U> = IsAny<T> extends true ? true
  : IsAny<U> extends true ? false
    : Extract<T, U> extends never ? false
      : true

/**
* Checks if type `T` does not have the specified type `U`.
* @see Copyright - The code is copy from {@link https://github.com/dsherret/conditional-type-checks/blob/fc9ed57bc0b5a65bc1e3bfcbc5299a7c157b2e2e/mod.ts#L34}
*/
export type NotHas<T, U> = Has<T, U> extends false ? true : false
