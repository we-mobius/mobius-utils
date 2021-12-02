import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

interface WrappedTarget<T> {
  type: 'target'
  value: Vacuo | T
}
interface WrappedSource<S> {
  type: 'source'
  value: Vacuo | S
}

const withLatestFromTacheFactory = <T, S>(
  mutationFactory: <iT, iS>() => Mutation<WrappedTarget<iT> | WrappedSource<iS>, [iS, iT | undefined] | Terminator>
) => {
  return (target: AtomLikeOfOutput<T>, source: AtomLikeOfOutput<S>): Data<[S, T | undefined]> => {
    if (!isAtomLike(target)) {
      throw (new TypeError('"target" is expected to be type of "AtomLike".'))
    }
    if (!isAtomLike(source)) {
      throw (new TypeError('"source" is expected to be type of "AtomLike".'))
    }

    const wrapTargetM = Mutation.ofLiftLeft<T, WrappedTarget<T>>(prev => ({ type: 'target', value: prev }))
    const wrappedTargetD = Data.empty<WrappedTarget<T>>()
    pipeAtom(wrapTargetM, wrappedTargetD)

    const wrapSourceM = Mutation.ofLiftLeft<S, WrappedSource<S>>(prev => ({ type: 'source', value: prev }))
    const wrappedSourceD = Data.empty<WrappedSource<S>>()
    pipeAtom(wrapSourceM, wrappedSourceD)

    const withLatestFromM = mutationFactory<T, S>()
    pipeAtom(wrappedTargetD, withLatestFromM)
    pipeAtom(wrappedSourceD, withLatestFromM)

    const outputD = Data.empty<[S, T | undefined]>()
    pipeAtom(withLatestFromM, outputD)

    binaryTweenPipeAtom(target, wrapTargetM)
    binaryTweenPipeAtom(source, wrapSourceM)

    return outputD
  }
}

/**
 * @see {@link promiseWithLatestFromT}
 */
export const withLatestFromT: <T, S>(target: AtomLikeOfOutput<T>, source: AtomLikeOfOutput<S>) => Data<[S, T | undefined]> =
withLatestFromTacheFactory(<T, S>(): Mutation<WrappedTarget<T> | WrappedSource<S>, [S, T | undefined] | Terminator> => {
  return Mutation.ofLiftLeft((() => {
    const _internalStates: {
      target: boolean
      source: boolean
    } = { target: false, source: false }
    const _internalValues: {
      target: T | undefined
      source: S | undefined
    } = { target: undefined, source: undefined }

    return (prev: Vacuo | WrappedTarget<T> | WrappedSource<S>): [S, T | undefined] | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (type === 'target') {
        return TERMINATOR
      }

      if (type === 'source') {
        return [_internalValues.source!, _internalValues.target]
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
})
interface IWithLatestFromT_ {
  <T, S>(target: AtomLikeOfOutput<T>, source: AtomLikeOfOutput<S>): Data<[S, T | undefined]>
  <T, S>(target: AtomLikeOfOutput<T>): (source: AtomLikeOfOutput<S>) => Data<[S, T | undefined]>
}
/**
 * @see {@link withLatestFromT}
 */
export const withLatestFromT_: IWithLatestFromT_ = curryN(2, withLatestFromT)

/**
 * @see {@link withLatestFromT}
 */
export const promiseWithLatestFromT: <T, S>(target: AtomLikeOfOutput<T>, source: AtomLikeOfOutput<S>) => Data<[S, T | undefined]> =
withLatestFromTacheFactory(<T, S>(): Mutation<WrappedTarget<T> | WrappedSource<S>, [S, T | undefined] | Terminator> => {
  interface PrivateData {
    type: symbol
    value: [S, T | undefined]
  }
  const privateDataType = Symbol('privateData')

  const withLatestFromM: Mutation<WrappedTarget<T> | WrappedSource<S> | PrivateData, [S, T | undefined] | Terminator> =
  Mutation.ofLiftLeft((() => {
    const _internalStates: {
      target: boolean
      source: boolean
      promised: S[]
    } = { target: false, source: false, promised: [] }
    const _internalValues: {
      target: T | undefined
      source: S | undefined
    } = { target: undefined, source: undefined }

    return (
      prev: Vacuo | WrappedTarget<T> | WrappedSource<S> | PrivateData, _: any, mutation?: typeof withLatestFromM
    ): [S, T | undefined] | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      if (type === 'target' || type === 'source') {
        _internalStates[type] = true
        _internalValues[type] = prev.value as any
      }

      if (type === privateDataType) {
        return prev.value
      }

      if (type === 'target') {
        const promised = [..._internalStates.promised]
        if (promised.length === 0) {
          return TERMINATOR
        } else {
          promised.forEach(val => {
            // mutation.triggerTransformation(() => [val, _internalValues.target])
            mutation!.mutate(
              Data.of<WrappedTarget<T> | WrappedSource<S> | PrivateData>({ type: privateDataType, value: [val, _internalValues.target] })
            )
          })
          _internalStates.promised = []
          return TERMINATOR
        }
      }

      if (type === 'source') {
        if (_internalStates.target) {
          return [_internalValues.source!, _internalValues.target]
        } else {
          _internalStates.promised.push(_internalValues.source!)
          return TERMINATOR
        }
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())

  return withLatestFromM as Mutation<WrappedTarget<T> | WrappedSource<S>, [S, T | undefined] | Terminator>
})
interface IPromiseWithLatestFromT_ {
  <T, S>(target: AtomLikeOfOutput<T>, source: AtomLikeOfOutput<S>): Data<[S, T | undefined]>
  <T, S>(target: AtomLikeOfOutput<T>): (source: AtomLikeOfOutput<S>) => Data<[S, T | undefined]>
}
/**
 * @see {@link promiseWithLatestFromT}
 */
export const promiseWithLatestFromT_: IPromiseWithLatestFromT_ = curryN(2, promiseWithLatestFromT)
