import { isArray, isObject } from '../../internal/base'

import { TERMINATOR, isTerminator, isVacuo } from '../metas'
import { Mutation, Data, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'
import type { IsTuple } from '../../@types'

type StringRecord<V> = Record<string, V>

interface ICombineLatestT {
  <V extends Array<AtomLikeOfOutput<any>>>(
    ...sources: [[...V]]
  ): Data<ExtractAtomValueInArray<V>>
  <V extends Array<AtomLikeOfOutput<any>>>(
    ...sources: [...V]
  ): Data<ExtractAtomValueInArray<V>>
  <V extends StringRecord<AtomLikeOfOutput<any>>>(
    sources: V
  ): Data<ExtractAtomValueInObject<V>>
}

/**
 * @see {@link arrayCombineLatestT} {@link objectCombineLatestT}
 */
export const combineLatestT: ICombineLatestT = (...sources: any[]): any => {
  if (isAtomLike(sources[0]) || isArray(sources[0])) {
    return arrayCombineLatestT(...sources)
  } else if (isObject(sources[0])) {
    return objectCombineLatestT(sources[0])
  } else {
    throw (new TypeError('"sources" are expected to be type of AtomLike | AtomLike[] | Record<string, AtomLike>.'))
  }
}

type ExtractAtomValueInArray<V> = IsTuple<V> extends false ? (
  V extends Array<infer I> ? I extends AtomLikeOfOutput<any> ? I['meta'] : V : V
) :
  V extends [] ? [] :
      (
        V extends [infer A, ...infer B] ?
            (
              B extends [] ?
                  [A extends AtomLikeOfOutput<infer I> ? I : never] :
                  [A extends AtomLikeOfOutput<infer I> ? I : never, ...ExtractAtomValueInArray<B>]
            )
          : V
      )

export interface IArrayCombineLatestT {
  <V extends Array<AtomLikeOfOutput<any>>>(
    ...sources: [[...V]]
  ): Data<ExtractAtomValueInArray<V>>
  <V extends Array<AtomLikeOfOutput<any>>>(
    ...sources: [...V]
  ): Data<ExtractAtomValueInArray<V>>
}
/**
 * @see {@link combineLatestT}
 */
export const arrayCombineLatestT: IArrayCombineLatestT = <V extends Array<AtomLikeOfOutput<any>>>(
  ...sources: [...V] | [[...V]]
): Data<ExtractAtomValueInArray<V>> => {
  let preparedSources: Array<AtomLikeOfOutput<any>> = []

  if (sources.length === 1 && isArray(sources[0])) {
    preparedSources = sources[0]
  } else {
    preparedSources = sources as Array<AtomLikeOfOutput<any>>
  }

  const inputAtoms = preparedSources.map(source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"sources" are expected to be type of "AtomLike".'))
    }
    return source
  })

  const length = preparedSources.length

  interface WrappedData {
    id: number
    value: Vacuo | any
  }
  const wrapMutations = Array.from({ length }).map((val, idx) =>
    Mutation.ofLiftLeft<any, WrappedData>((prev) => ({ id: idx, value: prev }))
  )

  const wrappedDatas = Array.from({ length }).map(() => Data.empty<WrappedData>())

  const combineM = Mutation.ofLiftLeft((() => {
    const _internalStates = Array.from<boolean>({ length })
    const _internalValues = Array.from<any>({ length })

    return (prev: WrappedData | Vacuo): any[] | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { id, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[id] = true
      _internalValues[id] = value

      if (_internalStates.every(val => val)) {
        return [..._internalValues]
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty<ExtractAtomValueInArray<V>>()

  pipeAtom(combineM, outputD)
  wrappedDatas.forEach(data => {
    pipeAtom(data, combineM)
  })
  wrapMutations.forEach((wrapMutation, idx) => {
    pipeAtom(wrapMutation, wrappedDatas[idx])
  })
  inputAtoms.forEach((atom, idx) => {
    binaryTweenPipeAtom(atom, wrapMutations[idx])
  })

  return outputD
}

type ExtractAtomValueInObject<T> = {
  [P in keyof T]: T[P] extends AtomLikeOfOutput<infer V> ? V : never
}
/**
 * @see {@link combineLatestT}
 */
export const objectCombineLatestT = <V extends StringRecord<AtomLikeOfOutput<any>>>(
  sources: V
): Data<ExtractAtomValueInObject<V>> => {
  const inputAtoms = Object.entries(sources).reduce<StringRecord<AtomLikeOfOutput<any>>>(
    (acc, [key, atom]) => {
      if (!isAtomLike(atom)) {
        throw (new TypeError('"sources" are expected to be type of "AtomLike".'))
      }
      acc[key] = atom
      return acc
    }, {}
  )

  interface WrappedData {
    key: string
    value: Vacuo | any
  }
  const wrapMutations = Object.entries(sources).reduce<StringRecord<Mutation<any, any>>>(
    (acc, [key]) => {
      acc[key] = Mutation.ofLiftLeft((prev) => ({ key: key, value: prev }))
      return acc
    }, {}
  )

  const wrappedDatas = Object.entries(sources).reduce<StringRecord<Data<any>>>(
    (acc, [key]) => {
      acc[key] = Data.empty()
      return acc
    }, {}
  )

  const combineM = Mutation.ofLiftLeft((() => {
    const _internalStates = Object.keys(sources).reduce<StringRecord<boolean>>((acc, key) => {
      acc[key] = false
      return acc
    }, {})
    const _internalValues = Object.keys(sources).reduce<StringRecord<any>>(
      (acc, key) => {
        acc[key] = undefined
        return acc
      }, {}
    )

    return (prev: Vacuo | WrappedData): StringRecord<any> | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { key, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[key] = true
      _internalValues[key] = value

      if (Object.values(_internalStates).every(val => val)) {
        return { ..._internalValues }
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty<ExtractAtomValueInObject<V>>()

  pipeAtom(combineM, outputD)
  Object.values(wrappedDatas).forEach(data => {
    pipeAtom(data, combineM)
  })
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    pipeAtom(wrapMutation, wrappedDatas[key])
  })
  Object.entries(inputAtoms).forEach(([key, atom]) => {
    binaryTweenPipeAtom(atom, wrapMutations[key])
  })

  return outputD
}
