import { isNumber } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtom } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'
import { replayWithLatest } from '../mediators'

/**
 * @param timer Number | Atom
 * @param target Atom
 * @return atom Data
 */
export const debounceTimeT = curryN(2, (timer, target) => {
  if (isNumber(timer)) {
    return staticDebounceTimeT(timer, target)
  } else if (isAtom(timer)) {
    return dynamicDebounceTimeT(timer, target)
  } else {
    throw (new TypeError('"timer" argument of debounceTimeT is expected to be type of "Number" or "Atom".'))
  }
})

/**
 * the value target will only triggered when timer atom has at least one value
 *
 * @param timer Atom, which value is used as debounce time(in milliseconds)
 * @param target Atom, which value will be debounced with specified time
 * @return atom Data
 */
export const dynamicDebounceTimeT = curryN(2, (timer, target) => {
  if (!isAtom(timer)) {
    throw (new TypeError('"timer" argument of dynamicDebounceTimeT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicDebounceTimeT is expected to be type of "Atom".'))
  }

  const wrapTimerM = Mutation.ofLiftLeft(prev => ({ type: 'timer', value: prev }))
  const wrappedTimerD = Data.empty()
  pipeAtom(wrapTimerM, wrappedTimerD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const debounceM = Mutation.ofLiftLeft((() => {
    // use closure to define private state for mutation's operation
    const _internalStates = { timer: false, target: false, clock: 0 }
    const _internalValues = { timer: undefined, target: undefined }
    // actual mutation operation function
    return prev => {
      const { type, value } = prev
      if (type !== 'timer' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in debounceM, expected to be "timer" | "target", but received "${type}".`))
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
        clearTimeout(_internalStates.clock)
        _internalStates.clock = setTimeout(() => {
          debounceM.triggerTransformation(() => _internalValues.target)
        }, _internalValues.timer)
        return TERMINATOR
      }
    }
  })())
  pipeAtom(wrappedTimerD, debounceM)
  pipeAtom(wrappedTargetD, debounceM)

  const outputD = Data.empty()
  pipeAtom(debounceM, outputD)

  binaryTweenPipeAtom(timer, wrapTimerM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param ms Atom, which will be used as debounce time(in milliseconds)
 * @param target Atom, which value will be debounced with specified time
 * @return atom Data
 */
export const staticDebounceTimeT = curryN(2, (ms, target) => {
  if (!isNumber(ms)) {
    throw (new TypeError('"ms" argument of staticDebounceTimeT is expected to be type of "Number".'))
  }
  return dynamicDebounceTimeT(replayWithLatest(1, Data.of(ms)), target)
})
