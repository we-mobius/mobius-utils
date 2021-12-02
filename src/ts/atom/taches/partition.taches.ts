import { Data } from '../atoms'

import type { AtomLikeOfOutput } from '../atoms'

/**
 * @todo TODO: partitionT
 */
export const partitionT = <V>(
  target: AtomLikeOfOutput<V>
): Data<V> => {
  console.error('TODO: partitionT.')

  const outputD = Data.empty<V>()

  return outputD
}
