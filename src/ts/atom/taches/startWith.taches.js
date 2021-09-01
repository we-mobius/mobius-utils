import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { replayWithLatest } from '../mediators.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

export const startWithT = curryN(2, (start, target) => {
  if (isAtom(start)) {
    return dynamicStartWithT(start, target)
  } else {
    return staticStartWithT(start, target)
  }
})

/**
 * @param start Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicStartWithT = curryN(2, (start, target) => {
  if (!isAtom(start)) {
    throw (new TypeError('"start" argument of dynamicStartWithT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicStartWithT is expected to be type of "Atom".'))
  }

  start = replayWithLatest(1, start)

  const wrapStartM = Mutation.ofLiftLeft(prev => ({ type: 'start', value: prev }))
  const wrappedStartD = Data.empty()
  pipeAtom(wrapStartM, wrappedStartD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const startM = Mutation.ofLiftLeft((() => {
    const _internalStates = { start: false, target: false, startExpired: false }
    const _internalValues = { start: undefined, target: undefined, targetQueue: [] }
    return (prev, _, mutation) => {
      const { type, value } = prev
      if (type !== 'start' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in startM, expected to be "start" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value

      if (type === 'target') {
        if (_internalStates.startExpired) {
          return _internalValues.target
        } else {
          _internalValues.targetQueue.push(value)
          return TERMINATOR
        }
      }
      // redundant conditional judgement
      if (type === 'start' && _internalStates.startExpired) {
        return TERMINATOR
      }
      if (type === 'start' && !_internalStates.startExpired) {
        _internalStates.startExpired = true
        _internalValues.targetQueue.unshift(value)
        _internalValues.targetQueue.forEach(target => {
          mutation.triggerOperation(() => target)
        })
        _internalValues.targetQueue.length = 0
        return TERMINATOR
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
export const staticStartWithT = curryN(2, (start, target) => {
  return dynamicStartWithT(replayWithLatest(1, Data.of(start)), target)
})
