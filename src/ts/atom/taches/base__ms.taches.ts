import { isString, isNumber, isArray, isPlainObject, isFunction } from '../../internal/base'
import { looseCurryN } from '../../functional'

import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtomLike, DEFAULT_MUTATION_OPTIONS } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'
import { replayWithLatest } from '../mediators'

import type { Vacuo, Terminator } from '../metas'
import type {
  MutatorOriginTransformationUnion
} from '../particles'
import type { MutationOptions, AtomLikeOfAny, AtomLikeOfOutput } from '../atoms'

// S -> Single, M -> Multi

/******************************************************************************************************
 *
 *                                           MS Tache
 *
 ******************************************************************************************************/

/**
 *
 */
interface MSTacheConfig<P, C> {
  transformation: (...args: any[]) => any
  arity?: number
  acceptNonAtom?: boolean
  customizeType?: 'partly' | 'fully'
  options?: MutationOptions<P, C>
  autoUpdateContexts?: boolean
}
const DEFAULT_MS_TACHE_CONFIG: Omit<Required<MSTacheConfig<any, any>>, 'transformation' | 'arity'> = {
  acceptNonAtom: true,
  customizeType: 'partly',
  options: DEFAULT_MUTATION_OPTIONS,
  autoUpdateContexts: true
}

interface ArrayMSTacheTrunkContexts {
  arity: number
  TERMINATOR: Terminator
}
type ArrayMSTacheFullyTransformation<P, C> = ((contexts: ArrayMSTacheTrunkContexts) => MutatorOriginTransformationUnion<P, C>)
interface ArrayMSTacheConfig<P, C> extends MSTacheConfig<P, C> {
  transformation: MutatorOriginTransformationUnion<P, C> | ArrayMSTacheFullyTransformation<P, C>
  sourcesType: 'array'
}
export interface ArrayMSTache<P, C> {
  (sources: Array<AtomLikeOfOutput<P>>): Data<C>
  (...sources: Array<AtomLikeOfOutput<P>>): Data<C>
}
/**
 * @param config
 * @return TacheMaker
 */
export const createArrayMSTache = <P, C>(
  config: ArrayMSTacheConfig<P, C>
): ArrayMSTache<P, C> => {
  if (!isPlainObject(config)) {
    throw (new TypeError('"config" is expected to be type of "PlainObject".'))
  }

  const {
    arity, acceptNonAtom, customizeType, options, transformation, autoUpdateContexts
  } = { ...DEFAULT_MS_TACHE_CONFIG, ...config }

  if (!isString(customizeType)) {
    throw (new TypeError('"customizeType" is expected to be type of "String".'))
  }
  if (customizeType !== 'partly' && customizeType !== 'fully') {
    throw (new TypeError('"customizeType" is expected to be "fully" | "partly".'))
  }
  if (transformation === undefined) {
    throw (new TypeError('"transformation" is required when use makeArrayMSTache to make tache.'))
  }
  if (!isFunction(transformation)) {
    throw (new TypeError('"transformation" is expected to be type of "Function".'))
  }

  type ValidSource = AtomLikeOfOutput<P>
  /**
   * @return Data
   */
  const tache: ArrayMSTache<P, C> = (...sources) => {
    let preparedSources: ValidSource[]

    let _sources: ValidSource[]
    if (sources.length === 1 && isArray(sources[0])) {
      _sources = sources[0]
    } else {
      _sources = sources as ValidSource[]
    }

    if (!acceptNonAtom) {
      _sources.forEach(source => {
        if (!isAtomLike(source)) {
          throw (new TypeError('"source" is expected to be type of "AtomLike".'))
        }
      })
      preparedSources = _sources
    } else {
      preparedSources = _sources.map<ValidSource>(source => {
        return (isAtomLike(source) ? source : replayWithLatest(1, Data.of(source))) as ValidSource
      })
    }

    const length = preparedSources.length

    interface WrappedData<P> {
      id: number
      value: P | Vacuo
    }
    const wrapMutations: Array<Mutation<P, WrappedData<P>>> = Array.from({ length }).map((_, idx) =>
      Mutation.ofLiftLeft(prev => ({ id: idx, value: prev }))
    )
    const wrappedDatas: Array<Data<WrappedData<P>>> = Array.from({ length }).map(() => Data.empty())

    const trunkM = Mutation.ofLift<P, C>((() => {
      const baseContexts: ArrayMSTacheTrunkContexts = { arity: length, TERMINATOR }

      if (customizeType === 'fully') {
        const contexts = { ...baseContexts }
        const actualTransformation = (transformation as ArrayMSTacheFullyTransformation<P, C>)(contexts)
        if (!isFunction(actualTransformation)) {
          throw (new TypeError('"transformation" is expected to return a "Function" when "customizeType" is specified to "fully".'))
        }
        return actualTransformation
      } else if (customizeType === 'partly') {
        const contexts = {
          ...baseContexts,
          states: Array.from({ length: length }),
          values: Array.from({ length: length })
        }
        // actual transformation which will takes prevDatar(or its value) & datar(ot its value) as argument
        const actualTransformation: MutatorOriginTransformationUnion<P, C> = (prev: any, cur: any, mutation: any, ...args: any[]): any => {
          if (autoUpdateContexts) {
            const { id, value } = prev
            contexts.states[id] = true
            contexts.values[id] = value
          }
          return transformation(prev, cur, mutation, contexts, ...args)
        }
        return actualTransformation
      }
    })() as MutatorOriginTransformationUnion<P, C>, options)

    const output = Data.empty<C>()

    pipeAtom(trunkM, output)
    wrappedDatas.forEach(data => {
      pipeAtom(data, trunkM)
    })
    wrapMutations.forEach((wrapMutation, idx) => {
      pipeAtom(wrapMutation, wrappedDatas[idx])
    })
    preparedSources.forEach((source, idx) => {
      binaryTweenPipeAtom(source, wrapMutations[idx])
    })

    return output
  }

  if (isNumber(arity)) {
    return looseCurryN(arity, tache)
  } else {
    return tache
  }
}

