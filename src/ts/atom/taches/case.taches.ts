import { isFunction, isPlainObject, isArray } from '../../internal/base'
import { curryN } from '../../functional'

import { isVacuo, TERMINATOR } from '../metas'
import { isAtomLike, Data, Mutation } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type Pred<T> = (value: T) => boolean
type StringRecord<V> = Record<string, V>

interface ICaseT {
  <T, V>(
    preds: Array<AtomLikeOfOutput<Pred<T>> | Pred<T>>,
    cases: Array<AtomLikeOfOutput<V> | V>,
    target: AtomLikeOfOutput<T>
  ): Data<V>
  <T, V>(
    preds: StringRecord<AtomLikeOfOutput<Pred<T>> | Pred<T>>,
    cases: StringRecord<AtomLikeOfOutput<V> | V>,
    target: AtomLikeOfOutput<T>
  ): Data<V>
}

/**
 * @param preds A bunch of predicates, a predicate is a function
 *                that takes a value and returns boolean.
 * @param cases A bunch of cases, each case is corresponding to a predicate,
 *                when predicates return true, the corresponding case will be
 *                returned as final value.
 * @param target The target's value will be passed to predicates.
 * @return { Data } Data<V>
 *
 * @see {@link arrayCaseT}, {@link objectCaseT}
 */
export const caseT: ICaseT = (preds, cases, target) => {
  if (isPlainObject(preds) && isPlainObject(cases)) {
    return objectCaseT(preds as StringRecord<any>, cases as StringRecord<any>, target)
  } else if (isArray(preds) && isArray(cases)) {
    return arrayCaseT(preds, cases, target)
  } else if ((isPlainObject(preds) && isArray(preds)) || (isArray(preds) && isPlainObject(cases))) {
    throw (new TypeError('"preds" & "cases" are expected to be the same type.'))
  } else {
    throw (new TypeError('"preds & "cases" are expected to be type of "PlainObject" | "Array".'))
  }
}
/**
 * @see {@link caseT}
 */
export const caseT_ = curryN(3, caseT)

/**
 * @see {@link caseT}, {@link dynamicArrayCaseT}, {@link staticArrayCaseT}
 */
export const arrayCaseT = <T, V>(
  preds: Array<AtomLikeOfOutput<Pred<T>> | Pred<T>>,
  cases: Array<AtomLikeOfOutput<V> | V>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isArray(preds)) {
    throw (new TypeError('"preds" is expected to be type of "Array".'))
  }
  if (!isArray(cases)) {
    throw (new TypeError('"cases" is expected to be type of "Array".'))
  }

  if (preds.some(v => !isAtomLike(v)) || cases.some(v => !isAtomLike(v))) {
    return staticArrayCaseT(preds, cases, target)
  } else {
    return dynamicArrayCaseT(
      preds as Array<AtomLikeOfOutput<Pred<T>>>,
      cases as Array<AtomLikeOfOutput<V>>,
      target
    )
  }
}
/**
 * @see {@link arrayCaseT}
 */
export const arrayCaseT_ = curryN(3, arrayCaseT)

/**
 * @see {@link arrayCaseT}
 */
export const dynamicArrayCaseT = <T, V>(
  preds: Array<AtomLikeOfOutput<Pred<T>>>, cases: Array<AtomLikeOfOutput<V>>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isArray(preds)) {
    throw (new TypeError('"preds" is expected to be type of "Array".'))
  }
  if (!isArray(cases)) {
    throw (new TypeError('"cases" is expected to be type of "Array".'))
  }
  if (preds.length !== cases.length) {
    throw (new TypeError('Lengths of "preds" & "cases" are expected to be equal.'))
  }
  preds.forEach(pred => {
    if (!isAtomLike(pred)) {
      throw (new TypeError('"pred" in "preds" are expected to be type of "AtomLike".'))
    }
  })
  cases.forEach(item => {
    if (!isAtomLike(item)) {
      throw (new TypeError('"case" in "cases" are expected to be type of "AtomLike".'))
    }
  })
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedPred {
    id: number
    type: 'pred'
    value: Vacuo | Pred<T>
  }
  const wrapPredMutations = preds.map<Mutation<Pred<T>, WrappedPred>>(
    (pred, idx) => Mutation.ofLiftLeft(prev => ({
      id: idx,
      type: 'pred',
      value: prev
    }))
  )
  interface WrappedCase {
    id: number
    type: 'case'
    value: Vacuo | V
  }
  const wrapCaseMutations = cases.map<Mutation<V, WrappedCase>>(
    (v, idx) => Mutation.ofLiftLeft(prev => ({
      id: idx,
      type: 'case',
      value: prev
    }))
  )
  interface WrappedTarget {
    type: 'target'
    value: Vacuo | T
  }
  const wrapTargetM = Mutation.ofLiftLeft<T, WrappedTarget>(prev => ({ type: 'target', value: prev }))

  const wrappedPredDatas = preds.map(() => Data.empty<WrappedPred>())
  const wrappedCaseDatas = cases.map(() => Data.empty<WrappedCase>())
  const wrappedTargetD = Data.empty<WrappedTarget>()

  const caseM = Mutation.ofLiftLeft((() => {
    const _internalStates = {
      pred: Array.from<boolean>({ length: preds.length }), case: Array.from<boolean>({ length: cases.length }), target: false
    }
    const _internalValues = {
      pred: Array.from<Pred<T>>({ length: preds.length }), case: Array.from<V>({ length: cases.length }), target: undefined as unknown as T
    }
    return (prev: WrappedPred | WrappedCase | WrappedTarget | Vacuo): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      if (type === 'pred' || type === 'case') {
        _internalStates[type][prev.id] = true
        _internalValues[type][prev.id] = prev.value
      } else if (type === 'target') {
        _internalStates[type] = true
        _internalValues[type] = prev.value
      } else {
        throw (new TypeError('Unexpected "type".'))
      }

      // if target is not prepared, or any of preds is not prepared, do nothing
      if (!_internalStates.target || _internalStates.pred.some(v => !v)) {
        return TERMINATOR
      }
      if (type === 'pred' || type === 'case') {
        return TERMINATOR
      } else if (type === 'target') {
        let matched = false
        let res: V | Terminator = TERMINATOR
        _internalValues.pred.forEach((pred, idx) => {
          if (matched) return
          if (pred(_internalValues.target)) {
            matched = true
            res = _internalStates.case[idx] ? _internalValues.case[idx] : TERMINATOR
          }
        })
        return matched ? res : TERMINATOR
      } else {
        throw (new TypeError('Unexpected "type".'))
      }
    }
  })())

  const outputD = Data.empty<V>()
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
}
/**
 * @see {@link dynamicArrayCaseT}
 */
