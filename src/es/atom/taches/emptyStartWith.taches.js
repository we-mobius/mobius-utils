import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../../atom.js'
import { replayWithLatest } from '../mediators.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

export const emptyStartWithT = curryN(2, (start, target) => {
  if (isAtom(start)) {
    return dynamicEmptyStartWithT(start, target)
  } else {
    return staticEmptyStartWithT(start, target)
  }
})

/**
 * @param start Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicEmptyStartWithT = curryN(2, (start, target) => {
  if (!isAtom(start)) {
    throw (new TypeError('"start" argument of dynamicEmptyStartWithT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicEmptyStartWithT is expected to be type of "Atom".'))
  }

  start = replayWithLatest(1, start)
  target = replayWithLatest(1, target)

  const wrapStartM = Mutation.ofLiftLeft(prev => ({ type: 'start', value: prev }))
  const wrappedStartD = Data.empty()
  pipeAtom(wrapStartM, wrappedStartD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const startM = Mutation.ofLiftLeft((() => {
    const _internalStates = { start: false, target: false, startExpired: false }
    const _internalValues = { start: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'start' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in startM, expected to be "start" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (type === 'target') {
        return _internalValues.target
      }
      // redundant conditional judgement
      if (type === 'start' && _internalStates.startExpired) {
        return TERMINATOR
      }
      if (type === 'start' && !_internalStates.startExpired) {
        _internalStates.startExpired = true
        return _internalStates.target ? TERMINATOR : _internalValues.start
      }
    }
  })())
  pipeAtom(wrappedStartD, startM)
  pipeAtom(wrappedTargetD, startM)

  const outputD = Data.empty()
  pipeAtom(startM, outputD)

  binaryTweenPipeAtom(start, wrapStartM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param start Any
 * @param target Atom
 * @return atom Data
 */
export const staticEmptyStartWithT = curryN(2, (start, target) => {
  return dynamicEmptyStartWithT(replayWithLatest(1, Data.of(start)), target)
})
