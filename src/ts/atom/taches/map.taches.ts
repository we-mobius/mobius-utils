import { isFunction } from '../../internal/base'
import { curryN } from '../../functional'

import { TERMINATOR, isVacuo } from '../metas'
import { Data, Mutation, isAtomLike } from '../atoms'
import { replayWithLatest } from '../mediators'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type Mapper<T, V> = (tar: T, index: number) => V

/**
 * @see {@link dynamicMapT}, {@link staticMapT}
 */
export const mapT = <T, V>(
  mapper: AtomLikeOfOutput<Mapper<T, V>> | Mapper<T, V>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (isFunction(mapper)) {
    return staticMapT(mapper, target)
  } else if (isAtomLike(mapper)) {
    return dynamicMapT(mapper, target)
  } else {
    throw (new TypeError('"mapper" is expected to be type of "Function" or "AtomLike".'))
  }
}
interface IMapT_ {
  <T, V>(mapper: AtomLikeOfOutput<Mapper<T, V>> | Mapper<T, V>, target: AtomLikeOfOutput<T>): Data<V>
  <T, V>(mapper: AtomLikeOfOutput<Mapper<T, V>> | Mapper<T, V>): (target: AtomLikeOfOutput<T>) => Data<V>
}
/**
 * @see {@link mapT}
 */
export const mapT_: IMapT_ = curryN(2, mapT)

/**
 * @see {@link mapT}
 */
export const dynamicMapT = <T, V>(
  mapper: AtomLikeOfOutput<Mapper<T, V>>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isAtomLike(mapper)) {
    throw (new TypeError('"mapper" is expected to be type of "AtomLike".'))
  }
  if (!isAtomLike(target)) {
    throw (new TypeError('"target" is expected to be type of "AtomLike".'))
  }

  interface WrappedMapper {
    type: 'mapper'
    value: Vacuo | Mapper<T, V>
  }
  const wrapMapM = Mutation.ofLiftLeft<Mapper<T, V>, WrappedMapper>(prev => ({ type: 'mapper', value: prev }))
  const wrappedMapD = Data.empty<WrappedMapper>()
  pipeAtom(wrapMapM, wrappedMapD)

  interface WrappedTarget {
    type: 'target'
    value: Vacuo | T
  }
  const wrapTargetM = Mutation.ofLiftLeft<T, WrappedTarget>(prev => ({ type: 'target', value: prev }))
  const wrappedTargetD = Data.empty<WrappedTarget>()
  pipeAtom(wrapTargetM, wrappedTargetD)

  const mapM = Mutation.ofLiftLeft((() => {
    const _internalStates: {
      mapper: boolean
      target: boolean
      index: number
    } = { mapper: false, target: false, index: -1 }
    const _internalValues: {
      mapper: Mapper<T, V> | undefined
      target: T | undefined
    } = { mapper: undefined, target: undefined }

    return (prev: Vacuo | WrappedMapper | WrappedTarget): V | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { type } = prev

      _internalStates[type] = true
      _internalValues[type] = prev.value as any

      if (!_internalStates.mapper || !_internalStates.target) {
        return TERMINATOR
      }

      if (type === 'mapper') {
        return TERMINATOR
      }
      if (type === 'target') {
        _internalStates.index = _internalStates.index + 1
        return _internalValues.mapper!(_internalValues.target!, _internalStates.index)
      }

      throw (new TypeError('Unexpected "type".'))
    }
  })())
  pipeAtom(wrappedMapD, mapM)
  pipeAtom(wrappedTargetD, mapM)

  const outputD = Data.empty<V>()
  pipeAtom(mapM, outputD)

  binaryTweenPipeAtom(mapper, wrapMapM)
  binaryTweenPipeAtom(target, wrapTargetM)

  return outputD
}
interface IDynamicMapT_ {
  <T, V>(mapper: AtomLikeOfOutput<Mapper<T, V>>, target: AtomLikeOfOutput<T>): Data<V>
  <T, V>(mapper: AtomLikeOfOutput<Mapper<T, V>>): (target: AtomLikeOfOutput<T>) => Data<V>
}
/**
 * @see {@link dynamicMapT}
 */
export const dynamicMapT_: IDynamicMapT_ = curryN(2, dynamicMapT)

/**
 * @see {@link mapT}
 */
export const staticMapT = <T, V>(
  mapper: Mapper<T, V>, target: AtomLikeOfOutput<T>
): Data<V> => {
  if (!isFunction(mapper)) {
    throw (new TypeError('"mapper" is expected to be type of "Function".'))
  }
  return dynamicMapT(replayWithLatest(1, Data.of(mapper)), target)
}
interface IStaticMapT_ {
  <T, V>(mapper: Mapper<T, V>, target: AtomLikeOfOutput<T>): Data<V>
  <T, V>(mapper: Mapper<T, V>): (target: AtomLikeOfOutput<T>) => Data<V>
}
/**
 * @see {@link staticMapT}
 */
export const staticMapT_: IStaticMapT_ = curryN(2, staticMapT)
