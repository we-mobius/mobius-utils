import { isFunction } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtom } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param pred Function | Atom
 * @param trueTarget Atom
 * @param falseTarget Atom
 * @param target Atom
 * @return atom Data
 */
export const iifT = curryN(4, (pred, trueTarget, falseTarget, target) => {
  if (isFunction(pred)) {
    return staticIifT(pred, trueTarget, falseTarget, target)
  } else if (isAtom(pred)) {
    return dynamicIifT(pred, trueTarget, falseTarget, target)
  } else {
    throw (new TypeError('"pred" argument of iifT is expected to be type of "Function" | "Atom".'))
  }
})

/**
 * @param pred Atom
 * @param trueTarget Atom
 * @param falseTarget Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicIifT = curryN(4, (pred, trueTarget, falseTarget, target) => {
  if (!isAtom(pred)) {
    throw (new TypeError('"pred" argument of dynamicFilterT is expected to be type of "Atom".'))
  }
  if (!isAtom(trueTarget)) {
    throw (new TypeError('"trueTarget" argument of dynamicFilterT is expected to be type of "Atom".'))
  }
  if (!isAtom(falseTarget)) {
    throw (new TypeError('"falseTarget" argument of dynamicFilterT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicFilterT is expected to be type of "Atom".'))
  }

  const wrapPredM = Mutation.ofLiftLeft(prev => ({ type: 'pred', value: prev }))
  const wrappedPredD = Data.empty()
  pipeAtom(wrapPredM, wrappedPredD)
  const wrapTrueTargetM = Mutation.ofLiftLeft(prev => ({ type: 'trueTarget', value: prev }))
  const wrappedTrueTargetD = Data.empty()
  pipeAtom(wrapTrueTargetM, wrappedTrueTargetD)
  const wrapFalseTargetM = Mutation.ofLiftLeft(prev => ({ type: 'falseTarget', value: prev }))
  const wrappedFalseTargetD = Data.empty()
  pipeAtom(wrapFalseTargetM, wrappedFalseTargetD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const filterM = Mutation.ofLiftLeft((() => {
    const _internalStates = { pred: false, trueTarget: false, falseTarget: false, target: false, index: -1 }
    const _internalValues = { pred: undefined, trueTarget: undefined, falseTarget: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'pred' && type !== 'trueTarget' && type !== 'falseTarget' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in filterM, expected to be "pred" | "trueTarget" | "falseTarget" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.pred || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'pred') {
        return TERMINATOR
      }
      if (type === 'trueTarget' || type === 'falseTarget') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1
        const predRes = _internalValues.pred(_internalValues.target, _internalStates.index)
        if (predRes) {
          return _internalStates.trueTarget ? _internalValues.trueTarget : TERMINATOR
        } else {
          return _internalStates.falseTarget ? _internalValues.falseTarget : TERMINATOR
        }
      }
    }
  })())
  pipeAtom(wrappedPredD, filterM)
  pipeAtom(wrappedTrueTargetD, filterM)
  pipeAtom(wrappedFalseTargetD, filterM)

  const outputD = Data.empty()
  pipeAtom(filterM, outputD)

  binaryTweenPipeAtom(pred, wrapPredM)
  binaryTweenPipeAtom(trueTarget, wrapTrueTargetM)
  binaryTweenPipeAtom(falseTarget, wrapFalseTargetM)

  return outputD
})

/**
 * @param pred Atom
 * @param trueTarget Atom
 * @param falseTarget Atom
 * @param target Atom
 * @return atom Data
 */
export const staticIifT = curryN(4, (pred, trueTarget, falseTarget, target) => {
  if (!isFunction(pred)) {
    throw (new TypeError('"pred" argument of staticIifT is expected to be type of "Function".'))
  }
  return dynamicIifT(replayWithLatest(1, Data.of(pred)), trueTarget, falseTarget, target)
})
