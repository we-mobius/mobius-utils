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
 *                                           General Tache
 *
 ******************************************************************************************************/

/**
 *
 */
export interface TacheOptions {
  [key: string]: any
}
export interface TacheLevelContexts {
  [key: string]: any
}

const DEFAULT_TACHE_OPTIONS: TacheOptions = {}
const DEFAULT_TACHE_LEVEL_CONTEXTS: TacheLevelContexts = {}

type PrepareOptions<O extends TacheOptions = TacheOptions>
  = (options: O) => O
type PrepareTacheLevelContexts<TLC extends TacheLevelContexts = TacheLevelContexts>
  = () => TLC
type PrepareInput<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, sources: any) => In
type PrepareMidpiece<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, inputs: In) => Mid
type PrepareOutput<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, Mid = any, Out = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, midpiece: Mid) => Out
type connect<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any, Out = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, pieces: [In, Mid, Out]) => void

const DEFAULT_PREPARE_OPTIONS: PrepareOptions = () => DEFAULT_TACHE_OPTIONS
const DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS: PrepareTacheLevelContexts = () => DEFAULT_TACHE_LEVEL_CONTEXTS
const DEFAULT_PREPARE_INPUT: PrepareInput = (tacheOptions, tacheLevelContexts, sources) => sources
const DEFAULT_PREPARE_MIDPIECE: PrepareMidpiece = (tacheOptions, tacheLevelContexts, inputs) => Mutation.ofLiftBoth<any, any>(any => any)
const DEFAULT_PREPARE_OUTPUT: PrepareOutput = (tacheOptions, tacheLevelContexts, midpiece) => Data.empty<any>()
const DEFAULT_CONNET: connect = (tacheOptions, tacheLevelContexts, pieces) => {
  const [inputs, midpieces, outputs] = pieces
  pipeAtom(midpieces, outputs)
  binaryTweenPipeAtom(inputs, midpieces)
}

export interface GeneralTacheCreateOptions<
  O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any, Out = any
> {
  prepareOptions?: PrepareOptions<O>
  prepareTacheLevelContexts?: PrepareTacheLevelContexts<TLC>
  prepareInput?: PrepareInput<O, TLC, In>
  prepareMidpiece?: PrepareMidpiece<O, TLC, In, Mid>
  prepareOutput?: PrepareOutput<O, TLC, Mid, Out>
  connect?: connect<O, TLC, In, Mid, Out>
}

export const DEFAULT_GENERAL_TACHE_CREATE_OPTIONS: Required<GeneralTacheCreateOptions> = {
  prepareOptions: DEFAULT_PREPARE_OPTIONS,
  prepareTacheLevelContexts: DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS,
  prepareInput: DEFAULT_PREPARE_INPUT,
  prepareMidpiece: DEFAULT_PREPARE_MIDPIECE,
  prepareOutput: DEFAULT_PREPARE_OUTPUT,
  connect: DEFAULT_CONNET
}

export type Tache = (...sources: any[]) => ReturnType<PrepareOutput>

/**
 * @param createOptions
 * @param [tacheOptions]
 * @return { Tache } tache :: `(...sources: any[]) => ReturnType<PrepareOutput>`
 */
