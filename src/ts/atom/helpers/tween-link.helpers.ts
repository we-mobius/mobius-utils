import { isArray } from '../../internal'
import { isAtom, isData, isMutation, Mutation, Data } from '../atoms'
import { isSameTypeOfAtom } from './base.helpers'
import { pipeAtom, composeAtom } from './normal-link.helpers'

import type { DataMediator, MutationMediator } from '../mediators'

type ValidAtom = Data<any> | Mutation<any, any> | DataMediator<Data<any>> | MutationMediator<Mutation<any, any>>

type ITweenAtom = (upstreamAtom: ValidAtom, downstreamAtom: ValidAtom) => ValidAtom[]

export const tweenAtom: ITweenAtom = (upstreamAtom, downstreamAtom) => {
  if (!isAtom(upstreamAtom)) {
    throw (new TypeError('"upstreamAtom" is expected to be type of "Atom" or "AtomLike".'))
  }
  if (!isAtom(downstreamAtom)) {
    throw (new TypeError('"downstreamAtom" is expected to be type of "Atom" or "AtomLike".'))
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

interface ITweenAtoms {
  (...atoms: ValidAtom[]): typeof atoms
  (...atoms: [ValidAtom[]]): typeof atoms[0]
}
export const tweenAtoms: ITweenAtoms = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const tweenedAtoms = args.reduce((acc, cur, idx, arr) => {
    const hasNext = arr[idx + 1]
    if (hasNext !== undefined) {
      acc.push(...tweenAtom(cur, hasNext).slice(1))
    }
    return acc
  }, [args[0]])
  return tweenedAtoms
}

type ITweenPipeAtom = ITweenAtoms
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
export const binaryTweenPipeAtom: ITweenPipeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取前两项
  const [upstreamAtom, downstreamAtom] = args.slice(0, 2)
  const tweenedAtoms = tweenAtom(upstreamAtom, downstreamAtom)
  pipeAtom(...tweenedAtoms)
  return tweenedAtoms
}

type ITweenComposeAtom = ITweenAtoms
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
export const binaryTweenComposeAtom: ITweenComposeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取最后两项
  const [downstreamAtom, upstreamAtom] = args.slice(-2)
  const tweenedAtoms = tweenAtom(downstreamAtom, upstreamAtom)
  composeAtom(...tweenedAtoms)
  return tweenedAtoms
}

/**
 * 将 n 个 Atom 顺序进行补间连接
 */
export const nAryTweenPipeAtom: ITweenPipeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const tweenedAtoms = tweenAtoms(...args)
  pipeAtom(...tweenedAtoms)
  return tweenedAtoms
}
export const tweenPipeAtom = nAryTweenPipeAtom

/**
 * 将 n 个 Atom 逆序进行补间连接
 */
export const nAryTweenComposeAtom: ITweenComposeAtom = (...args: any[]): any => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const tweenedAtoms = tweenAtoms(...args)
  composeAtom(...tweenedAtoms)
  return tweenedAtoms
}
export const tweenComposeAtom = nAryTweenComposeAtom