export const dynamicArrayCaseT_ = curryN(3, dynamicArrayCaseT)

/**
 * @see {@link arrayCaseT}
 */
export const staticArrayCaseT = <T, V>(
  preds: Array<AtomLikeOfOutput<Pred<T>> | Pred<T>>,
  cases: Array<AtomLikeOfOutput<V> | V>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isArray(preds)) {
    throw (new TypeError('"preds" is expected to be type of "Array".'))
  }
  if (!isArray(cases)) {
    throw (new TypeError('"cases" is expected to be type of "Array".'))
  }
  const preparedPreds: Array<AtomLikeOfOutput<Pred<T>>> = []
  preds.forEach((pred, idx) => {
    if (isFunction(pred)) {
      preparedPreds[idx] = replayWithLatest(1, Data.of(pred))
    } else if (isAtomLike(pred)) {
      preparedPreds[idx] = pred
    } else {
      throw (new TypeError('"pred" in "preds" are expected to be type of "Function" | "AtomLike".'))
    }
  })
  const preparedCases: Array<AtomLikeOfOutput<V>> = []
  cases.forEach((item, idx) => {
    if (isAtomLike(item)) {
      preparedCases[idx] = item as AtomLikeOfOutput<V>
    } else {
      preparedCases[idx] = replayWithLatest(1, Data.of(item as V))
    }
  })

  return dynamicArrayCaseT(preparedPreds, preparedCases, target)
}
/**
 * @see {@link staticArrayCaseT}
 */
export const staticArrayCaseT_ = curryN(3, staticArrayCaseT)

/**
 * @see {@link caseT}, {@link dynamicObjectCaseT}, {@link staticObjectCaseT}
 */
export const objectCaseT = <T, V>(
  preds: StringRecord<AtomLikeOfOutput<Pred<T>> | Pred<T>>,
  cases: StringRecord<AtomLikeOfOutput<V> | V>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isPlainObject(preds)) {
    throw (new TypeError('"preds" is expected to be type of  "PlainObject".'))
  }
  if (!isPlainObject(cases)) {
    throw (new TypeError('"cases" is expected to be type of  "PlainObject".'))
  }

  if (Object.values(preds).some(v => !isAtomLike(v)) || Object.values(cases).some(v => !isAtomLike(v))) {
    return staticObjectCaseT(preds, cases, target)
  } else {
    return dynamicObjectCaseT(
      preds as StringRecord<AtomLikeOfOutput<Pred<T>>>,
      cases as StringRecord<AtomLikeOfOutput<V>>,
      target
    )
  }
}
/**
 * @see {@link objectCaseT}
 */
export const objectCaseT_ = curryN(3, objectCaseT)

/**
 * @see {@link objectCaseT}
 */
