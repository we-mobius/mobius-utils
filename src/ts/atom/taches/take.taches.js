import { isNumber } from '../../internal.js'
import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { replayWithLatest } from '../mediators.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * @param n Number | Atom
 * @param target Atom
 * @return atom Data
 */
export const takeT = curryN(2, (n, target) => {
  if (isNumber(n)) {
    return staticTakeT(n, target)
  } else if (isAtom(n)) {
    return dynamicTakeT(n, target)
  } else {
    throw (new TypeError('"n" argument of takeT is expected to be type of "Number" or "Atom".'))
  }
})

/**
 * @param n Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicTakeT = curryN(2, (n, target) => {
  if (!isAtom(n)) {
    throw (new TypeError('"n" argument of dynamicTakeT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicTakeT is expected to be type of "Atom".'))
  }

  const wrapNumM = Mutation.ofLiftLeft(prev => ({ type: 'n', value: parseInt(prev) }))
  const wrappedNumD = Data.empty()
  pipeAtom(wrapNumM, wrappedNumD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const takeM = Mutation.ofLiftLeft((() => {
    const _internalStates = { n: false, target: false, taked: 0 }
    const _internalValues = { n: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'n' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received, expected to be "n" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.n || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'n') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        if (_internalStates.taked < _internalStates.n) {
          _internalStates.taked = _internalStates.taked + 1
          return _internalValues.target
        } else {
          return TERMINATOR
        }
      }
    }
  })())
  pipeAtom(wrappedNumD, takeM)
  pipeAtom(wrappedTargetD, takeM)

  const outputD = Data.empty()
  pipeAtom(takeM, outputD)

  binaryTweenPipeAtom(n, wrapNumM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @todo release atom when specified num of value has emited
 *
 * @param n Number
 * @param target Atom
 * @return atom Data
 */
export const staticTakeT = curryN(2, (n, target) => {
  return dynamicTakeT(replayWithLatest(1, Data.of(n)), target)
})
