import { isFunction } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../meta'
import { Data, Mutation, isAtom } from '../atom'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param transform Function | Atom
 * @param target Atom
 * @return atom Data
 */
export const distinctPreviousT = curryN(2, (transform, target) => {
  if (isFunction(transform)) {
    return staticDistinctPreviousT(transform, target)
  } else if (isAtom(transform)) {
    return dynamicDistinctPreviousT(transform, target)
  } else {
    throw (new TypeError('"transform" argument of distinctPreviousT is expected to be type of "Number" or "Atom".'))
  }
})

/**
 * @param transform Atom, atom of transform Funtion which will
 *                  take a value as input and return a value as distinct compare unit
 * @param target Atom
 * @return atom Data
 */
export const dynamicDistinctPreviousT = curryN(2, (transform, target) => {
  if (!isAtom(transform)) {
    throw (new TypeError('"transform" argument of dynamicDistinctPreviousT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicDistinctPreviousT is expected to be type of "Atom".'))
  }

  const wrapTransformM = Mutation.ofLiftLeft(prev => ({ type: 'transform', value: prev }))
  const wrappedTransformD = Data.empty()
  pipeAtom(wrapTransformM, wrappedTransformD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const distinctM = Mutation.ofLiftLeft((() => {
    const _internalStates = { transform: false, target: false, previous: undefined }
    const _internalValues = { transform: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'transform' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received, expected to be "transform" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.transform || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'transform') {
        // change of transform will not trigger target value emittion
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        const prevTransformed = _internalValues.transform(_internalStates.previous)
        const transformed = _internalValues.transform(_internalValues.target)
        if (prevTransformed === transformed) {
          return TERMINATOR
        } else {
          _internalStates.previous = _internalValues.target
          return _internalValues.target
        }
      }
    }
  })())
  pipeAtom(wrappedTargetD, distinctM)
  pipeAtom(wrappedTransformD, distinctM)

  const outputD = Data.empty()
  pipeAtom(distinctM, outputD)

  binaryTweenPipeAtom(transform, wrapTransformM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param transform Function
 * @param target Atom
 * @return atom Data
 */
export const staticDistinctPreviousT = curryN(2, (transform, target) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of staticDistinctPreviousT is expected to be type of "Function".'))
  }
  return dynamicDistinctPreviousT(replayWithLatest(1, Data.of(transform)), target)
})

/**
 * @param target Atom
 * @return atom Data
 */
export const asIsDistinctPreviousT = distinctPreviousT(v => v)
