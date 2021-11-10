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
export const distinctEverT = curryN(2, (transform, target) => {
  if (isFunction(transform)) {
    return staticDistinctEverT(transform, target)
  } else if (isAtom(transform)) {
    return dynamicDistinctEverT(transform, target)
  } else {
    throw (new TypeError('"transform" argument of distinctEverT is expected to be type of "Number" or "Atom".'))
  }
})

/**
 * @param transform Atom, atom of transform Funtion which will
 *                  take a value as input and return a value as distinct compare unit
 * @param target Atom
 * @return atom Data
 */
export const dynamicDistinctEverT = curryN(2, (transform, target) => {
  if (!isAtom(transform)) {
    throw (new TypeError('"transform" argument of dynamicDistinctEverT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicDistinctEverT is expected to be type of "Atom".'))
  }

  const wrapTransformM = Mutation.ofLiftLeft(prev => ({ type: 'transform', value: prev }))
  const wrappedTransformD = Data.empty()
  pipeAtom(wrapTransformM, wrappedTransformD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const distinctM = Mutation.ofLiftLeft((() => {
    const _internalStates = { transform: false, target: false, history: [] }
    const _internalValues = { transform: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'transform' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in distinctM, expected to be "transform" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.transform || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'transform') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        const transformed = _internalValues.transform(_internalValues.target)
        const history = _internalStates.history
        if (history.includes(transformed)) {
          return TERMINATOR
        } else {
          history.push(transformed)
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
export const staticDistinctEverT = curryN(2, (transform, target) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of staticDistinctEverT is expected to be type of "Function".'))
  }
  return dynamicDistinctEverT(replayWithLatest(1, Data.of(transform)), target)
})

/**
 * @param target Atom
 * @return atom Data
 */
export const asIsDistinctEverT = distinctEverT(v => v)
