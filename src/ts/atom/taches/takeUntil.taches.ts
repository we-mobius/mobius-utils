import { curryN } from '../../functional'
import { TERMINATOR } from '../meta'
import { Data, Mutation, isAtom } from '../atom'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param cond Atom
 * @param target Atom
 * @return atom Data
 */
export const takeUntilT = curryN(2, (cond, target) => {
  if (!isAtom(cond)) {
    throw (new TypeError('"cond" argument of takeUntilT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of takeUntilT is expected to be type of "Atom".'))
  }

  const wrapCondM = Mutation.ofLiftLeft(prev => ({ type: 'cond', value: prev }))
  const wrappedCondD = Data.empty()
  pipeAtom(wrapCondM, wrappedCondD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const takeM = Mutation.ofLiftLeft((() => {
    const _internalStates = { cond: false, target: false }
    const _intervalValues = { cond: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'cond' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received, expected to be "cond" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _intervalValues[type] = value
      if (_internalStates.cond) {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        return _intervalValues.target
      }
    }
  })())
  pipeAtom(wrappedCondD, takeM)
  pipeAtom(wrappedTargetD, takeM)

  const outputD = Data.empty()
  pipeAtom(takeM, outputD)

  binaryTweenPipeAtom(cond, wrapCondM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})
