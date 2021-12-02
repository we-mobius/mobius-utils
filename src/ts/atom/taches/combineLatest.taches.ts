import { isArray, isObject } from '../../internal/base'

import { TERMINATOR, isTerminator, isVacuo } from '../metas'
import { Mutation, Data, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type StringRecord<V> = Record<string, V>

interface ICombineLatestT {
  <V>(
    ...sources: Array<AtomLikeOfOutput<V>> | [Array<AtomLikeOfOutput<V>>]
  ): Data<V[]>
  <V>(
    source: StringRecord<AtomLikeOfOutput<V>>
  ): Data<StringRecord<V>>
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

/**
 * @see {@link combineLatestT}
 */
export const arrayCombineLatestT = <V>(
  ...sources: Array<AtomLikeOfOutput<V>> | [Array<AtomLikeOfOutput<V>>]
): Data<V[]> => {
  let preparedSources: Array<AtomLikeOfOutput<V>> = []

  if (sources.length === 1 && isArray(sources[0])) {
    preparedSources = sources[0]
  } else {
    preparedSources = sources as Array<AtomLikeOfOutput<V>>
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
    value: Vacuo | V
  }
  const wrapMutations = Array.from({ length }).map((val, idx) =>
    Mutation.ofLiftLeft<V, WrappedData>((prev) => ({ id: idx, value: prev }))
  )

  const wrappedDatas = Array.from({ length }).map(() => Data.empty<WrappedData>())

  const combineM = Mutation.ofLiftLeft((() => {
    const _internalStates = Array.from<boolean>({ length })
    const _intervalValues = Array.from<V>({ length })

    return (prev: WrappedData | Vacuo): V[] | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { id, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[id] = true
      _intervalValues[id] = value

      if (_internalStates.every(val => val)) {
        return [..._intervalValues]
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty<V[]>()

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

/**
 * @see {@link combineLatestT}
 */
export const objectCombineLatestT = <V>(
  sources: StringRecord<AtomLikeOfOutput<V>>
): Data<StringRecord<V>> => {
  const inputAtoms = Object.entries(sources).reduce<StringRecord<AtomLikeOfOutput<V>>>(
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
    value: Vacuo | V
  }
  const wrapMutations = Object.entries(sources).reduce<StringRecord<Mutation<V, WrappedData>>>(
    (acc, [key]) => {
      acc[key] = Mutation.ofLiftLeft((prev) => ({ key: key, value: prev }))
      return acc
    }, {}
  )

  const wrappedDatas = Object.entries(sources).reduce<StringRecord<Data<WrappedData>>>(
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
    const _intervalValues = Object.keys(sources).reduce<StringRecord<V | undefined>>(
      (acc, key) => {
        acc[key] = undefined
        return acc
      }, {}
    )

    return (prev: Vacuo | WrappedData): StringRecord<V> | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { key, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[key] = true
      _intervalValues[key] = value

      if (Object.values(_internalStates).every(val => val)) {
        return { ..._intervalValues } as unknown as StringRecord<V>
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty<StringRecord<V>>()

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