interface ObjectMSTacheTrunkContexts {
  keysOfSources: string[]
  TERMINATOR: Terminator
}
type ObjectMSTacheFullyTransformation<P, C> = ((contexts: ObjectMSTacheTrunkContexts) => MutatorOriginTransformationUnion<P, C>)
interface ObjectMSTacheConfig<P, C> extends MSTacheConfig<P, C> {
  transformation: MutatorOriginTransformationUnion<P, C> | ObjectMSTacheFullyTransformation<P, C>
  sourcesType: 'object'
}
export type ObjectMSTache<P, C> = (
  sources: Record<string, AtomLikeOfOutput<P>>
) => Data<C>
/**
 * @param config
 * @return TacheMaker
 */
export const createObjectMSTache = <P, C>(
  config: ObjectMSTacheConfig<P, C>
): ObjectMSTache<P, C> => {
  if (!isPlainObject(config)) {
    throw (new TypeError('"config" is expected to be type of "PlainObject".'))
  }

  const {
    arity, acceptNonAtom, customizeType, options, transformation, autoUpdateContexts
  } = { ...DEFAULT_MS_TACHE_CONFIG, ...config }

  if (!isString(customizeType)) {
    throw (new TypeError('"customizeType" is expected to be type of "String".'))
  }
  if (customizeType !== 'partly' && customizeType !== 'fully') {
    throw (new TypeError('"customizeType" is expected to be "fully" | "partly".'))
  }
  if (transformation === undefined) {
    throw (new TypeError('"transformation" is required when use makeArrayMSTache to make tache.'))
  }
  if (!isFunction(transformation)) {
    throw (new TypeError('"transformation" is expected to be type of "Function".'))
  }

  type ValidSource = AtomLikeOfOutput<P>
  /**
   * @param sources Object
   * @accept ({ name: Atom | Any, ...})
   * @return Data
   */
  const tache: ObjectMSTache<P, C> = (sources) => {
    if (!isPlainObject(sources)) {
      throw (new TypeError('"sources" is expected to be type of "PlainObject".'))
    }

    let preparedSources: Record<string, ValidSource>

    if (!acceptNonAtom) {
      Object.values(sources).forEach(source => {
        if (!isAtomLike(source)) {
          throw (new TypeError('"source" is expected to be type of "AtomLike".'))
        }
      })
      preparedSources = sources
    } else {
      preparedSources = Object.entries(sources).reduce<Record<string, ValidSource>>(
        (newSources, [name, source]) => {
          newSources[name] = newSources[name] ?? (isAtomLike(source) ? source : replayWithLatest(1, Data.of(source)))
          return newSources
        },
        {}
      )
    }

    interface WrappedData<P> {
      key: string
      value: P | Vacuo
    }
    const wrapMutations = Object.entries(preparedSources).reduce<Record<string, Mutation<P, WrappedData<P>>>>(
      (mutations, [key]) => {
        mutations[key] = Mutation.ofLiftLeft((prev) => ({ key: key, value: prev }))
        return mutations
      }, {})
    const wrappedDatas = Object.entries(preparedSources).reduce<Record<string, Data<WrappedData<P>>>>(
      (datas, [key]) => {
        datas[key] = Data.empty()
        return datas
      }, {})

    const trunkM = Mutation.ofLift<P, C>((() => {
      const baseContexts: ObjectMSTacheTrunkContexts = { keysOfSources: Object.keys(preparedSources), TERMINATOR }

      if (customizeType === 'fully') {
        const contexts = { ...baseContexts }
        const actualTransformation = (transformation as ObjectMSTacheFullyTransformation<P, C>)(contexts)
        if (!isFunction(actualTransformation)) {
          throw (new TypeError('"transformation" is expected to return a "Function" when "customizeType" is specified to "fully".'))
        }
        return actualTransformation
      } else if (customizeType === 'partly') {
        const contexts = {
          ...baseContexts,
          states: Object.keys(preparedSources).reduce<Record<string, boolean>>((acc, key) => {
            acc[key] = false
            return acc
          }, {}),
          values: Object.keys(preparedSources).reduce<Record<string, C | undefined>>((acc, key) => {
            acc[key] = undefined
            return acc
          }, {})
        }
        // actual transformation which will takes prevDatar(or its value) & datar(ot its value) as argument
        const actualTransformation: MutatorOriginTransformationUnion<P, C> = (prev: any, cur: any, mutation: any, ...args: any[]): any => {
          if (autoUpdateContexts) {
            const { key, value } = prev
            contexts.states[key] = true
            contexts.values[key] = value
          }
          return transformation(prev, cur, mutation, contexts, ...args)
        }
        return actualTransformation
      }
    })() as MutatorOriginTransformationUnion<P, C>, options)

    const output = Data.empty<C>()

    pipeAtom(trunkM, output)
    Object.values(wrappedDatas).forEach(data => {
      pipeAtom(data, trunkM)
    })
    Object.entries(wrapMutations).forEach(([key, wrapMutation]) => {
      pipeAtom(wrapMutation, wrappedDatas[key])
    })
    Object.entries(sources).forEach(([key, source]) => {
      binaryTweenPipeAtom(source, wrapMutations[key])
    })

    return output
  }

  return tache
}