export const dynamicObjectCaseT = <T, V>(
  preds: StringRecord<AtomLikeOfOutput<Pred<T>>>,
  cases: StringRecord<AtomLikeOfOutput<V>>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isPlainObject(preds)) {
    throw (new TypeError('"preds" is expected to be type of "PlainObject".'))
  }
  if (!isPlainObject(cases)) {
    throw (new TypeError('"cases" is expected to be type of  "PlainObject".'))
  }
  // TODO: same key comparison
  if (new Set([...Object.keys(preds), ...Object.keys(cases)]).size !== Object.keys(preds).length) {
    throw (new TypeError('"preds" & "cases" are expected to have same keys.'))
  }
  Object.values(preds).forEach((item) => {
    if (!isAtomLike(item)) {
      throw (new TypeError('"pred" in "preds" are expected to be type of "AtomLike".'))
    }
  })
  Object.values(cases).forEach((item) => {
    if (!isAtomLike(item)) {
      throw (new TypeError('"case" in "cases" are expected to be type of "AtomLike".'))
    }
  })
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedPred {
    key: string
    type: 'pred'
    value: Vacuo | Pred<T>
  }
  const wrapPredMutations = Object.entries(preds).reduce<StringRecord<Mutation<Pred<T>, WrappedPred>>>(
    (acc, [key]) => {
      acc[key] = Mutation.ofLiftLeft(prev => ({ key: key, type: 'pred', value: prev }))
      return acc
    }, {}
  )
  interface WrappedCase {
    key: string
    type: 'case'
    value: Vacuo | V
  }
  const wrapCaseMutations = Object.entries(cases).reduce<StringRecord<Mutation<V, WrappedCase>>>(
    (acc, [key]) => {
      acc[key] = Mutation.ofLiftLeft(prev => ({ key: key, type: 'case', value: prev }))
      return acc
    }, {}
  )
  interface WrappedTarget {
    type: 'target'
    value: Vacuo | T
  }
  const wrapTargetM = Mutation.ofLiftLeft<T, WrappedTarget>(prev => ({ type: 'target', value: prev }))

  const wrappedPredDatas = Object.entries(preds).reduce<StringRecord<Data<WrappedPred>>>(
    (acc, [key]) => {
      acc[key] = Data.empty()
      return acc
    }, {}
  )
  const wrappedCaseDatas = Object.entries(cases).reduce<StringRecord<Data<WrappedCase>>>(
    (acc, [key]) => {
      acc[key] = Data.empty()
      return acc
    }, {}
  )
  const wrappedTargetD = Data.empty<WrappedTarget>()

  const caseM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      pred: StringRecord<boolean>
      case: StringRecord<boolean>
      target: boolean
    } = { pred: {}, case: {}, target: false }
    const _internalValues: {
      pred: StringRecord<Pred<T>>
      case: StringRecord<V>
      target: T
    } = { pred: {}, case: {}, target: undefined as unknown as T }

    return (prev: WrappedPred | WrappedCase | WrappedTarget | Vacuo): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      if (type === 'pred' || type === 'case') {
        _internalStates[type][prev.key] = true
        _internalValues[type][prev.key] = prev.value
      } else if (type === 'target') {
        _internalStates[type] = true
        _internalValues[type] = prev.value
      } else {
        throw (new TypeError('Unexpected "type".'))
      }

      // if target is not prepared, or any of preds is not prepared, do nothing
      if (!_internalStates.target || Object.values(_internalStates.pred).some(v => !v)) {
        return TERMINATOR
      }
      if (type === 'pred' || type === 'case') {
        return TERMINATOR
      } else if (type === 'target') {
        let matched = false
        let res: V | Terminator = TERMINATOR
        Object.entries(_internalValues.pred).forEach(([key, pred]) => {
          if (matched) return
          if (pred(_internalValues.target)) {
            matched = true
            res = _internalStates.case[key] ? _internalValues.case[key] : TERMINATOR
          }
        })
        return res
      } else {
        throw (new TypeError('Unexpected "type".'))
      }
    }
  })())

  const outputD = Data.empty<V>()

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
}
/**
 * @see {@link dynamicObjectCaseT}
 */
export const dynamicObjectCaseT_ = curryN(3, dynamicObjectCaseT)

/**
 * @see {@link objectCaseT}
 */
export const staticObjectCaseT = <T, V>(
  preds: StringRecord<AtomLikeOfOutput<Pred<T>> | Pred<T>>,
  cases: StringRecord<AtomLikeOfOutput<V> | V>,
  target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isPlainObject(preds)) {
    throw (new TypeError('"preds" is expected to be type of "PlainObject".'))
  }
  if (!isPlainObject(cases)) {
    throw (new TypeError('"cases" is expected to be type of  "PlainObject".'))
  }

  const preparedPreds: StringRecord<AtomLikeOfOutput<Pred<T>>> = {}
  Object.entries(preds).forEach(([key, pred]) => {
    if (isFunction(pred)) {
      preparedPreds[key] = replayWithLatest(1, Data.of(pred))
    } else if (isAtomLike(pred)) {
      preparedPreds[key] = pred
    } else {
      throw (new TypeError('"pred" in "preds" are expected to be type of "Function" | "AtomLike".'))
    }
  })
  const preparedCases: StringRecord<AtomLikeOfOutput<V>> = {}
  Object.entries(cases).forEach(([key, item]) => {
    if (isAtomLike(item)) {
      preparedCases[key] = item as AtomLikeOfOutput<V>
    } else {
      preparedCases[key] = replayWithLatest(1, Data.of(item as V))
    }
  })

  return dynamicObjectCaseT(preparedPreds, preparedCases, target)
}
/**
 * @see {@link staticObjectCaseT}
 */
export const staticObjectCaseT_ = curryN(3, staticObjectCaseT)