export const createGeneralTache = (
  createOptions: GeneralTacheCreateOptions | PrepareMidpiece, tacheOptions: TacheOptions = DEFAULT_TACHE_OPTIONS
): Tache => {
  if (!isPlainObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError('"createOptions" is expected to be type of "PlainObject" | "Function".'))
  }
  if (!isPlainObject(tacheOptions)) {
    throw (new TypeError('"tacheOptions" is expected to be type of "PlainObject".'))
  }

  let preparedCreateOptions: Required<GeneralTacheCreateOptions>

  if (isFunction(createOptions)) {
    preparedCreateOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, prepareMidpiece: createOptions }
  } else {
    preparedCreateOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, ...createOptions }
  }

  const {
    prepareOptions, prepareTacheLevelContexts,
    prepareInput, prepareMidpiece, prepareOutput, connect
  } = preparedCreateOptions

  const _tacheLevelContexts = prepareTacheLevelContexts()
  if (!isPlainObject(_tacheLevelContexts)) {
    throw (new TypeError('"tacheLevelContexts" is expected to be type of "PlainObject".'))
  }
  const preparedTacheLevelContexts = { ...DEFAULT_TACHE_LEVEL_CONTEXTS, ..._tacheLevelContexts }

  const _tacheOptions = prepareOptions(tacheOptions)
  if (!isPlainObject(_tacheOptions)) {
    throw (new TypeError('The returned value of "prepareOptions" is expected to be type of "PlainObject".'))
  }
  const preparedTacheOptions = { ...DEFAULT_TACHE_OPTIONS, ..._tacheOptions }

  return (...sources) => {
    const inputs = prepareInput(preparedTacheOptions, preparedTacheLevelContexts, sources.length > 1 ? sources : sources[0])
    const midpieces = prepareMidpiece(preparedTacheOptions, preparedTacheLevelContexts, inputs)
    const outputs = prepareOutput(preparedTacheOptions, preparedTacheLevelContexts, midpieces)
    connect(preparedTacheOptions, preparedTacheLevelContexts, [inputs, midpieces, outputs])
    return outputs
  }
}
interface ICreateGeneralTache_ {
  (createOptions: GeneralTacheCreateOptions | PrepareMidpiece, tacheOptions?: TacheOptions): Tache
  (createOptions: GeneralTacheCreateOptions | PrepareMidpiece): (tacheOptions?: TacheOptions) => Tache
}
/**
 * @see {@link createGeneralTache}
 */
export const createGeneralTache_: ICreateGeneralTache_ = looseCurryN(2, createGeneralTache)

/**
 * @param tacheMaker partial applied createGeneralTache
 */
export const useGeneralTache = (
  tacheMaker: (options: TacheOptions) => Tache, tacheOptions: TacheOptions, ...sources: any[]
): Tache => {
  const tache = tacheMaker(tacheOptions)
  const outputs = sources.length > 1 ? tache(...sources) : tache(sources[0])
  return outputs
}
export const useGeneralTache_ = looseCurryN(3, useGeneralTache)

/******************************************************************************************************
 *
 *                                           SS Tache
 *
 ******************************************************************************************************/

/**
 *
 */
export type SSTache<P = any, C = any> = (source: AtomLikeOfOutput<P>) => Data<C>
/**
 * @param transformation
 * @param options same as MutationOptions
 * @return { SSTache } SSTache :: `(source) => Data<any>`
 */
export const createSSTache = <P, C>(
  transformation: MutatorOriginTransformationUnion<P, C>, options: MutationOptions<P, C> = DEFAULT_MUTATION_OPTIONS
): SSTache<P, C> => {
  if (!isFunction(transformation)) {
    throw (new TypeError('"transformation" is expected to be type of "Function".'))
  }
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions = { ...DEFAULT_MUTATION_OPTIONS, ...options }

  /**
   * @param source
   * @return { Data<C> } Data
   */
  return source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"target" is expected to be type of "AtomLike".'))
    }

    const mutation = Mutation.ofLift<P, C>(transformation, preparedOptions)
    const outputD = Data.empty<C>()

    pipeAtom(mutation, outputD)
    binaryTweenPipeAtom(source, mutation)

    return outputD
  }
}

/******************************************************************************************************
 *
 *                                           SM Tache
 *
 ******************************************************************************************************/

/**
 *
 */
interface ArraySMTacheConfig<P> {
  transformation: MutatorOriginTransformationUnion<P, any>
  options?: MutationOptions<P, any>
}
export type ArraySMTache<P = any> = (source: AtomLikeOfOutput<P>) => Array<Data<any>>
/**
 * @param configArr `[{ transformation, options }, ...]`
 * @return { ArraySMTache<P> } ArraySSTache :: `(source) => Array<Data<any>>`
 */
