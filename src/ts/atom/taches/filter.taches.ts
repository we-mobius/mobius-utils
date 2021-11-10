import { isFunction } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../meta'
import { Mutation, Data, isAtom } from '../atom'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param pred Function | Atom
 * @param target Atom
 * @return atom Data
 */
export const filterT = curryN(2, (pred, target) => {
  if (isFunction(pred)) {
    return staticFilterT(pred, target)
  } else if (isAtom(pred)) {
    return dynamicFilterT(pred, target)
  } else {
    throw (new TypeError('"pred" argument of filterT is expected to be type of "Function" or "Atom".'))
  }
})

/**
 * @param pred Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicFilterT = curryN(2, (pred, target) => {
  if (!isAtom(pred)) {
    throw (new TypeError('"pred" argument of dynamicFilterT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicFilterT is expected to be type of "Atom".'))
  }

  const wrapPredM = Mutation.ofLiftLeft(prev => ({ type: 'pred', value: prev }))
  const wrappedPredD = Data.empty()
  pipeAtom(wrapPredM, wrappedPredD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const filterM = Mutation.ofLiftLeft((() => {
    const _internalStates = { pred: false, target: false, index: -1 }
    const _internalValues = { pred: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'pred' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in filterM, expected to be "pred" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.pred || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'pred') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1
        return _internalValues.pred(_internalValues.target, _internalStates.index) ? _internalValues.target : TERMINATOR
      }
    }
  })())
  pipeAtom(wrappedPredD, filterM)
  pipeAtom(wrappedTargetD, filterM)

  const outputD = Data.empty()
  pipeAtom(filterM, outputD)

  binaryTweenPipeAtom(pred, wrapPredM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param pred Function
 * @param target Atom
 * @return atom Data
 */
export const staticFilterT = curryN(2, (pred, target) => {
  if (!isFunction(pred)) {
    throw (new TypeError('"pred" argument of staticFilterT is expected to be type of "Function".'))
  }
  return dynamicFilterT(replayWithLatest(1, Data.of(pred)), target)
})
