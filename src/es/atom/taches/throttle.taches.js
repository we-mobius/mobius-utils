import { isNumber } from '../../internal.js'
import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'
import { replayWithLatest } from '../mediators.js'

/**
 * @param timer Number | Atom
 * @param target Atom
 * @return atom Data
 */
export const throttleTimeT = curryN(2, (timer, target) => {
  if (isNumber(timer)) {
    return staticThrottleTimeT(timer, target)
  } else if (isAtom(timer)) {
    return dynamicThrottleTimeT(timer, target)
  } else {
    throw (new TypeError('"timer" argument of throttleTimeT is expected to be type of "Number" or "Atom".'))
  }
})

/**
 * the value target will only triggered when timer atom has at least one value
 *
 * @param timer Atom, which value is used as throttle time(in milliseconds)
 * @param target Atom, which value will be throttled with specified time
 * @return atom Data
 */
export const dynamicThrottleTimeT = curryN(2, (timer, target) => {
  if (!isAtom(timer)) {
    throw (new TypeError('"timer" argument of dynamicThrottleTimeT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicThrottleTimeT is expected to be type of "Atom".'))
  }

  const wrapTimerM = Mutation.ofLiftLeft(prev => ({ type: 'timer', value: prev }))
  const wrappedTimerD = Data.empty()
  pipeAtom(wrapTimerM, wrappedTimerD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const throttleM = Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    const _internalStates = { timer: false, target: false, clock: 0, canEmit: true }
    const _internalValues = { timer: undefined, target: undefined }
    // actual mutation operation function
    return prev => {
      const { type, value } = prev
      if (type !== 'timer' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in throttleM, expected to be "timer" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.timer || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'timer') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        if (_internalStates.canEmit) {
          _internalStates.canEmit = false
          _internalStates.clock = setTimeout(() => {
            clearTimeout(_internalStates.clock)
            _internalStates.canEmit = true
          }, _internalValues.timer)
          return _internalValues.target
        } else {
          return TERMINATOR
        }
      }
    }
  })())
  pipeAtom(wrappedTimerD, throttleM)
  pipeAtom(wrappedTargetD, throttleM)

  const outputD = Data.empty()
  pipeAtom(throttleM, outputD)

  binaryTweenPipeAtom(timer, wrapTimerM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param ms Atom, which will be used as throttle time(in milliseconds)
 * @param target Atom, which value will be throttled with specified time
 * @return atom Data
 */
export const staticThrottleTimeT = curryN(2, (ms, target) => {
  if (!isNumber(ms)) {
    throw (new TypeError('"ms" argument of staticThrottleTimeT is expected to be type of "Number".'))
  }
  return dynamicThrottleTimeT(replayWithLatest(1, Data.of(ms)), target)
})
