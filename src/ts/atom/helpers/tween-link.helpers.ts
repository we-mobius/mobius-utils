import { isArray } from '../../internal'
import { isAtomLike, isData, isMutation, Mutation, Data } from '../atoms'
import { isSameTypeOfAtom } from './base.helpers'
import { pipeAtom, composeAtom } from './normal-link.helpers'

import type { AtomLike } from '../atoms'

export const tweenAtom = (upstreamAtom: AtomLike, downstreamAtom: AtomLike): AtomLike[] => {
  if (!isAtomLike(upstreamAtom)) {
    throw (new TypeError('"upstreamAtom" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(downstreamAtom)) {
    throw (new TypeError('"downstreamAtom" is expected to be type of "AtomLike".'))
  }

  if (!isSameTypeOfAtom(upstreamAtom, downstreamAtom)) {
    // data, mutation
    // mutation, data
    return [upstreamAtom, downstreamAtom]
  } else {
    // data, data
    // mutation, mutation
    let tweenAtom
    if (isData(upstreamAtom)) {
      tweenAtom = Mutation.ofLiftLeft(v => v)
    } else if (isMutation(upstreamAtom)) {
      tweenAtom = Data.empty()
    } else {
      throw (new TypeError('Unexpected type of Atom detected!'))
    }

    return [upstreamAtom, tweenAtom, downstreamAtom]
  }
}

export function tweenAtoms <T extends AtomLike[]> (atoms: [...T]): AtomLike[]
export function tweenAtoms <T extends AtomLike[]> (...atoms: [...T]): AtomLike[]
export function tweenAtoms <T extends AtomLike[]> (...atoms: [[...T]] | [...T]): AtomLike[] {
  let _atoms: AtomLike[]
  if (atoms.length === 1 && isArray<AtomLike>(atoms[0])) {
    _atoms = atoms[0]
  } else {
    _atoms = atoms as AtomLike[]
  }

  const tweenedAtoms = _atoms.reduce((acc, cur, idx, arr) => {
    const hasNext = arr[idx + 1]
    if (hasNext !== undefined) {
      acc.push(...tweenAtom(cur, hasNext).slice(1))
    }
    return acc
  }, [_atoms[0]])

  return tweenedAtoms
}

/**
 * Automatically pipe two atom
 *
 * - if they are in different type, use normal pipe logic
 * - if they are in same type, create a tween atom between them,
 *   then use normal pipe logic to three atom
 *   - for Data atom, tween atom is the type of Mutation (asIs Mutation)
 *   - for Mutation atom, tween atom is the type of Data
 *
 * @param upstreamAtom Atom, i.e. Data | Mutation
 * @param downstreamAtom Atom, i.e. Data | Mutation
 * @return downstreamAtom
 */
export function binaryTweenPipeAtom <T extends AtomLike[]> (atoms: [...T]): AtomLike[]
export function binaryTweenPipeAtom <T extends AtomLike[]> (...atoms: [...T]): AtomLike[]
export function binaryTweenPipeAtom <T extends AtomLike[]> (...atoms: [[...T]] | [...T]): AtomLike[] {
  let _atoms: AtomLike[]
  if (atoms.length === 1 && isArray<AtomLike>(atoms[0])) {
    _atoms = atoms[0]
  } else {
    _atoms = atoms as AtomLike[]
  }

  // 只取前两项
  const [upstreamAtom, downstreamAtom] = _atoms.slice(0, 2)
  const tweenedAtoms = tweenAtom(upstreamAtom, downstreamAtom)
  pipeAtom(...tweenedAtoms)

  return tweenedAtoms
}

/**
 * Automatically compose two atom
 *
 * - if they are in different type, use normal compose logic
 * - if they are in same type, create a tween atom between them,
 *   then use normal compose logic to three atom
 *   - for Data atom, tween atom is the type of Mutation (asIs Mutation)
 *   - for Mutation atom, tween atom is the type of Data
 *
 * @param downstreamAtom Atom, i.e. Data | Mutation
 * @param upstreamAtom Atom, i.e. Data | Mutation
 * @return downstreamAtom
 */
export function binaryTweenComposeAtom <T extends AtomLike[]> (atoms: [...T]): AtomLike[]
export function binaryTweenComposeAtom <T extends AtomLike[]> (...atoms: [...T]): AtomLike[]
export function binaryTweenComposeAtom <T extends AtomLike[]> (...atoms: [[...T]] | [...T]): AtomLike[] {
  let _atoms: AtomLike[]
  if (atoms.length === 1 && isArray<AtomLike>(atoms[0])) {
    _atoms = atoms[0]
  } else {
    _atoms = atoms as AtomLike[]
  }

  // 只取最后两项
  const [downstreamAtom, upstreamAtom] = _atoms.slice(-2)
  const tweenedAtoms = tweenAtom(downstreamAtom, upstreamAtom)
  composeAtom(...tweenedAtoms)

  return tweenedAtoms
}

/**
 * 将 n 个 Atom 顺序进行补间连接
 */
export function nAryTweenPipeAtom <T extends AtomLike[]> (atoms: [...T]): AtomLike[]
export function nAryTweenPipeAtom <T extends AtomLike[]> (...atoms: [...T]): AtomLike[]
export function nAryTweenPipeAtom <T extends AtomLike[]> (...atoms: [[...T]] | [...T]): AtomLike[] {
  let _atoms: AtomLike[]
  if (atoms.length === 1 && isArray<AtomLike>(atoms[0])) {
    _atoms = atoms[0]
  } else {
    _atoms = atoms as AtomLike[]
  }

  const tweenedAtoms = tweenAtoms(..._atoms)
  pipeAtom(...tweenedAtoms)

  return tweenedAtoms
}
export const tweenPipeAtom = nAryTweenPipeAtom

/**
 * 将 n 个 Atom 逆序进行补间连接
 */
export function nAryTweenComposeAtom <T extends AtomLike[]> (atoms: [...T]): AtomLike[]
export function nAryTweenComposeAtom <T extends AtomLike[]> (...atoms: [...T]): AtomLike[]
export function nAryTweenComposeAtom <T extends AtomLike[]> (...atoms: [[...T]] | [...T]): AtomLike[] {
  let _atoms: AtomLike[]
  if (atoms.length === 1 && isArray<AtomLike>(atoms[0])) {
    _atoms = atoms[0]
  } else {
    _atoms = atoms as AtomLike[]
  }

  const tweenedAtoms = tweenAtoms(..._atoms)
  composeAtom(...tweenedAtoms)
  return tweenedAtoms
}
export const tweenComposeAtom = nAryTweenComposeAtom