export const createArraySMTache = <P>(configArr: Array<ArraySMTacheConfig<P>>): ArraySMTache<P> => {
  if (!isArray(configArr)) {
    throw (new TypeError('"configArr" is expected to be type of "Array".'))
  }

  // format configs
  configArr = configArr.map(({ transformation, options = {} }) => {
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    options = { ...DEFAULT_MUTATION_OPTIONS, ...options }
    return { transformation, options }
  })

  /**
   * @param source Atom
   * @return { Data<any> } Array of Data
   */
  return source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"source" is expected to be type of "AtomLike".'))
    }

    const mutations = configArr.map(({ transformation, options }) => {
      return Mutation.ofLift(transformation, options)
    })
    const outputs = Array.from({ length: configArr.length }).map(() => Data.empty<any>())

    outputs.forEach((output, index) => {
      pipeAtom(mutations[index], output)
      binaryTweenPipeAtom(source, mutations[index])
    })

    return outputs
  }
}

interface ObjectSMTacheConfig<P> {
  transformation: MutatorOriginTransformationUnion<P, any>
  options?: MutationOptions<P, any>
}
export type ObjectSMTache<P = any> = (source: AtomLikeOfOutput<P>) => Record<string, Data<any>>
/**
 * @param configObj `{ [key: string]: { transformation, options? } }`
 * @return { ObjectSMTache<P> } ObjectSSTache :: `(source) => Record<string, Data<any>>`
 */
export const createObjectSMTache = <P>(configObj: Record<string, ObjectSMTacheConfig<P>>): ObjectSMTache<P> => {
  if (!isPlainObject(configObj)) {
    throw (new TypeError('"configObj" is expected to be type of "PlainObject".'))
  }

  // // format configs
  configObj = Object.entries(configObj).reduce<(typeof configObj)>(
    (acc, [name, { transformation, options = {} }]) => {
      if (!isFunction(transformation)) {
        throw (new TypeError('"transformation" is expected to be type of "Function".'))
      }

      acc[name] = acc[name] ?? { transformation, options: { ...DEFAULT_MUTATION_OPTIONS, ...options } }

      return acc
    }
  , {})

  /**
   * @param source Atom
   * @return Object of Data
   */
  return source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"source" is expected to be type of "AtomLike".'))
    }

    const mutations = Object.entries(configObj).reduce<Record<string, Mutation<P, any>>>(
      (acc, [name, { transformation, options }]) => {
        acc[name] = acc[name] ?? Mutation.ofLift(transformation, options)
        return acc
      }
      , {})

    const outputs = Object.entries(configObj).reduce<Record<string, Data<any>>>((acc, [name]) => {
      acc[name] = acc[name] ?? Data.empty()
      return acc
    }, {})

    Object.entries(outputs).forEach(([name, output]) => {
      pipeAtom(mutations[name], output)
      binaryTweenPipeAtom(source, mutations[name])
    })

    return outputs
  }
}

interface ICreateSMTache {
  <P>(config: Array<ArraySMTacheConfig<P>>): ArraySMTache<P>
  <P>(config: Record<string, ObjectSMTacheConfig<P>>): ObjectSMTache<P>
}
/**
 * @return TacheMaker
 */
export const createSMTache: ICreateSMTache = (config: any): any => {
  if (isPlainObject(config)) {
    return createObjectSMTache(config)
  } else if (isArray<any>(config)) {
    return createArraySMTache(config)
  } else {
    throw (new TypeError('"config" is expected to be type of "Array" | "PlainObject".'))
  }
}

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

/******************************************************************************************************
 *
 *                                           MM Tache
 *
 ******************************************************************************************************/

// TODO: waiting for suitable usage scenarios
export const createMMTache = (): void => {
  throw (new Error('makeMMTache to be developed.'))
}
