import { isString, isNumber, isArray, isPlainObject, isFunction } from '../../internal/base'
import { looseCurryN } from '../../functional'
import { TERMINATOR } from '../metas'
import { Data, Mutation, isAtom, DEFAULT_MUTATION_OPTIONS } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'
import { replayWithLatest } from '../mediators'

import type { Vacuo, Terminator } from '../metas'
import type {
  MutatorOriginTransformationUnion
} from '../particles'
import type { MutationOptions } from '../atoms'
import type { DataMediator, MutationMediator } from '../mediators'

// S -> Single, M -> Multi

/******************************************************************************************************
 *
 *                                           General Tache
 *
 ******************************************************************************************************/

/**
 *
 */
interface TacheOptions {
  [key: string]: any
}
interface TacheLevelContexts {
  [key: string]: any
}

const DEFAULT_TACHE_OPTIONS: TacheOptions = {}
const DEFAULT_TACHE_LEVEL_CONTEXTS: TacheLevelContexts = {}

type PrepareOptions = (options: TacheOptions) => TacheOptions
type PrepareTacheLevelContexts = () => TacheLevelContexts
type PrepareInput = (tacheOptions: TacheOptions, tacheLevelContexts: TacheLevelContexts, sources: any) => any
type PrepareMidpiece = (tacheOptions: TacheOptions, tacheLevelContexts: TacheLevelContexts, inputs: ReturnType<PrepareInput>) => any
type PrepareOutput = (tacheOptions: TacheOptions, tacheLevelContexts: TacheLevelContexts, midpiece: ReturnType<PrepareMidpiece>) => any
type connect = (tacheOptions: TacheOptions, tacheLevelContexts: TacheLevelContexts, pieces: [ReturnType<PrepareInput>, ReturnType<PrepareMidpiece>, ReturnType<PrepareOutput>]) => void

const DEFAULT_PREPARE_OPTIONS: PrepareOptions = () => DEFAULT_TACHE_OPTIONS
const DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS: PrepareTacheLevelContexts = () => DEFAULT_TACHE_LEVEL_CONTEXTS
const DEFAULT_PREPARE_INPUT: PrepareInput = (tacheOptions, tacheLevelContexts, sources) => sources
const DEFAULT_PREPARE_MIDPIECE: PrepareMidpiece = (tacheOptions, tacheLevelContexts, inputs) => Mutation.ofLiftBoth(any => any)
const DEFAULT_PREPARE_OUTPUT: PrepareOutput = (tacheOptions, tacheLevelContexts, midpiece) => Data.empty()
const DEFAULT_CONNET: connect = (tacheOptions, tacheLevelContexts, pieces) => {
  const [inputs, midpieces, outputs] = pieces
  pipeAtom(midpieces, outputs)
  binaryTweenPipeAtom(inputs, midpieces)
}

interface GeneralTacheCreateOptions {
  prepareOptions?: PrepareOptions
  prepareTacheLevelContexts?: PrepareTacheLevelContexts
  prepareInput?: PrepareInput
  prepareMidpiece?: PrepareMidpiece
  prepareOutput?: PrepareOutput
  connect?: connect
}

const DEFAULT_GENERAL_TACHE_CREATE_OPTIONS: Required<GeneralTacheCreateOptions> = {
  prepareOptions: DEFAULT_PREPARE_OPTIONS,
  prepareTacheLevelContexts: DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS,
  prepareInput: DEFAULT_PREPARE_INPUT,
  prepareMidpiece: DEFAULT_PREPARE_MIDPIECE,
  prepareOutput: DEFAULT_PREPARE_OUTPUT,
  connect: DEFAULT_CONNET
}

type Tache = (...sources: any[]) => ReturnType<PrepareOutput>