interface ICreateMSTache {
  <P, C>(config: ArrayMSTacheConfig<P, C>): ArrayMSTache<P, C>
  <P, C>(config: ObjectMSTacheConfig<P, C>): ObjectMSTache<P, C>
}
/**
 * @return TacheMaker
 */
export const createMSTache: ICreateMSTache = (config: any): any => {
  if (!isPlainObject(config)) {
    throw (new TypeError(`"config" is expected to be type of "PlainObject", but received "${typeof config}".`))
  }

  const { sourcesType } = config
  if (sourcesType === 'array') {
    return createArrayMSTache(config as any)
  } else if (sourcesType === 'object') {
    return createObjectMSTache(config as any)
  }

  /**
   * @accept ({ name: Atom | Any, ...})
   * @accept ([Atom | Any, ...])
   * @accept (Atom | Any, ...)
   * @return Data
   */
  return (...sources: any[]) => {
    if (sources.length === 1 && isPlainObject(sources[0])) {
      return createObjectMSTache(config as any)(sources[0])
    }

    if (sources.length === 1 && isArray(sources[0])) {
      return createArrayMSTache(config as any)(...sources[0] as AtomLikeOfAny[])
    }
    if (sources.length > 1) {
      return createArrayMSTache(config as any)(...sources)
    }
  }
}
