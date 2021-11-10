import { isArray, isObject } from '../../internal'
import { TERMINATOR, isTerminator } from '../meta'
import { Mutation, Data, isAtom } from '../atom'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param argument Atom | [Atom] | { Atom }
 * @return atom Data
 */
export const combineT = (...args) => {
  if (isAtom(args[0]) || isArray(args[0])) {
    return arrayCombineT(...args)
  } else if (isObject(args[0])) {
    return objectCombineT(...args)
  } else {
    throw (new TypeError('Arguments of combineT are expected to be type of Atom | [Atom] | { Atom }.'))
  }
}

/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */
export const arrayCombineT = (...args) => {
  let atoms = args[0]
  if (!isArray(atoms)) {
    atoms = args
  }

  const inputAtoms = atoms.map(atom => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of combineT are expected to be type of "Atom".'))
    }
    return atom
  })

  const length = atoms.length

  const wrapMutations = Array.from({ length }).map((val, idx) =>
    Mutation.ofLiftLeft((prev) => ({ id: idx, value: prev }))
  )

  const wrappedDatas = Array.from({ length }).map(() => Data.empty())

  const combineM = Mutation.ofLiftLeft((() => {
    const _internalStates = Array.from({ length })
    const _intervalValues = Array.from({ length })
    return prev => {
      const { id, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[id] = true
      _intervalValues[id] = value

      return [..._intervalValues]
    }
  })())

  const outputD = Data.of(Array.from({ length }))

  pipeAtom(combineM, outputD)
  wrappedDatas.forEach(data => {
    pipeAtom(data, combineM)
  })
  wrapMutations.forEach((wrapMutation, idx) => {
    pipeAtom(wrapMutation, wrappedDatas[idx])
  })
  inputAtoms.forEach((atom, idx) => {
    binaryTweenPipeAtom(atom, wrapMutations[idx])
  })

  return outputD
}

/**
 * @param obj Object, { Atom }
 * @return atom Data
 */
export const objectCombineT = (obj) => {
  const inputAtoms = Object.entries(obj).reduce((acc, [key, atom]) => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of objectCombineT are expected to be type of "Atom".'))
    }
    acc[key] = atom
    return acc
  }, {})

  const wrapMutations = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = Mutation.ofLiftLeft((prev) => ({ key: key, value: prev }))
    return acc
  }, {})

  const wrappedDatas = Object.entries(obj).reduce((acc, [key]) => {
    acc[key] = Data.empty()
    return acc
  }, {})

  const combineM = Mutation.ofLiftLeft((() => {
    const _internalStates = Object.keys(obj).reduce((acc, key) => {
      acc[key] = false
      return acc
    }, {})
    const _intervalValues = Object.keys(obj).reduce((acc, key) => {
      acc[key] = undefined
      return acc
    }, {})
    return prev => {
      const { key, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[key] = true
      _intervalValues[key] = value

      return { ..._intervalValues }
    }
  })())

  const outputD = Data.of(Object.keys(obj).reduce((acc, key) => {
    acc[key] = undefined
    return acc
  }, {}))

  pipeAtom(combineM, outputD)
  Object.values(wrappedDatas).forEach(data => {
    pipeAtom(data, combineM)
  })
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    pipeAtom(wrapMutation, wrappedDatas[key])
  })
  Object.entries(inputAtoms).forEach(([key, atom]) => {
    binaryTweenPipeAtom(atom, wrapMutations[key])
  })

  return outputD
}
