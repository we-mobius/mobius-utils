import { isArray, isFunction } from '../internal.js'
import { invoker, curryN } from '../functional.js'
import { isAtom, isData, isMutation, Mutation, Data } from './atom.js'
import { isMediator } from './mediators.js'

export * from './helpers/normal-create.helpers.js'
export * from './helpers/batch-create.helpers.js'
export * from './helpers/hybrid-create.helpers.js'
export * from './helpers/derive-create.helpers.js'
export * from './helpers/transform.helpers.js'

export const observe = invoker(2, 'observe')
export const beObservedBy = invoker(2, 'beObservedBy')

export const getAtomType = tar => {
  return isMediator(tar) ? getAtomType(tar.atom) : tar.type
}

export const isSameTypeOfAtom = curryN(2, (tarA, tarB) => {
  if (!isAtom(tarA) || !isAtom(tarB)) {
    return false
  } else {
    const atomTypeA = getAtomType(tarA)
    const atomTypeB = getAtomType(tarB)
    return atomTypeA === atomTypeB
  }
})
export const isSameTypeOfMediator = curryN(2, (tarA, tarB) => isMediator(tarA) && isMediator(tarB) && tarA.type === tarB.type)

export const pipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  args.reverse().forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1])
    }
  })

  return args[args.length - 1]
}

export const composeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  args.forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1])
    }
  })
  return args[0]
}

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
  const [upstreamAtom, downstreamAtom] = args
  return pipeAtom(...tweenAtom(upstreamAtom, downstreamAtom))
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
  const [downstreamAtom, upstreamAtom] = args
  return composeAtom(...tweenAtom(downstreamAtom, upstreamAtom))
}
/**
 * 将 n 个 Atom 顺序进行补间连接
 */
export const nAryTweenPipeAtom = (...args) => {
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
  return pipeAtom(...tweenedAtoms)
}
export const tweenPipeAtom = nAryTweenPipeAtom
/**
 * 将 n 个 Atom 逆序进行补间连接
 */
export const nAryTweenComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  return nAryTweenPipeAtom(...args.reverse())
}
export const tweenComposeAtom = nAryTweenComposeAtom

export const liftAtom = target => {
  if (isAtom(target)) {
    return target
  } else if (isFunction(target)) {
    return Mutation.ofLiftBoth(target)
  } else {
    return Data.of(target)
  }
}

export const binaryLiftPipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取前两项
  args = args.slice(0, 2)
  const atoms = args.map(liftAtom)
  pipeAtom(atoms)
  return atoms
}
export const binaryLiftComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  // 只取最后两项
  args = args.slice(-2)
  const atoms = args.map(liftAtom)
  composeAtom(atoms)
  return atoms
}

export const nAryLiftPipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const atoms = args.map(liftAtom)
  pipeAtom(atoms)
  return atoms
}
export const liftPipeAtom = nAryLiftPipeAtom
export const nAryLiftComposeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  const atoms = args.map(liftAtom)
  composeAtom(atoms)
  return atoms
}
export const liftComposeAtom = nAryLiftComposeAtom

export const binaryHyperPipeAtom = () => {}
export const binaryHyperComposeAtom = () => {}

export const nAryHyperPipeAtom = (...args) => {}
export const hyperPipeAtom = nAryHyperPipeAtom
export const nAryHyperComposeAtom = (...args) => {}
export const hyperComposeAtom = nAryHyperComposeAtom
