import { isString, isNumber, isArray, isPlainObject, isFunction } from '../../internal/base'
import { looseCurryN } from '../../functional'

import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtomLike, DEFAULT_MUTATION_OPTIONS } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'
import { replayWithLatest } from '../mediators'

import type { Vacuo, Terminator } from '../metas'
import type {
  TransformationLiftPositions,
  MutatorOriginTransformationUnion,
  MutatorTransformation, LiftBothTransformation, LiftLeftTransformation, LiftRightTransformation
} from '../particles'
import type { MutationOptions, AtomLikeOfOutput } from '../atoms'

// S -> Single, M -> Multi

/******************************************************************************************************
 *
 *                                           Utils Types
 *
 ******************************************************************************************************/

/**
 *
 */
type TupleToUnion<T extends any[]> = T[number]
type ObjectToUnion<T extends Record<any, any>> = T[keyof T]
type ToUnion<T extends any[] | Record<any, any>> =
  T extends any[] ? TupleToUnion<T> :
    T extends Record<any, any> ? ObjectToUnion<T>:
      never

interface WrapP<K, P> { key: K, value: P | Vacuo }
type WrapArrayPs<Ps extends any[], A extends any[] = []> =
  Ps extends [infer F, ...infer R] ? [WrapP<A['length'], F>, ...WrapArrayPs<R, [...A, F]>] : []
type WrapObjectPs<Ps extends Record<any, any>> = {
  [K in keyof Ps]: { key: K, value: Ps[K] | Vacuo }
}
type WrapPs<Ps extends any[] | Record<any, any>> =
  Ps extends any[] ? WrapArrayPs<Ps> : Ps extends Record<any, any> ? WrapObjectPs<Ps> : never

type ToBooleanTuple<T extends any[]> = T extends [infer _, ...infer R] ? [boolean, ...ToBooleanTuple<R>] : []
type ToUndefinedableTuple<T extends any[]> = T extends [infer F, ...infer R] ? [F | undefined, ...ToUndefinedableTuple<R>] : []

type ToBooleanObject<T extends Record<any, any>> = {
  [K in keyof T]: boolean
}
type ToUndefinedableObject<T extends Record<any, any>> = {
  [K in keyof T]?: T[K] | undefined
}

/******************************************************************************************************
 *
 *                                           MS Tache Common
 *
 ******************************************************************************************************/

/**
 *
 */
type CustomizeTypes = 'partly' | 'fully'
type LiftTypes = Exclude<TransformationLiftPositions, 'unknown'>

/**
 * @typeParam AN - The type of acceptNonAtom
 * @typeParam CT - The type of customizeTypes
 * @typeParam LT - The type of MutationLiftPosition
 */
interface MSTacheCommonConfig<
  Ps extends any[] | Record<any, any>, C, Contexts extends any[] = any[],
  AN extends boolean = boolean,
  CT extends CustomizeTypes = CustomizeTypes,
  LT extends LiftTypes = LiftTypes
> {
  /**
   * Default to `true`.
   */
  acceptNonAtom?: AN
  /**
   * Default to `partly`.
   */
  customizeType?: CT
  options?: MutationOptions<ToUnion<Ps>, C, Contexts> & { lift?: { position?: LT }}
  /**
   * Default to `true`.
   */
  autoUpdateContexts?: boolean
  sourcesType: 'array' | 'object'
}
const DEFAULT_MS_TACHE_COMMON_CONFIG: Omit<Required<MSTacheCommonConfig<any[], any, any[]>>, 'sourcesType'> = {
  acceptNonAtom: true,
  customizeType: 'partly',
  options: DEFAULT_MUTATION_OPTIONS as any,
  autoUpdateContexts: true
}

/******************************************************************************************************
 *
 *                                          Array MS Tache
 *
 ******************************************************************************************************/

/**
 *
 */
interface ArrayMSTacheTrunkBaseContexts {
  arity: number
  TERMINATOR: Terminator
}

type ArrayMSTacheFullyTransformation<Ps extends any[], C, LT extends LiftTypes = LiftTypes> =
  (contexts: ArrayMSTacheTrunkBaseContexts) =>
  LT extends 'both' ? LiftBothTransformation<TupleToUnion<WrapArrayPs<Ps>>, C> :
    LT extends 'left' ? LiftLeftTransformation<TupleToUnion<WrapArrayPs<Ps>>, C> :
      LT extends 'right' ? LiftRightTransformation<TupleToUnion<WrapArrayPs<Ps>>, C> :
        LT extends 'none' ? MutatorTransformation<TupleToUnion<WrapArrayPs<Ps>>, C> : never

