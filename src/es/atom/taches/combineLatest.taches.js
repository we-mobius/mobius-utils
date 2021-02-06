import { isArray, isObject } from '../../internal.js'
import { TERMINATOR, isTerminator } from '../meta.js'
import { Mutation, Data, isAtom } from '../atom.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * @param argument Atom | [Atom] | { Atom }
 * @return atom Data
 */
export const combineLatestT = (...args) => {
  if (isAtom(args[0]) || isArray(args[0])) {
    return arrayCombineLatestT(...args)
  } else if (isObject(args[0])) {
    return objectCombineLatestT(...args)
  } else {
    throw (new TypeError('Arguments of combineLatestT are expected to be type of Atom | [Atom] | { Atom }.'))
  }
}

/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */
export const arrayCombineLatestT = (...args) => {
  let atoms = args[0]
  if (!isArray(atoms)) {
    atoms = args
  }

  const inputDatas = atoms.map(atom => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of combineT are expected to be type of "Atom".'))
    }
    return atom
  })

  const wrapMutations = Array.from({ length: atoms.length }).map((val, idx) =>
    Mutation.ofLiftLeft((prev) => ({ id: idx, value: prev }))
  )

  const wrappedDatas = Array.from({ length: atoms.length }).map(() => Data.empty())

  const combineM = Mutation.ofLiftLeft((() => {
    const _internalStates = Array.from({ length: atoms.length })
    const _intervalValues = Array.from({ length: atoms.length })
    return prev => {
      const { id, value } = prev
      _internalStates[id] = true
      _intervalValues[id] = value
      if (_internalStates.every(val => val) && _intervalValues.every(val => !isTerminator(val))) {
        return [..._intervalValues]
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty()

  pipeAtom(combineM, outputD)
  wrappedDatas.forEach(data => {
    pipeAtom(data, combineM)
  })
  wrapMutations.forEach((wrapMutation, idx) => {
    pipeAtom(wrapMutation, wrappedDatas[idx])
  })
  inputDatas.forEach((data, idx) => {
    binaryTweenPipeAtom(data, wrapMutations[idx])
  })

  return outputD
}

/**
 * @param obj Object, { Atom }
 * @return atom Data
 */
export const objectCombineLatestT = (obj) => {
  const inputDatas = Object.entries(obj).reduce((acc, [key, atom]) => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of objectCombineLatestT are expected to be type of "Atom".'))
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
      _internalStates[key] = true
      _intervalValues[key] = value
      if (Object.values(_internalStates).every(val => val) && Object.values(_intervalValues).every(val => !isTerminator(val))) {
        return { ..._intervalValues }
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty()

  pipeAtom(combineM, outputD)
  Object.values(wrappedDatas).forEach(data => {
    pipeAtom(data, combineM)
  })
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    pipeAtom(wrapMutation, wrappedDatas[key])
  })
  Object.entries(inputDatas).forEach(([key, data]) => {
    binaryTweenPipeAtom(data, wrapMutations[key])
  })

  return outputD
}
