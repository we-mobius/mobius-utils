import { isArray } from '../../internal/base'

import type { AtomLike } from '../atoms'

/**
 * Recursively pipe atoms.
 *
 * @see {@link composeAtom}
 */
export function pipeAtom <T extends AtomLike[]> (atoms: [...T]): T
export function pipeAtom <T extends AtomLike[]> (...atoms: [...T]): T
export function pipeAtom <T extends AtomLike[]> (...atoms: [[...T]] | [...T]): T {
  let _atoms: AtomLike[]
  if (atoms.length === 1 && isArray<AtomLike>(atoms[0])) {
    _atoms = atoms[0]
  } else {
    _atoms = atoms as AtomLike[]
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
 *
 * @see {@link pipeAtom}
 */
export function composeAtom <T extends AtomLike[]> (atoms: [...T]): T
export function composeAtom <T extends AtomLike[]> (...atoms: [...T]): T
export function composeAtom <T extends AtomLike[]> (...atoms: [[...T]] | [...T]): T {
  let _atoms: AtomLike[]
  if (atoms.length === 1 && isArray<AtomLike>(atoms[0])) {
    _atoms = atoms[0]
  } else {
    _atoms = atoms as AtomLike[]
  }

  _atoms.forEach((atom, index, all) => {
    if (index >= 1) {
      atom.beObservedBy(all[index - 1])
    }
  })

  return _atoms as T
}