interface ArrayMSTacheTrunkContextsForPartly<Ps extends any[] = any[]> extends ArrayMSTacheTrunkBaseContexts {
  states: ToBooleanTuple<Ps>
  values: ToUndefinedableTuple<Ps>
  [key: string]: any
}

interface ArrayMSTacheConfig<
  Ps extends any[], C,
  AN extends boolean = boolean,
  CT extends CustomizeTypes = CustomizeTypes,
  LT extends LiftTypes = LiftTypes
> extends MSTacheCommonConfig<Ps, C, any[], AN, CT, LT> {
  /**
   * Indicate how many sources will take into account for the generated Tache.
   * If is provided, the generated Tache will be loose curried with the number of sources.
   *
   * Default to `undefined`, which means the generated Tache will not be curried, the number of sources
   *   took into account is the same as the number of sources passed in.
   */
  arity?: number
  transformation: CT extends 'partly' ? (
    LT extends 'both' ? LiftBothTransformation<TupleToUnion<WrapArrayPs<Ps>>, C, [ArrayMSTacheTrunkContextsForPartly<Ps>]> :
      LT extends 'left' ? LiftLeftTransformation<TupleToUnion<WrapArrayPs<Ps>>, C, [ArrayMSTacheTrunkContextsForPartly<Ps>]> :
        LT extends 'right' ? LiftRightTransformation<TupleToUnion<WrapArrayPs<Ps>>, C, [ArrayMSTacheTrunkContextsForPartly<Ps>]> :
          LT extends 'none' ? MutatorTransformation<TupleToUnion<WrapArrayPs<Ps>>, C, [ArrayMSTacheTrunkContextsForPartly<Ps>]> :
            never
  ) : CT extends 'fully' ?
    ArrayMSTacheFullyTransformation<Ps, C, LT> : never
  sourcesType: 'array'
}

type WrapArrayToAtomLikeOfOutput<T, AN> = T extends [infer F, ...infer R] ?
    [AN extends true ? AtomLikeOfOutput<F> | F : AtomLikeOfOutput<F>, ...WrapArrayToAtomLikeOfOutput<R, AN>] : []
/**
 * @typeParam AN - The type of acceptNonAtom
 */
export type ArrayMSTache<Ps, C, AN> =
  (...sources: WrapArrayToAtomLikeOfOutput<Ps, AN> | [WrapArrayToAtomLikeOfOutput<Ps, AN>]) => Data<C>

/**
 * @typeParam AN - The type of acceptNonAtom
 * @typeParam CT - The type of customizeTypes
 * @typeParam LT - The type of MutationLiftPosition
 */
export function createArrayMSTache<
  Ps extends any[], C,
  AN extends boolean = boolean,
  CT extends CustomizeTypes = CustomizeTypes,
  LT extends LiftTypes = LiftTypes
