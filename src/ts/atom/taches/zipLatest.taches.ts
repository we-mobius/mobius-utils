import { isArray, isObject } from '../../internal'
import { TERMINATOR, isTerminator } from '../meta'
import { Mutation, Data, isAtom } from '../atom'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param argument Atom | [Atom] | { Atom }
 * @return atom Data
 */
export const zipLatestT = (...args) => {
  if (isAtom(args[0]) || isArray(args[0])) {
    return arrayZipLatestT(...args)
  } else if (isObject(args[0])) {
    return objectZipLatestT(...args)
  } else {
    throw (new TypeError('Arguments of zipLatestT are expected to be type of Atom | [Atom] | { Atom }.'))
  }
}

/**
 * @param argument Atom | [Atom]
 * @return atom Data
 */
export const arrayZipLatestT = (...args) => {
  let atoms = args[0]
  if (!isArray(atoms)) {
    atoms = args
  }

  const inputDatas = atoms.map(atom => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of arrayZipLatestT are expected to be type of "Atom".'))
    }
    return atom
  })

  const wrapMutations = Array.from({ length: atoms.length }).map((val, idx) =>
    Mutation.ofLiftLeft((prev) => ({ id: idx, value: prev }))
  )

  const wrappedDatas = Array.from({ length: atoms.length }).map(() => Data.empty())

  const zipM = Mutation.ofLiftLeft((() => {
    const _internalState = Array.from({ length: atoms.length })
    const _intervalValues = Array.from({ length: atoms.length })
    return prev => {
      const { id, value } = prev
      _internalState[id] = true
      _intervalValues[id] = value
      if (_internalState.every(val => val) && _intervalValues.every(val => !isTerminator(val))) {
        _internalState.forEach((_, idx) => { _internalState[idx] = false })
        return [..._intervalValues]
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty()

  pipeAtom(zipM, outputD)
  wrappedDatas.forEach(data => {
    pipeAtom(data, zipM)
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
export const objectZipLatestT = (obj) => {
  const inputDatas = Object.entries(obj).reduce((acc, [key, atom]) => {
    if (!isAtom(atom)) {
      throw (new TypeError('Arguments of objectZipLatestT are expected to be type of "Atom".'))
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

  const zipM = Mutation.ofLiftLeft((() => {
    const _internalState = Object.keys(obj).reduce((acc, key) => {
      acc[key] = false
      return acc
    }, {})
    const _intervalValues = Object.keys(obj).reduce((acc, key) => {
      acc[key] = undefined
      return acc
    }, {})
    return prev => {
      const { key, value } = prev
      _internalState[key] = true
      _intervalValues[key] = value
      if (Object.values(_internalState).every(val => val) && Object.values(_intervalValues).every(val => !isTerminator(val))) {
        Object.keys(_internalState).forEach(key => {
          _internalState[key] = false
        })
        return { ..._intervalValues }
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty()

  pipeAtom(zipM, outputD)
  Object.values(wrappedDatas).forEach(data => {
    pipeAtom(data, zipM)
  })
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    pipeAtom(wrapMutation, wrappedDatas[key])
  })
  Object.entries(inputDatas).forEach(([key, data]) => {
    binaryTweenPipeAtom(data, wrapMutations[key])
  })

  return outputD
}
