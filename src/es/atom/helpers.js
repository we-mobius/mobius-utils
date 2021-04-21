import { invoker, flip, curryN } from '../functional.js'
import { isAtom, isData, isMutation, Mutation, Data } from './atom.js'
import { isMediator } from './mediators.js'

export * from './helpers/normal-create.helpers.js'
export * from './helpers/batch-create.helpers.js'
export * from './helpers/hybrid-create.helpers.js'
export * from './helpers/derive-create.helpers.js'
export * from './helpers/transform.helpers.js'

export const observe = invoker(2, 'observe')
export const beObservedBy = invoker(2, 'beObservedBy')

export const isSameTypeOfAtom = curryN(2, (tarA, tarB) => {
  if (!isAtom(tarA) || !isAtom(tarB)) {
    return false
  } else {
    const atomTypeA = isMediator(tarA) ? tarA.atom.type : tarA.type
    const atomTypeB = isMediator(tarB) ? tarB.atom.type : tarB.type
    return atomTypeA === atomTypeB
  }
})
export const isSameTypeOfMediator = curryN(2, (tarA, tarB) => isMediator(tarA) && isMediator(tarB) && tarA.type === tarB.type)

export const pipeAtom = (...args) => {
  args.reverse().forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1])
    }
  })
  return args[args.length - 1]
}

export const composeAtom = (...args) => {
  args.forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1])
    }
  })
  return args[0]
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
export const binaryTweenPipeAtom = (upstreamAtom, downstreamAtom) => {
  if (!isAtom(upstreamAtom)) {
    throw (new TypeError('"upstreamAtom" argument of binaryTweenPipeAtom are expected to be type of "Mutation" or "Data".'))
  }
  if (!isAtom(downstreamAtom)) {
    throw (new TypeError('"downstreamAtom" argument of binaryTweenPipeAtom are expected to be type of "Mutation" or "Data".'))
  }

  if (!isSameTypeOfAtom(upstreamAtom, downstreamAtom)) {
    // data, mutation
    // mutation, data
    return pipeAtom(upstreamAtom, downstreamAtom)
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
    return pipeAtom(upstreamAtom, tweenAtom, downstreamAtom)
  }
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
export const binaryTweenComposeAtom = flip(binaryTweenPipeAtom)

export const nAryTweenPipeAtom = (...args) => {}
export const nAryTweenComposeAtom = (...args) => {}

export const binaryLiftPipeAtom = () => {}
export const binaryLiftComposeAtom = () => {}

export const nAryLiftPipeAtom = (...args) => {}
export const nAryLiftComposeAtom = (...args) => {}

export const binaryHyperPipeAtom = () => {}
export const binaryHyperComposeAtom = () => {}

export const nAryHyperPipeAtom = (...args) => {}
export const nAryHyperComposeAtom = (...args) => {}
