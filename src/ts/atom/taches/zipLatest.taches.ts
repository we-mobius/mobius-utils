import { isArray, isPlainObject } from '../../internal/base'

import { TERMINATOR, isTerminator, isVacuo } from '../metas'
import { Mutation, Data, isAtomLike } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { Vacuo, Terminator } from '../metas'
import type { AtomLikeOfOutput } from '../atoms'

type StringRecord<V> = Record<string, V>

interface IZipLatestT {
  <V>(
    ...sources: Array<AtomLikeOfOutput<V>> | [Array<AtomLikeOfOutput<V>>]
  ): Data<V[]>
  <V>(
    sources: StringRecord<AtomLikeOfOutput<V>>
  ): Data<StringRecord<V>>
}
/**
 * @see {@link arrayZipLatestT}, {@link objectZipLatestT}
 */
export const zipLatestT: IZipLatestT = (...sources: any[]): any => {
  if (isAtomLike(sources[0]) || isArray(sources[0])) {
    return arrayZipLatestT(...sources)
  } else if (isPlainObject(sources[0])) {
    return objectZipLatestT(sources[0])
  } else {
    throw (new TypeError('Arguments of zipLatestT are expected to be type of Atom | [Atom] | { Atom }.'))
  }
}

/**
 * @see {@link zipLatestT}
 */
export const arrayZipLatestT = <V>(
  ...sources: Array<AtomLikeOfOutput<V>> | [Array<AtomLikeOfOutput<V>>]
): Data<V[]> => {
  let preparedSources: Array<AtomLikeOfOutput<V>>
  if (sources.length === 1 && isArray(sources[0])) {
    preparedSources = sources[0]
  } else {
    preparedSources = sources as Array<AtomLikeOfOutput<V>>
  }

  const inputDatas = preparedSources.map(atom => {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"sources" are expected to be type of "AtomLike".'))
    }
    return atom
  })

  interface WrappedSource {
    id: number
    value: Vacuo | V
  }
  const wrapMutations = Array.from({ length: preparedSources.length }).map((val, idx) =>
    Mutation.ofLiftLeft<V, WrappedSource>((prev) => ({ id: idx, value: prev }))
  )
  const wrappedDatas = Array.from({ length: preparedSources.length }).map(() => Data.empty<WrappedSource>())

  const zipM = Mutation.ofLiftLeft((() => {
    const _internalState = Array.from<boolean>({ length: preparedSources.length })
    const _internalValues = Array.from<V>({ length: preparedSources.length })

    return (prev: Vacuo | WrappedSource): V[] | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { id } = prev
      _internalState[id] = true
      _internalValues[id] = prev.value

      if (_internalState.every(val => val) && _internalValues.every(val => !isTerminator(val))) {
        _internalState.forEach((_, idx) => { _internalState[idx] = false })
        return [..._internalValues]
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty<V[]>()

  pipeAtom(zipM, outputD)
  wrappedDatas.forEach(data => {
    pipeAtom(data, zipM)
  })
  wrapMutations.forEach((wrapMutation, idx) => {
    pipeAtom(wrapMutation, wrappedDatas[idx])
  })
  inputDatas.forEach((data, idx) => {
    binaryTweenPipeAtom(data, wrapMutations[idx])
  })

  return outputD
}

/**
 * @see {@link zipLatestT}
 */
export const objectZipLatestT = <V>(
  sources: StringRecord<AtomLikeOfOutput<V>>
): Data<StringRecord<V>> => {
  const inputDatas = Object.entries(sources).reduce<StringRecord<AtomLikeOfOutput<V>>>((acc, [key, atom]) => {
    if (!isAtomLike(atom)) {
      throw (new TypeError('"sources" are expected to be type of "AtomLike".'))
    }
    acc[key] = atom
    return acc
  }, {})

  interface WrappedSource {
    key: string
    value: Vacuo | V
  }
  const wrapMutations = Object.entries(sources).reduce<StringRecord<Mutation<V, WrappedSource>>>((acc, [key]) => {
    acc[key] = Mutation.ofLiftLeft((prev) => ({ key: key, value: prev }))
    return acc
  }, {})

  const wrappedDatas = Object.entries(sources).reduce<StringRecord<Data<WrappedSource>>>((acc, [key]) => {
    acc[key] = Data.empty()
    return acc
  }, {})

  const zipM = Mutation.ofLiftLeft((() => {
    const _internalState = Object.keys(sources).reduce<StringRecord<boolean>>((acc, key) => {
      acc[key] = false
      return acc
    }, {})
    const _internalValues = Object.keys(sources).reduce<StringRecord<V | undefined>>((acc, key) => {
      acc[key] = undefined
      return acc
    }, {})

    return (prev: Vacuo | WrappedSource): StringRecord<V> | Terminator => {
      if (isVacuo(prev)) return TERMINATOR
      if (isVacuo(prev.value)) return TERMINATOR

      const { key } = prev

      _internalState[key] = true
      _internalValues[key] = prev.value

      if (Object.values(_internalState).every(val => val) && Object.values(_internalValues).every(val => !isTerminator(val))) {
        Object.keys(_internalState).forEach(key => {
          _internalState[key] = false
        })
        return { ..._internalValues } as unknown as StringRecord<V>
      } else {
        return TERMINATOR
      }
    }
  })())

  const outputD = Data.empty<StringRecord<V>>()

  pipeAtom(zipM, outputD)
  Object.values(wrappedDatas).forEach(data => {
    pipeAtom(data, zipM)
  })
  Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
    pipeAtom(wrapMutation, wrappedDatas[key])
  })
  Object.entries(inputDatas).forEach(([key, data]) => {
    binaryTweenPipeAtom(data, wrapMutations[key])
  })

  return outputD
}
