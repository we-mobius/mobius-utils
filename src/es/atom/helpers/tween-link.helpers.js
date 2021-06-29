import { isArray } from '../../internal.js'
import { isAtom, isData, isMutation, Mutation, Data } from '../atom.js'
import { isSameTypeOfAtom } from './base.helpers.js'
import { pipeAtom, composeAtom } from './normal-link.helpers.js'

export const tweenAtom = (upstreamAtom, downstreamAtom) => {
  if (!isAtom(upstreamAtom)) {
    throw (new TypeError('"upstreamAtom" argument of tweenAtom are expected to be type of "Atom".'))
  }
  if (!isAtom(downstreamAtom)) {
    throw (new TypeError('"downstreamAtom" argument of tweenAtom are expected to be type of "Atom".'))
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
export const tweenAtoms = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const tweenedAtoms = args.reduce((acc, cur, idx, arr) => {
    const next = arr[idx + 1]
    if (next) {
      acc.push(...tweenAtom(cur, next).slice(1))
    }
    return acc
  }, [args[0]])
  return tweenedAtoms
}
/**
 * Automatically pipe two atom
 *
 * - if they are in the different type, use normal pipe logic
 * - if they are in the same type, create a tween atom between them,
 *   then use normal pipe logic to three atom
 *   - for Data atom, tween atom is the type of Mutation (asIs Mutation)
 *   - for Mutation atom, tween atom is the type of Data
 *
 * @param upstreamAtom Atom, i.e. Data | Mutation
 * @param downstreamAtom Atom, i.e. Data | Mutation
 * @return downstreamAtom
 */
export const binaryTweenPipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取前两项
  args = args.slice(0, 2)
  const [upstreamAtom, downstreamAtom] = args
  const tweenedAtoms = tweenAtom(upstreamAtom, downstreamAtom)
  pipeAtom(...tweenedAtoms)
  return tweenedAtoms
}

/**
 * Automatically compose two atom
 *
 * - if they are in the different type, use normal compose logic
 * - if they are in the same type, create a tween atom between them,
 *   then use normal compose logic to three atom
 *   - for Data atom, tween atom is the type of Mutation (asIs Mutation)
 *   - for Mutation atom, tween atom is the type of Data
 *
 * @param downstreamAtom Atom, i.e. Data | Mutation
 * @param upstreamAtom Atom, i.e. Data | Mutation
 * @return downstreamAtom
 */
export const binaryTweenComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取最后两项
  args = args.slice(-2)
  const [downstreamAtom, upstreamAtom] = args
  const tweenedAtoms = tweenAtom(downstreamAtom, upstreamAtom)
  composeAtom(...tweenedAtoms)
  return tweenedAtoms
}
/**
 * 将 n 个 Atom 顺序进行补间连接
 */
export const nAryTweenPipeAtom = (...args) => {
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
export const nAryTweenComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const tweenedAtoms = tweenAtoms(...args)
  composeAtom(tweenAtoms)
  return tweenedAtoms
}
export const tweenComposeAtom = nAryTweenComposeAtom