> (
  config: ArrayMSTacheConfig<Ps, C | Terminator, AN, CT, LT>
): ArrayMSTache<Ps, C, AN> {
  if (!isPlainObject(config)) {
    throw (new TypeError('"config" is expected to be type of "PlainObject".'))
  }

  const {
    arity, acceptNonAtom, customizeType, options, transformation, autoUpdateContexts
  } = {
    ...DEFAULT_MS_TACHE_COMMON_CONFIG as Omit<Required<MSTacheCommonConfig<Ps, C | Terminator, any[], AN, CT, LT>>, 'sourcesType'>,
    ...config
  }

  if (!isString(customizeType)) {
    throw (new TypeError('"customizeType" is expected to be type of "String".'))
  }
  if (customizeType !== 'partly' && customizeType !== 'fully') {
    throw (new TypeError('"customizeType" is expected to be "fully" | "partly".'))
  }
  if (transformation === undefined) {
    throw (new TypeError('"transformation" is required.'))
  }
  if (!isFunction(transformation)) {
    throw (new TypeError('"transformation" is expected to be type of "Function".'))
  }

  type ValidSource = AtomLikeOfOutput<any>
  /**
   * @return Data
   */
  const tache: ArrayMSTache<Ps, C, AN> = (...sources) => {
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

    const length = arity ?? preparedSources.length

    // TODO: add more accurate types
    const wrapMutations: Mutation[] = Array.from({ length }).map((_, index) =>
      Mutation.ofLiftLeft(prev => ({ key: index, value: prev }))
    )
    const wrappedDatas: Data[] = Array.from({ length }).map(() => Data.empty())

    const trunkM = Mutation.ofLift((() => {
      const baseContexts: ArrayMSTacheTrunkBaseContexts = { arity: length, TERMINATOR }

      if (customizeType === 'fully') {
        const contexts: ArrayMSTacheTrunkBaseContexts = { ...baseContexts }
        const actualTransformation = (transformation as ArrayMSTacheFullyTransformation<Ps, C | Terminator, LT>)(contexts)
        if (!isFunction(actualTransformation)) {
          throw (new TypeError('"transformation" is expected to return a "Function" when "customizeType" is specified to "fully".'))
        }
        return actualTransformation
      } else if (customizeType === 'partly') {
        const contexts = {
          ...baseContexts,
          states: Array.from<boolean>({ length: length }),
          values: Array.from<C | undefined>({ length: length })
        }
        // actual transformation which will takes prevDatar(or its value) & datar(ot its value) as argument
        const actualTransformation: MutatorOriginTransformationUnion<ToUnion<WrapArrayPs<Ps>>, C | Terminator> =
        (prev: any, cur: any, mutation: any, ...args: any[]): any => {
          if (autoUpdateContexts) {
            const { key, value } = prev
            contexts.states[key] = true
            contexts.values[key] = value
          }
          return transformation(prev, cur, mutation, contexts, ...args)
        }
        return actualTransformation
      }
    })() as MutatorOriginTransformationUnion<ToUnion<WrapArrayPs<Ps>>, C | Terminator>, options)

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

/******************************************************************************************************
 *
 *                                          Object MS Tache
 *
 ******************************************************************************************************/

/**
 *
 */
interface ObjectMSTacheTrunkBaseContexts {
  keysOfSources: Array<string | number | symbol>
  TERMINATOR: Terminator
}

type ObjectMSTacheFullyTransformation<Ps extends Record<any, any>, C, LT extends LiftTypes = LiftTypes> =
  (contexts: ObjectMSTacheTrunkBaseContexts) =>
  LT extends 'both' ? LiftBothTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C> :
    LT extends 'left' ? LiftLeftTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C> :
      LT extends 'right' ? LiftRightTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C> :
        LT extends 'none' ? MutatorTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C> : never

interface ObjectMSTacheTrunkContextsForPartly<Ps extends Record<any, any> = Record<any, any>> extends ArrayMSTacheTrunkBaseContexts {
  states: ToBooleanObject<Ps>
  values: ToUndefinedableObject<Ps>
  [key: string]: any
}

interface ObjectMSTacheConfig<
  Ps extends Record<string, any>, C,
  AN extends boolean = boolean,
  CT extends CustomizeTypes = CustomizeTypes,
  LT extends LiftTypes = LiftTypes
> extends MSTacheCommonConfig<Ps, C, any[], AN, CT, LT> {
  transformation: CT extends 'partly' ? (
    LT extends 'both' ? LiftBothTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C, [ObjectMSTacheTrunkContextsForPartly<Ps>]> :
      LT extends 'left' ? LiftLeftTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C, [ObjectMSTacheTrunkContextsForPartly<Ps>]> :
        LT extends 'right' ? LiftRightTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C, [ObjectMSTacheTrunkContextsForPartly<Ps>]> :
          LT extends 'none' ? MutatorTransformation<ObjectToUnion<WrapObjectPs<Ps>>, C, [ObjectMSTacheTrunkContextsForPartly<Ps>]> :
            never
  ) : CT extends 'fully' ?
    ObjectMSTacheFullyTransformation<Ps, C, LT> : never
  sourcesType: 'object'
}

type WrapObjectToAtomLikeOfOutput<T extends Record<any, any>, AN> = {
  [K in keyof T]: AN extends true ? T[K] | AtomLikeOfOutput<T[K]> : AtomLikeOfOutput<T[K]>
}

/**
 * @typeParam AN - The type of acceptNonAtom
 */
export type ObjectMSTache<Ps, C, AN> =
  (sources: WrapObjectToAtomLikeOfOutput<Ps, AN>) => Data<C>

/**
 * @typeParam AN - The type of acceptNonAtom
 * @typeParam CT - The type of customizeTypes
 * @typeParam LT - The type of MutationLiftPosition
 */
export const createObjectMSTache = <
  Ps extends Record<any, any>, C,
  AN extends boolean = boolean,
  CT extends CustomizeTypes = CustomizeTypes,
  LT extends LiftTypes = LiftTypes
>(
    config: ObjectMSTacheConfig<Ps, C | Terminator, AN, CT, LT>
  ): ObjectMSTache<Ps, C, AN> => {
  if (!isPlainObject(config)) {
    throw (new TypeError('"config" is expected to be type of "PlainObject".'))
  }

  const {
    acceptNonAtom, customizeType, options, transformation, autoUpdateContexts
  } = {
    ...DEFAULT_MS_TACHE_COMMON_CONFIG as Omit<Required<MSTacheCommonConfig<Ps, C | Terminator, any[], AN, CT, LT>>, 'sourcesType'>,
    ...config
  }

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

  type ValidSource = AtomLikeOfOutput<any>
  type ValidSources = Record<string, ValidSource>
  /**
   * @param sources Object
   * @accept ({ name: Atom | Any, ...})
   * @return Data
   */
  const tache: ObjectMSTache<Ps, C, AN> = (sources) => {
    if (!isPlainObject(sources)) {
      throw (new TypeError('"sources" is expected to be type of "PlainObject".'))
    }

    let preparedSources: ValidSources

    if (!acceptNonAtom) {
      Object.values(sources).forEach(source => {
        if (!isAtomLike(source)) {
          throw (new TypeError('"source" is expected to be type of "AtomLike".'))
        }
      })
      preparedSources = sources
    } else {
      preparedSources = Object.entries(sources).reduce<ValidSources>(
        (newSources, [name, source]) => {
          newSources[name] = newSources[name] ?? (isAtomLike(source) ? source : replayWithLatest(1, Data.of(source)))
          return newSources
        },
        {}
      )
    }

    // TODO: add more accurate types
    const wrapMutations = Object.entries(preparedSources).reduce<Record<string, Mutation>>(
      (mutations, [key]) => {
        mutations[key] = Mutation.ofLiftLeft((prev) => ({ key: key, value: prev }))
        return mutations
      }, {})
    const wrappedDatas = Object.entries(preparedSources).reduce<Record<string, Data>>(
      (datas, [key]) => {
        datas[key] = Data.empty()
        return datas
      }, {})

    const trunkM = Mutation.ofLift((() => {
      const baseContexts: ObjectMSTacheTrunkBaseContexts = { keysOfSources: Object.keys(preparedSources), TERMINATOR }

      if (customizeType === 'fully') {
        const contexts = { ...baseContexts }
        const actualTransformation = (transformation as ObjectMSTacheFullyTransformation<Ps, C | Terminator, LT>)(contexts)
        if (!isFunction(actualTransformation)) {
          throw (new TypeError('"transformation" is expected to return a "Function" when "customizeType" is specified to "fully".'))
        }
        return actualTransformation
      } else if (customizeType === 'partly') {
        const contexts = {
          ...baseContexts,
          states: Object.keys(preparedSources).reduce<Record<any, boolean>>((acc, key) => {
            acc[key] = false
            return acc
          }, {}),
          values: Object.keys(preparedSources).reduce<Record<any, C | undefined>>((acc, key) => {
            acc[key] = undefined
            return acc
          }, {})
        }
        // actual transformation which will takes prevDatar(or its value) & datar(ot its value) as argument
        const actualTransformation: MutatorOriginTransformationUnion<ToUnion<WrapObjectPs<Ps>>, C | Terminator> =
        (prev: any, cur: any, mutation: any, ...args: any[]): any => {
          if (autoUpdateContexts) {
            const { key, value } = prev
            contexts.states[key] = true
            contexts.values[key] = value
          }
          return transformation(prev, cur, mutation, contexts, ...args)
        }
        return actualTransformation
      }
    })() as MutatorOriginTransformationUnion<ToUnion<WrapObjectPs<Ps>>, C | Terminator>, options)

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
  <Ps extends any[], C, AN extends boolean = boolean, CT extends CustomizeTypes = CustomizeTypes, LT extends LiftTypes = LiftTypes>(
    config: ArrayMSTacheConfig<Ps, C | Terminator, AN, CT, LT>
  ): ArrayMSTache<Ps, C, AN>
  <Ps extends Record<any, any>, C, AN extends boolean = boolean, CT extends CustomizeTypes = CustomizeTypes, LT extends LiftTypes = LiftTypes>(
    config: ObjectMSTacheConfig<Ps, C | Terminator, AN, CT, LT>
  ): ObjectMSTache<Ps, C, AN>
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

  return (...sources: any[]) => {
    if (sources.length === 1 && isPlainObject(sources[0])) {
      return createObjectMSTache(config as any)(sources[0])
    }

    if (sources.length === 1 && isArray(sources[0])) {
      return createArrayMSTache(config as any)(...sources[0] as any)
    }
    if (sources.length > 1) {
      return createArrayMSTache(config as any)(...sources as any)
    }
  }
}
