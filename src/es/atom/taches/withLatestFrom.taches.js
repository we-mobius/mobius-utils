import { curryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'

const withLatestFromTacheFactory = mutationFactory => {
  return curryN(2, (target, source) => {
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

    const withLatestFromM = mutationFactory()
    pipeAtom(wrappedTargetD, withLatestFromM)
    pipeAtom(wrappedSourceD, withLatestFromM)

    const outputD = Data.empty()
    pipeAtom(withLatestFromM, outputD)

    binaryTweenPipeAtom(target, wrapTargetM)
    binaryTweenPipeAtom(source, wrapSourceM)

    return outputD
  })
}

/**
 * @param target Atom
 * @param source Atom
 * @return atom Data
 */
export const withLatestFromT = withLatestFromTacheFactory(() => {
  return Mutation.ofLiftLeft((() => {
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
})

/**
 * @param target Atom
 * @param source Atom
 * @return atom Data
 */
export const promiseWithLatestFromT = withLatestFromTacheFactory(() => {
  return Mutation.ofLiftLeft((() => {
    const _internalStates = { target: false, source: false, promised: [] }
    const _internalValues = { target: undefined, source: undefined }
    return (prev, _, mutation) => {
      const { type, value } = prev
      if (type !== 'source' && type !== 'target') {
        throw (new TypeError(`Unexpected type of wrapped Data received in withLatestFromM, expected to be "source" | "target", but received "${type}".`))
      }
      _internalStates[type] = true
      _internalValues[type] = value
      if (type === 'target') {
        const promised = [..._internalStates.promised]
        if (promised.length === 0) {
          return TERMINATOR
        } else {
          promised.forEach(val => {
            mutation.triggerOperation(() => [val, _internalValues.target])
          })
          _internalStates.promised = []
          return TERMINATOR
        }
      }
      // redundant conditional judgement
      if (type === 'source') {
        if (_internalStates.target) {
          return [_internalValues.source, _internalValues.target]
        } else {
          _internalStates.promised.push(_internalValues.source)
          return TERMINATOR
        }
      }
    }
  })())
})
