import { isFunction } from '../../internal'
import { curryN } from '../../functional'
import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtom } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

/**
 * @param fn Function | Atom
 * @param target Atom
 * @return atom Data
 */
export const mapT = curryN(2, (fn, target) => {
  if (isFunction(fn)) {
    return staticMapT(fn, target)
  } else if (isAtom(fn)) {
    return dynamicMapT(fn, target)
  } else {
    throw (new TypeError('"fn" argument of mapT is expected to be type of "Function" or "Atom".'))
  }
})

/**
 * @param fn Atom
 * @param target Atom
 * @return atom Data
 */
export const dynamicMapT = curryN(2, (fn, target) => {
  if (!isAtom(fn)) {
    throw (new TypeError('"fn" argument of dynamicMapT is expected to be type of "Atom".'))
  }
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of dynamicMapT is expected to be type of "Atom".'))
  }

  const wrapMapM = Mutation.ofLiftLeft(prev => ({ type: 'map', value: prev }))
  const wrappedMapD = Data.empty()
  pipeAtom(wrapMapM, wrappedMapD)
  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const mapM = Mutation.ofLiftLeft((() => {
    const _internalStates = { map: false, target: false, index: -1 }
    const _internalValues = { map: undefined, target: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'map' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in mapM, expected to be "map" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (!_internalStates.map || !_internalStates.target) {
        return TERMINATOR
      }

      if (type === 'map') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1
        return _internalValues.map(_internalValues.target, _internalStates.index)
      }
    }
  })())
  pipeAtom(wrappedMapD, mapM)
  pipeAtom(wrappedTargetD, mapM)

  const outputD = Data.empty()
  pipeAtom(mapM, outputD)

  binaryTweenPipeAtom(fn, wrapMapM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
})

/**
 * @param fn Function
 * @param target Atom
 * @return atom Data
 */
export const staticMapT = curryN(2, (fn, target) => {
  if (!isFunction(fn)) {
    throw (new TypeError('"fn" argument of staticMapT is expected to be type of "Function".'))
  }
  return dynamicMapT(replayWithLatest(1, Data.of(fn)), target)
})
