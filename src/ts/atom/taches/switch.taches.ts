import { curryN } from '../../functional'
import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtom } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

const switchTacheFactory = mutationFactory => {
  return curryN(2, (to, from) => {
    if (!isAtom(to)) {
      throw (new TypeError('"to" argument of switchT is expected to be type of "Atom".'))
    }
    if (!isAtom(from)) {
      throw (new TypeError('"from" argument of switchT is expected to be type of "Atom".'))
    }

    const wrapToM = Mutation.ofLiftLeft(prev => ({ type: 'to', value: prev }))
    const wrappedToD = Data.empty()
    pipeAtom(wrapToM, wrappedToD)
    const wrapFromM = Mutation.ofLiftLeft(prev => ({ type: 'from', value: prev }))
    const wrappedFromD = Data.empty()
    pipeAtom(wrapFromM, wrappedFromD)

    // const switchM = Mutation.ofLiftLeft(operation)
    const switchM = mutationFactory()
    pipeAtom(wrappedToD, switchM)
    pipeAtom(wrappedFromD, switchM)

    const outputD = Data.empty()
    pipeAtom(switchM, outputD)

    binaryTweenPipeAtom(to, wrapToM)
    binaryTweenPipeAtom(from, wrapFromM)

    return outputD
  })
}

/**
 * @param to Atom | Any
 * @param from Atom
 * @return atom Data
 */
export const switchT = curryN(2, (to, from) => {
  if (isAtom(to)) {
    return dynamicSwitchT(to, from)
  } else {
    return staticSwitchT(to, from)
  }
})

/**
 * switch Tache will emits a "to" value when "from" value comes.
 *
 * If there is not "to" value to emit when "from" value comes,
 * it will emit a TERMINATOR which will stop the stream.
 *
 * @param to Atom
 * @param from Atom
 * @return atom Data
 */
export const dynamicSwitchT = switchTacheFactory(() => {
  return Mutation.ofLiftLeft((() => {
    const _internalStates = { from: false, to: false }
    const _internalValues = { from: undefined, to: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'from' && type !== 'to') {
        throw (new TypeError(`Unexpected type of wrapped Data received in switchM, expected to be "from" | "to", but received "${type}"`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.from || !_internalStates.to) {
        return TERMINATOR
      }
      if (type === 'to') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'from') {
        return _internalValues.to
      }
    }
  })())
})

/**
 * @param to Any
 * @param from Atom
 * @return atom Data
 */
export const staticSwitchT = curryN(2, (to, from) => {
  return dynamicSwitchT(replayWithLatest(1, Data.of(to)), from)
})

/**
 * promiseSwitch Tache will emits a "to" value when "from" value comes.
 *
 * If there is no "to" value to emit when "from" value comes,
 * it will make a promise that to emit "to" value when it comes sooner.
 *
 * @param to Atom
 * @param from Atom
 * @return atom Data
 */
export const promiseSwitchT = switchTacheFactory(() => {
  return Mutation.ofLiftLeft((() => {
    const _internalStates = { from: false, to: false, promise: false }
    const _internalValues = { from: undefined, to: undefined }
    return (prev, _, mutation) => {
      const { type, value } = prev
      if (type !== 'from' && type !== 'to') {
        throw (new TypeError(`Unexpected type of wrapped Data received in switchM, expected to be "from" | "to", but received "${type}"`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (type === 'to') {
        if (_internalStates.promise) {
          mutation.triggerTransformation(() => _internalValues.to)
          _internalStates.promise = false
        }
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'from') {
        if (_internalStates.to) {
          return _internalValues.to
        } else {
          _internalStates.promise = true
          return TERMINATOR
        }
      }
    }
  })())
})
