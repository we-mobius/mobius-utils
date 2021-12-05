import { isArray, isPlainObject } from '../../internal/base'

import { TERMINATOR, isTerminator, isVacuo } from '../metas'
import { isAtomLike, Mutation, Data } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Terminator, Vacuo } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type StringRecord<V> = Record<string, V>

interface ICombineT {
  <V>(
    ...sources: Array<AtomLikeOfOutput<V>> | [Array<AtomLikeOfOutput<V>>]
  ): Data<Array<V | undefined>>
  <V>(
    source: StringRecord<AtomLikeOfOutput<V>>
  ): Data<StringRecord<V | undefined>>
}
/**
 * @see {@link arrayCombineT} {@link objectCombineT}
 */
export const combineT: ICombineT = (...sources: any[]): any => {
  if (isAtomLike(sources[0]) || isArray(sources[0])) {
    return arrayCombineT(...sources)
  } else if (isPlainObject(sources[0])) {
    return objectCombineT(sources[0])
  } else {
    throw (new TypeError('"sources" are expected to be type of AtomLike | AtomLike[] | Record<string, AtomLike>.'))
  }
}

/**
 * @see {@link combineT}
 */
export const arrayCombineT = <V>(
  ...sources: Array<AtomLikeOfOutput<V>> | [Array<AtomLikeOfOutput<V>>]
): Data<Array<V | undefined>> => {
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
    const _internalValues = Array.from<V | undefined>({ length })

    return (prev: WrappedData | Vacuo): Array<V | undefined> | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { id, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[id] = true
      _internalValues[id] = value

      return [..._internalValues]
    }
  })())

  const outputD = Data.of<Array<V | undefined>>(Array.from({ length }))

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
 * @see {@link combineT}
 */
export const objectCombineT = <V>(
  sources: StringRecord<AtomLikeOfOutput<V>>
): Data<StringRecord<V | undefined>> => {
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
    const _internalValues = Object.keys(sources).reduce<StringRecord<V | undefined>>(
      (acc, key) => {
        acc[key] = undefined
        return acc
      }, {}
    )

    return (prev: Vacuo | WrappedData): StringRecord<V | undefined> | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { key, value } = prev

      if (isTerminator(value)) return TERMINATOR

      _internalStates[key] = true
      _internalValues[key] = value

      return { ..._internalValues }
    }
  })())

  const outputD = Data.of<StringRecord<V | undefined>>(Object.keys(sources).reduce<StringRecord<V | undefined>>((acc, key) => {
    acc[key] = undefined
    return acc
  }, {}))

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
