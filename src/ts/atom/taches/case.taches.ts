import { isFunction, isObject, isArray } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../meta'
import { Data, Mutation, isAtom } from '../atom'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param preds Array | Object
 * @param cases Array | Object
 * @param target Atom
 * @return atom Data
 */
export const caseT = curryN(3, (preds, cases, target) => {
  if (isObject(preds) && isObject(cases)) {
    return objectCaseT(preds, cases, target)
  } else if (isArray(preds) && isArray(cases)) {
    return arrayCaseT(preds, cases, target)
  } else if ((isObject(preds) && isArray(preds)) || (isArray(preds) && isObject(cases))) {
    throw (new TypeError('"preds" & "cases" argument of caseT are expected to be the same type.'))
  } else {
    throw (new TypeError('"preds & "cases" argument of caseT are expected to be type of "Object" | "Array".'))
  }
})

/**
 * @param preds Array, [ Function, Atom ] | [ Atom ]
 * @param cases Array, [ Any, Atom ] | [ Atom ]
 * @param target Atom
 * @return atom Data
 */
export const arrayCaseT = curryN(3, (preds, cases, target) => {
  if (!isArray(preds)) {
    throw (new TypeError('"preds" argument of arrayCaseT is expected to be type of "Array".'))
  }
  if (!isArray(cases)) {
    throw (new TypeError('"cases" argument of arrayCaseT is expected to be type of "Array".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of arrayCaseT is expected to be type of "Atom".'))
  }
  if (preds.some(v => !isAtom(v)) || cases.some(v => !isAtom(v))) {
    return staticArrayCaseT(preds, cases, target)
  } else {
    return dynamicArrayCaseT(preds, cases, target)
  }
})

/**
 * @param preds Array, [ Atom ]
 * @param cases Array, [ Atom ]
 * @param target Atom
 * @return atom Data
 */