/**
 * @param { GeneralTacheCreateOptions | PrepareMidpiece } createOptions
 * @param { TacheOptions } [tacheOptions]
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

  if (isFunction(createOptions)) {
    createOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, prepareMidpiece: createOptions }
  } else {
    createOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, ...createOptions }
  }

  const {
    prepareOptions, prepareTacheLevelContexts,
    prepareInput, prepareMidpiece, prepareOutput, connect
  } = createOptions as Required<GeneralTacheCreateOptions>

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
export const createGeneralTache_ = looseCurryN(2, createGeneralTache)

/**
 * @param { PartialFunction } tacheMaker partial applied createGeneralTache
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
type SSTache<P, C> = (
  source: Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>,
) => Data<C>
/**
 * @param { MutatorOriginTransformationUnion<P, C> } transformation
 * @param { MutationOptions<P, C> } options same as MutationOptions
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
   * @param { Data<P> | DataMediator<Data<P>> | Mutation<P, C> | MutationMediator<Mutation<P, C>> } source
   * @return { Data<C> } Data
   */
  return source => {
    if (!isAtom(source)) {
      throw (new TypeError('"target" is expected to be type of "Atom".'))
    }

    const mutation = Mutation.ofLift(transformation, preparedOptions)
    const outputD = Data.empty() as Data<C>

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
type ArraySMTache<P> = (
  source: Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>
) => Array<Data<any>>
/**
 * @param { ArraySMTacheConfig<P>[] } configArr `[{ transformation, options }, ...]`
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
   * @param { Atom } source Atom
   * @return Array of Data
   */
  return source => {
    if (!isAtom(source)) {
      throw (new TypeError('"source" is expected to be type of "Atom".'))
    }

    const mutations = configArr.map(({ transformation, options }) => {
      return Mutation.ofLift(transformation, options)
    })
    const outputs = Array.from({ length: configArr.length }).map(() => Data.empty())

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
type ObjectSMTache<P> = (
  source: Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>
) => Record<string, Data<any>>
/**
 * @param { ObjectSMTacheConfig<P> } configObj `{ [key: string]: { transformation, options? } }`
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
   * @param { Atom } source Atom
   * @return Object of Data
   */
  return source => {
    if (!isAtom(source)) {
      throw (new TypeError('"source" is expected to be type of "Atom".'))
    }

    const mutations = Object.entries(configObj).reduce<Record<string, Mutation<any, P>>>(
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
interface ArrayMSTache<P, C> {
  (sources: Array<Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>>): Data<C>
  (...sources: Array<Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>>): Data<C>
}
/**
 * @param { ArrayMSTacheConfig<C> } config
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

  type ValidSource = Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>
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
        if (!isAtom(source)) {
          throw (new TypeError('"source" is expected to be type of "Atom".'))
        }
      })
      preparedSources = _sources
    } else {
      preparedSources = _sources.map<ValidSource>(source => {
        return (isAtom(source) ? source : replayWithLatest(1, Data.of(source))) as ValidSource
      })
    }

    const length = preparedSources.length

    interface WrappedData<P> {
      id: number
      value: P | Vacuo
    }
    const wrapMutations = Array.from({ length }).map((_, idx) =>
      Mutation.ofLiftLeft<P, WrappedData<P>>(prev => ({ id: idx, value: prev }))
    )
    const wrappedDatas: Array<Data<WrappedData<P>>> = Array.from({ length }).map(() => Data.empty())

    const trunkM = Mutation.ofLift((() => {
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

    const output = Data.empty()

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
type ObjectMSTache<P, C> = (
  sources: Record<string, Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>>
) => Data<C>
/**
 * @param { ObjectMSTacheConfig<C> } config
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

  type ValidSource = Data<P> | DataMediator<Data<P>> | Mutation<any, P> | MutationMediator<Mutation<any, P>>
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
        if (!isAtom(source)) {
          throw (new TypeError('"source" is expected to be type of "Atom".'))
        }
      })
      preparedSources = sources
    } else {
      preparedSources = Object.entries(sources).reduce<Record<string, ValidSource>>(
        (newSources, [name, source]) => {
          newSources[name] = newSources[name] ?? (isAtom(source) ? source : replayWithLatest(1, Data.of(source)))
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
    const wrappedDatas = Object.entries(preparedSources).reduce<Record<string, Data<P>>>((datas, [key]) => {
      datas[key] = Data.empty()
      return datas
    }, {})

    const trunkM = Mutation.ofLift((() => {
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

    const output = Data.empty()

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

  type ValidSource = Data<any> | DataMediator<Data<any>> | Mutation<any, any> | MutationMediator<Mutation<any, any>>
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
      return createArrayMSTache(config as any)(...sources[0] as ValidSource[])
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
