import { isNumber } from '../../internal.js'
import { curryN, pipe } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { isAtom, Mutation, Data } from '../atom.js'
import { replayWithLatest } from '../mediators.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

import { filterT } from './filter.taches.js'

/**
 * Takes a "n" which value will be used as length of history's length,
 * it can be type of Number or Atom.
 *
 * Returned atom will emits specified number of target's value as an array.
 *
 * @param n Number | Atom
 * @param target Atom
 * @return atom Data
 */
export const withHistoryT = curryN(2, (n, target) => {
  if (isNumber(n)) {
    return withStaticHistoryT(n, target)
  } else if (isAtom(n)) {
    return withDynamicHistoryT(n, target)
  } else {
    throw (new TypeError('"n" argument of withHistoryT is expected to be type of "Number" or "Atom"'))
  }
})

/**
 * @param n Atom
 * @param target Atom
 * @return atom Data
 */
export const withDynamicHistoryT = curryN(2, (n, target) => {
  if (!isAtom(n)) {
    throw (new TypeError('"n" argument of withDynamicHistoryT is expected to be type of "Mutation" or "Data".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of withDynamicHistoryT is expected to be type of "Mutation" or "Data".'))
  }

  const wrapNumM = Mutation.ofLiftLeft(prev => ({ type: 'n', value: parseInt(prev) }))
  const wrappedNumD = Data.empty()
  pipeAtom(wrapNumM, wrappedNumD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const withHistoryM = Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    // history :: [latest, ..., oldest]
    const _internalStates = { n: false, target: false, history: [] }
    const _internalValues = { n: undefined, target: undefined }
    // actual mutation operation function
    return prev => {
      const { type, value } = prev
      if (type !== 'n' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in withHistoryM, expected to be "n" | "target", but received "${type}"`))
      }
      _internalStates[type] = true
      _internalValues[type] = value

      const { history } = _internalStates
      if (type === 'n') {
        history.length = value
        return TERMINATOR
      }
      if (type === 'target') {
        history.pop()
        history.unshift(value)
        return [...history]
      }
    }
  })())
  pipeAtom(wrappedNumD, withHistoryM)
  pipeAtom(wrappedTargetD, withHistoryM)

  const outputD = Data.empty()
  pipeAtom(withHistoryM, outputD)

  binaryTweenPipeAtom(n, wrapNumM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param n Number
 * @param target Atom
 * @return Atom
 */
export const withStaticHistoryT = curryN(2, (n, target) => {
  if (!isNumber(n)) {
    throw (new TypeError('"n" argument of withStaticHistoryT is expected to be type of "Number".'))
  }
  return withDynamicHistoryT(replayWithLatest(1, Data.of(n)), target)
})

/**
 * Returned atom will emits the previous and current value of target atom as an array.
 *
 * @param target Atom
 * @return Atom
 */
export const pairwiseT = withHistoryT(2)
export const truthyPairwiseT = pipe(pairwiseT, filterT(v => v[0] && v[1]))