export const dynamicArrayCaseT = curryN(3, (preds, cases, target) => {
  if (!isArray(preds)) {
    throw (new TypeError('"preds" argument of dynamicArrayCaseT is expected to be type of "Array".'))
  }
  if (!isArray(cases)) {
    throw (new TypeError('"cases" argument of dynamicArrayCaseT is expected to be type of "Array".'))
  }
  if (preds.length !== cases.length) {
    throw (new TypeError('Lengths of "preds" & "cases" argument of arrayCaseT are expected to be equal.'))
  }
  preds.forEach(pred => {
    if (!isAtom(pred)) {
      throw (new TypeError('"pred" in "preds" argument of dynamicArrayCaseT are expected to be type of "Atom".'))
    }
  })
  cases.forEach(item => {
    if (!isAtom(item)) {
      throw (new TypeError('"case" in "cases" argument of dynamicArrayCaseT are expected to be type of "Atom".'))
    }
  })
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of arrayCaseT is expected to be type of "Atom".'))
  }

  const wrapPredMutations = preds.map((pred, idx) => Mutation.ofLiftLeft(prev => ({
    id: idx,
    type: 'pred',
    value: prev
  })))
  const wrapCaseMutations = cases.map((v, idx) => Mutation.ofLiftLeft(prev => ({
    id: idx,
    type: 'case',
    value: prev
  })))
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))

  const wrappedPredDatas = preds.map(() => Data.empty())
  const wrappedCaseDatas = cases.map(() => Data.empty())
  const wrappedTargetD = Data.empty()

  const caseM = Mutation.ofLiftLeft((() => {
    const _internalStates = { pred: Array.from({ length: preds.length }), case: Array.from({ length: cases.length }), target: false }
    const _internalValues = { pred: Array.from({ length: preds.length }), case: Array.from({ length: cases.length }), target: undefined }
    return prev => {
      const { id, type, value } = prev
      if (type !== 'pred' && type !== 'case' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in caseM, expected to be "pred" | "case" | "target", but received "${type}"`))
      }
      if (type === 'pred' || type === 'case') {
        _internalStates[type][id] = true
        _internalValues[type][id] = value
      }
      if (type === 'target') {
        _internalStates[type] = true
        _internalValues[type] = value
      }
      if (!_internalStates.target || _internalStates.pred.some(v => !v)) {
        return TERMINATOR
      }
      if (type === 'pred' || type === 'case') {
        return TERMINATOR
      }
      if (type === 'target') {
        let matched = false
        let res
        for (let i = 0, len = _internalValues.pred.length; i < len; i++) {
          if (matched) {
            break
          } else {
            if (_internalValues.pred[i](_internalValues.target)) {
              matched = true
              res = _internalStates.case[i] ? _internalValues.case[i] : TERMINATOR
            }
            return matched ? res : TERMINATOR
          }
        }
        return res
      }
    }
  })())

  const outputD = Data.empty()
  pipeAtom(caseM, outputD)

  wrapPredMutations.forEach((mutation, idx) => {
    pipeAtom(mutation, wrappedPredDatas[idx], caseM)
    binaryTweenPipeAtom(preds[idx], mutation)
  })
  wrapCaseMutations.forEach((mutation, idx) => {
    pipeAtom(mutation, wrappedCaseDatas[idx], caseM)
    binaryTweenPipeAtom(cases[idx], mutation)
  })
  pipeAtom(wrapTargetM, wrappedTargetD, caseM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param preds Array, [ Function, Atom ]
 * @param cases Array, [ Any, Atom ]
 * @param target Atom
 * @return atom Data
 */
export const staticArrayCaseT = curryN(3, (preds, cases, target) => {
  if (!isArray(preds)) {
    throw (new TypeError('"preds" argument of staticArrayCaseT is expected to be type of "Array".'))
  }
  if (!isArray(cases)) {
    throw (new TypeError('"cases" argument of staticArrayCaseT is expected to be type of "Array".'))
  }
  preds.forEach((pred, idx) => {
    if (isFunction(pred)) {
      preds[idx] = replayWithLatest(1, Data.of(pred))
    } else if (isAtom(pred)) {
      // do nothing
    } else {
      throw (new TypeError('"pred" in "preds" argument of staticArrayCaseT are expected to be type of "Function" | "Atom".'))
    }
  })
  cases.forEach((item, idx) => {
    if (!isAtom(item)) {
      cases[idx] = replayWithLatest(1, Data.of(item))
    }
  })
  return dynamicArrayCaseT(preds, cases, target)
})

/**
 * @param preds Object, { Function, Atom } | { Atom }
 * @param cases Object, { Any, Atom } | { Atom }
 * @param target Atom
 * @return atom Data
 */
export const objectCaseT = curryN(3, (preds, cases, target) => {
  if (!isObject(preds)) {
    throw (new TypeError('"preds" argument of objectCaseT is expected to be type of  "Object".'))
  }
  if (!isObject(cases)) {
    throw (new TypeError('"cases" argument of objectCaseT is expected to be type of  "Object".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of objectCaseT is expected to be type of "Atom".'))
  }
  if (Object.values(preds).some(v => !isAtom(v)) || Object.values(cases).some(v => !isAtom(v))) {
    return staticObjectCaseT(preds, cases, target)
  } else {
    return dynamicObjectCaseT(preds, cases, target)
  }
})

/**
 * @param preds Object, { Atom }
 * @param cases Object, { Atom }
 * @param target Atom
 * @return atom Data
 */
export const dynamicObjectCaseT = curryN(3, (preds, cases, target) => {
  if (!isObject(preds)) {
    throw (new TypeError('"preds" argument of dynamicObjectCaseT is expected to be type of "Object".'))
  }
  if (!isObject(cases)) {
    throw (new TypeError('"cases" argument of dynamicObjectCaseT is expected to be type of  "Object".'))
  }
  if (new Set([...Object.keys(preds), ...Object.keys(cases)]).size !== Object.keys(preds).length) {
    throw (new TypeError('"preds" & "cases" argument of dynamicObjectCaseT are expected to have same keys.'))
  }
  Object.values(preds).forEach((item) => {
    if (!isAtom(item)) {
      throw (new TypeError('"pred" in "preds" argument of dynamicObjectCaseT are expected to be type of "Atom".'))
    }
  })
  Object.values(cases).forEach((item) => {
    if (!isAtom(item)) {
      throw (new TypeError('"case" in "cases" argument of dynamicObjectCaseT are expected to be type of "Atom".'))
    }
  })
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of arrayCaseT is expected to be type of "Atom".'))
  }

  const wrapPredMutations = Object.entries(preds).reduce((acc, [key]) => {
    acc[key] = Mutation.ofLiftLeft(prev => ({ key: key, type: 'pred', value: prev }))
    return acc
  }, {})
  const wrapCaseMutations = Object.entries(cases).reduce((acc, [key]) => {
    acc[key] = Mutation.ofLiftLeft(prev => ({ key: key, type: 'case', value: prev }))
    return acc
  }, {})
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))

  const wrappedPredDatas = Object.entries(preds).reduce((acc, [key]) => {
    acc[key] = Data.empty()
    return acc
  }, {})
  const wrappedCaseDatas = Object.entries(cases).reduce((acc, [key]) => {
    acc[key] = Data.empty()
    return acc
  }, {})
  const wrappedTargetD = Data.empty()

  const caseM = Mutation.ofLiftLeft((() => {
    const _internalStates = { pred: {}, case: {}, target: false }
    const _internalValues = { pred: {}, case: {}, target: undefined }
    return prev => {
      const { key, type, value } = prev
      if (type !== 'pred' && type !== 'case' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in caseM, expected to be "pred" | "case" | "target", but received "${type}".`))
      }
      if (type === 'pred' || type === 'case') {
        _internalStates[type][key] = true
        _internalValues[type][key] = value
      }
      if (type === 'target') {
        _internalStates[type] = true
        _internalValues[type] = value
      }
      if (!_internalStates.target || Object.values(_internalStates.pred).some(v => !v)) {
        return TERMINATOR
      }
      if (type === 'pred' || type === 'case') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        let matched = false
        let res
        const keys = Object.keys(_internalValues.pred)
        for (let i = 0, len = keys.length; i < len; i++) {
          const key = keys[i]
          if (matched) {
            break
          } else {
            if (_internalValues.pred[key](_internalValues.target)) {
              matched = true
              res = _internalStates.case[key] ? _internalValues.case[key] : TERMINATOR
            }
            return matched ? res : TERMINATOR
          }
        }
        return res
      }
    }
  })())

  const outputD = Data.empty()

  pipeAtom(caseM, outputD)
  Object.entries(wrapPredMutations).forEach(([key, mutation]) => {
    pipeAtom(mutation, wrappedPredDatas[key], caseM)
    binaryTweenPipeAtom(preds[key], mutation)
  })
  Object.entries(wrapCaseMutations).forEach(([key, mutation]) => {
    pipeAtom(mutation, wrappedCaseDatas[key], caseM)
    binaryTweenPipeAtom(cases[key], mutation)
  })
  pipeAtom(wrapTargetM, wrappedTargetD, caseM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param preds Object, { Function, Atom }
 * @param cases Object, { Any, Atom }
 * @parem target Atom
 * @return atom Data
 */
export const staticObjectCaseT = curryN(3, (preds, cases, target) => {
  if (!isObject(preds)) {
    throw (new TypeError('"preds" argument of staticObjectCaseT is expected to be type of "Object".'))
  }
  if (!isObject(cases)) {
    throw (new TypeError('"cases" argument of staticObjectCaseT is expected to be type of  "Object".'))
  }
  Object.entries(preds).forEach(([key, pred]) => {
    if (isFunction(pred)) {
      preds[key] = replayWithLatest(1, Data.of(pred))
    } else if (isAtom(pred)) {
      // do nothing
    } else {
      throw (new TypeError('"pred" in "preds" argument of staticObjectCaseT are expected to be type of "Function" | "Atom".'))
    }
  })
  Object.entries(cases).forEach(([key, item]) => {
    if (!isAtom(item)) {
      cases[key] = replayWithLatest(1, Data.of(item))
    }
  })
  return dynamicObjectCaseT(preds, cases, target)
})
