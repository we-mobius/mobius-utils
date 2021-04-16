import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { replayWithLatest } from '../mediators.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * @param start Any
 * @param target Atom
 * @return atom Atom
 */
export const startWithT = curryN(2, (start, target) => {
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of startWithT is expected to be type of "Atom".'))
  }

  const startRD = replayWithLatest(1, Data.of({ type: 'start', value: start }))
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
        if (_internalStates.startExpired) {
          return _internalValues.target
        } else {
          return TERMINATOR
        }
      }
      // redundant conditional judgement
      if (type === 'start') {
        startRD.release()
      }
      if (type === 'start' && _internalStates.startExpired) {
        return TERMINATOR
      }
      if (type === 'start' && !_internalStates.startExpired) {
        _internalStates.startExpired = true
        return _internalStates.target ? TERMINATOR : _internalValues.start
      }
    }
  })())
  pipeAtom(wrappedTargetD, startM)

  const outputD = Data.empty()
  pipeAtom(startM, outputD)

  pipeAtom(startRD, startM)
  binaryTweenPipeAtom(replayWithLatest(1, target), wrapTargetM)

  return outputD
})
