import { curryN } from '../../functional.js'
import { TERMINATOR, isVoid } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { replayWithLatest } from '../mediators.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * Takes a default value and a target atom as argument,
 * emit given default value if value of target atom isVoid.
 *
 * - dynamic version: default value must be an Atom.
 * - static version: default value can be any type of value.
 *
 * @param default Any | Atom
 * @param target Atom
 * @return atom Data
 */
export const defaultToT = curryN(2, (dft, target) => {
  if (isAtom(dft)) {
    return dynamicDefautToT(dft, target)
  } else {
    return staticDefaultToT(dft, target)
  }
})

/**
 * @param default Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicDefautToT = curryN(2, (dft, target) => {
  if (!isAtom(dft)) {
    throw (new TypeError('"dft" argument of dynamicDefautToT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicDefautToT is expected to be type of "Atom".'))
  }

  const wrapDftM = Mutation.ofLiftLeft(prev => ({ type: 'dft', value: prev }))
  const wrappedDftD = Data.empty()
  pipeAtom(wrapDftM, wrappedDftD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const defaultM = Mutation.ofLiftLeft((() => {
    const _internalStates = { dft: false, target: false }
    const _internalValues = { dft: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'dft' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in defaultM, expected to be "dft" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.dft || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'dft') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        return isVoid(_internalValues.target) ? _internalValues.dft : _internalValues.target
      }
    }
  })())
  pipeAtom(wrappedDftD, defaultM)
  pipeAtom(wrappedTargetD, defaultM)

  const outputD = Data.empty()
  pipeAtom(defaultM, outputD)

  binaryTweenPipeAtom(dft, wrapDftM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param default Any
 * @param target Atom
 * @return atom Data
 */
export const staticDefaultToT = curryN(2, (dft, target) => {
  return dynamicDefautToT(replayWithLatest(1, Data.of(dft)), target)
})
