import { isArray } from '../../internal/base'

import type { AtomLike } from '../atoms'

/**
 * Recursively pipe atoms.
 */
export const pipeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  _atoms.reverse().forEach((atom, index, all) => {
    if (index >= 1) {
      atom.beObservedBy(all[index - 1])
    }
  })

  return _atoms as T
}

/**
 * Recursively compose atoms.
 */
export const composeAtom = <T extends AtomLike[]>(...args: T | [T]): T => {
  let _atoms: AtomLike[]
  if (args.length === 1 && isArray<AtomLike>(args[0])) {
    _atoms = args[0]
  } else {
    _atoms = args as AtomLike[]
  }

  _atoms.forEach((atom, index, all) => {
    if (index >= 1) {
      atom.beObservedBy(all[index - 1])
    }
  })
  return _atoms as T
}
