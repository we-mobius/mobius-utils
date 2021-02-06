import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

/**
 * @param target Atom
 * @param source Atom
 * @return atom Data
 */
export const withLatestFromT = curryN(2, (target, source) => {
  if (!isAtom(target)) {
    throw (new TypeError('"target" argument of withLatestFromT is expected to be type of "Mutation" or "Data".'))
  }
  if (!isAtom(source)) {
    throw (new TypeError('"source" argument of withLatestFromT is expected to be type of "Mutation" or "Data".'))
  }

  const wrapTargetM = Mutation.ofLiftLeft(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty()
  pipeAtom(wrapTargetM, wrappedTargetD)
  const wrapSourceM = Mutation.ofLiftLeft(prev => ({ type: 'source', value: prev }))
  const wrappedSourceD = Data.empty()
  pipeAtom(wrapSourceM, wrappedSourceD)

  const withLatestFromM = Mutation.ofLiftLeft((() => {
    const _internalStates = { target: false, source: false }
    const _internalValues = { target: undefined, source: undefined }
    return prev => {
      const { type, value } = prev
      if (type !== 'source' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in withLatestFromM, expected to be "source" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (type === 'target') {
        return TERMINATOR
      }
      // redundant conditional judgement
      if (type === 'source') {
        return _internalStates.target ? [_internalValues.source, _internalValues.target] : [_internalValues.source]
      }
    }
  })())
  pipeAtom(wrappedTargetD, withLatestFromM)
  pipeAtom(wrappedSourceD, withLatestFromM)

  const outputD = Data.empty()
  pipeAtom(withLatestFromM, outputD)

  binaryTweenPipeAtom(target, wrapTargetM)
  binaryTweenPipeAtom(source, wrapSourceM)

  return outputD
})
