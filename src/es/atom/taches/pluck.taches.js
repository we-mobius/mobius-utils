import { isString, isArray, getByPath } from '../../internal.js'
import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { replayWithLatest } from '../mediators.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * @param selector String | Array | Atom
 * @param target Atom
 * @return atom Data
 */
export const pluckT = curryN(2, (selector, target) => {
  if (isString(selector) || isArray(selector)) {
    return staticPluckT(selector, target)
  } else if (isAtom(selector)) {
    return dynamicPluckT(selector, target)
  } else {
    throw (new TypeError('"selector" argument of pluckT is expected to be type of "String" | "Array" | "Atom".'))
  }
})

/**
 * @param selector Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicPluckT = curryN(2, (selector, target) => {
  if (!isAtom(selector)) {
    throw (new TypeError('"selector" argument of dynamicPluckT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"selector" argument of dynamicPluckT is expected to be type of "Atom".'))
  }

  const wrapSelectorM = Mutation.ofLiftLeft(prev => ({ type: 'selector', value: prev }))
  const wrappedSelectorD = Data.empty()
  pipeAtom(wrapSelectorM, wrappedSelectorD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const pluckM = Mutation.ofLiftLeft((() => {
    const _internalStates = { selector: false, target: false }
    const _internalValues = { selector: undefined, target: undefined }

    return prev => {
      const { type, value } = prev
      if (type !== 'selector' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in pluckM, expected to be "selector" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.selector || !_internalStates.target) {
        return TERMINATOR
      }
      if (type === 'selector') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        return getByPath(_internalValues.selector, _internalValues.target)
      }
    }
  })())
  pipeAtom(wrappedSelectorD, pluckM)
  pipeAtom(wrappedTargetD, pluckM)

  const outputD = Data.empty()
  pipeAtom(pluckM, outputD)

  binaryTweenPipeAtom(selector, wrapSelectorM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param selector String | Array
 * @param target Atom
 * @return atom Data
 */
export const staticPluckT = curryN(2, (selector, target) => {
  if (!isString(selector) && !isArray(selector)) {
    throw (new TypeError('"selector" argument of staticPluckT is expected to be type of "String" | "Array".'))
  }
  return dynamicPluckT(replayWithLatest(1, Data.of(selector)), target)
})
