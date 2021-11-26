import { isNumber } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtom } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param n Number | Atom
 * @param target Atom
 * @return atom Data
 */
export const skipT = curryN(2, (n, target) => {
  if (isNumber(n)) {
    return staticSkipT(n, target)
  } else if (isAtom(n)) {
    return dynamicSkipT(n, target)
  } else {
    throw (new TypeError('"n" argument of skipT is expected to be type of "Number" or "Atom".'))
  }
})

/**
 * @param n Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicSkipT = curryN(2, (n, target) => {
  if (!isAtom(n)) {
    throw (new TypeError('"n" argument of dynamicSkipT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicSkipT is expected to be type of "Atom".'))
  }

  const wrapNumM = Mutation.ofLiftLeft(prev => ({ type: 'n', value: prev }))
  const wrappedNumD = Data.empty()
  pipeAtom(wrapNumM, wrappedNumD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const skipM = Mutation.ofLiftLeft((() => {
    const _internalStates = { n: false, target: false, index: -1, skiped: 0 }
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
        if (_internalStates.skiped < _internalStates.n) {
          _internalStates.skiped = _internalStates.skiped + 1
          return TERMINATOR
        } else {
          return _internalValues.target
        }
      }
    }
  })())
  pipeAtom(wrappedNumD, skipM)
  pipeAtom(wrappedTargetD, skipM)

  const outputD = Data.empty()
  pipeAtom(skipM, outputD)

  binaryTweenPipeAtom(n, wrapNumM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param n Number
 * @param target Atom
 * @return atom Data
 */
export const staticSkipT = curryN(2, (n, target) => {
  if (!isAtom(n)) {
    throw (new TypeError('"n" argument of staticSkipT is expected to be type of "Number".'))
  }
  return dynamicSkipT(replayWithLatest(1, Data.of(n)), target)
})
