import { isString, isArray, isObject, isFunction } from '../../internal.js'
import { looseCurryN } from '../../functional.js'
import { TERMINATOR } from '../meta.js'
import { Data, Mutation, isAtom } from '../atom.js'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers.js'
import { replayWithLatest } from '../mediators.js'

// S -> Single, M -> Multi

const DEFAULT_MUTATION_OPTIONS = { liftType: 'both' }

/**
 * @param { {} | function } createOptions
 * @return { function }
 */
export const createGeneralTache = looseCurryN(2, (createOptions = {}, tacheOptions = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError(`"createOptions" is expected to be type of "Object" | "Function", but received "${typeof createOptions}".`))
  }
  if (isFunction(createOptions)) {
    createOptions = { prepareMidpiece: createOptions }
  }

  const {
    prepareTacheLevelContexts = () => ({}),
    prepareOptions = options => options,
    prepareInput = (_0, _1, source) => source,
    prepareMidpiece = () => Mutation.ofLiftBoth(any => any),
    prepareOutput = () => Data.empty(),
    connect = (options, [inputs, midpieces, outputs]) => {
      pipeAtom(midpieces, outputs)
      binaryTweenPipeAtom(inputs, midpieces)
    }
  } = createOptions

  const tacheLevelContexts = prepareTacheLevelContexts()
  if (!isObject(tacheLevelContexts)) {
    throw (new TypeError(`"tacheLevelContexts" is expected to be type of "Object", but received "${typeof tacheLevelContexts}".`))
  }

  if (!isObject(tacheOptions)) {
    throw (new TypeError(`"tacheOptions" is expected to be type of "Object", but received "${typeof tacheOptions}".`))
  }
  tacheOptions = prepareOptions(tacheOptions)

  if (!isObject(tacheOptions)) {
    throw (new TypeError(`The returned value of "prepareOptions" is expected to be type of "Object", but received "${typeof tacheOptions}".`))
  }

  return (...sources) => {
    const inputs = prepareInput(tacheOptions, tacheLevelContexts, sources.length > 1 ? sources : sources[0])
    const midpieces = prepareMidpiece(tacheOptions, tacheLevelContexts, inputs)
    const outputs = prepareOutput(tacheOptions, tacheLevelContexts, midpieces)
    connect(tacheOptions, tacheLevelContexts, [inputs, midpieces, outputs])
    return outputs
  }
})
/**
 * @param { function } tacheMaker partial applied createGeneralTache
 */
export const useGeneralTache = looseCurryN(3, (tacheMaker, tacheOptions, ...sources) => {
  const tache = tacheMaker(tacheOptions)
  const outputs = sources.length > 1 ? tache(...sources) : tache(sources[0])
  return outputs
})

/**
 * @param { function | object }  operation
 * @param { ?{ type?: string } } options which type is LiftType the operation will use
 * @accept ({ operation, options? })
 * @accept (operation, options?)
 * @return TacheMaker
 */
export const createSSTache = (operation, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  // @accept ({ operation, options? })
  if (isObject(operation) && operation.operation) {
    options = operation.options ? { ...DEFAULT_MUTATION_OPTIONS, ...operation.options } : { ...DEFAULT_MUTATION_OPTIONS }
    operation = operation.operation
  }

  if (!isFunction(operation)) {
    throw (new TypeError(`"operation" is expected to be type of "Function", but received ${typeof operation}.`))
  }

  const { liftType = 'both' } = options

  /**
   * @param { Atom }target
   * @return { Data }
   */
  return target => {
    if (!isAtom(target)) {
      throw (new TypeError('"target" is expected to be type of "Atom".'))
    }

    const mutation = Mutation.ofLift(operation, { liftType })
    const outputD = Data.empty()

    pipeAtom(mutation, outputD)
    binaryTweenPipeAtom(target, mutation)

    return outputD
  }
}

/**
 * @accept ({}) -> ({ name: { operation, options? } | operation, ...})
 * @accept ([]) -> ([{ operation, options? } | operation ...])
 * @accept (...) -> ({ operation, options? } | operation, ...)
 * @return TacheMaker
 */
export const createSMTache = (...args) => {
  if (args.length === 1 && isObject(args[0])) {
    return createObjectSMTache(args[0])
  }
  if (args.length === 1 && isArray(args[0])) {
    return createArraySMTache(...args[0])
  }
  if (args.length > 1) {
    return createArraySMTache(...args)
  }
}

/**
 * @accept ({ operation, options? } | operation, ...)
 * @accept ([{ operation, options? } | operation ...])
 * @return TacheMaker
 */
export const createArraySMTache = (...configArr) => {
  // @accept ([{ operation, options? } | operation ...])
  if (configArr.length === 1 && isArray(configArr[0])) {
    configArr = configArr[0]
  }

  configArr = configArr.map(config => {
    let operation, options

    if (isObject(config) && config.operation) {
      // @accept config -> { operation, options? }
      options = config.options ? { ...DEFAULT_MUTATION_OPTIONS, ...config.options } : { ...DEFAULT_MUTATION_OPTIONS }
      operation = config.operation
    } else if (isFunction(config)) {
      // @accept config -> operation
      options = { ...DEFAULT_MUTATION_OPTIONS }
      operation = config
    } else {
      throw (new TypeError(`"config" is expected to be type of "Object" | "Function", but received ${typeof config}.`))
    }

    if (!isFunction(operation)) {
      throw (new TypeError(`"operation" is expected to be type of "Function", but received ${typeof config}.`))
    }

    return { operation, options }
  })

  /**
   * @param target Atom
   * @return Array of Data
   */
  return target => {
    if (!isAtom(target)) {
      throw (new TypeError('"target" is expected to be type of "Atom".'))
    }

    const mutations = configArr.map(({ operation, options }) => {
      const { liftType = 'both' } = options
      return Mutation.ofLift(operation, { liftType })
    })
    const outputs = Array.from({ length: configArr.length }).map(() => Data.empty())

    outputs.forEach((output, index) => {
      pipeAtom(mutations[index], output)
      binaryTweenPipeAtom(target, mutations[index])
    })

    return outputs
  }
}

/**
 * @param { {} } configObj
 * @accept ({ name: { operation, options? } | operation, ...})
 * @return TacheMaker
 */
export const createObjectSMTache = (configObj) => {
  if (!isObject(configObj)) {
    throw (new TypeError(`"configObj" is expected to be type of "Object", but received ${typeof configObj}.`))
  }

  configObj = Object.entries(configObj).reduce((acc, [name, config]) => {
    let operation, options

    if (isObject(config) && config.operation) {
      options = config.options ? { ...DEFAULT_MUTATION_OPTIONS, ...config.options } : { ...DEFAULT_MUTATION_OPTIONS }
      operation = config.operation
    } else if (isFunction(config)) {
      options = { ...DEFAULT_MUTATION_OPTIONS }
      operation = config
    } else {
      throw (new TypeError(`"config" is expected to be type of "Object" | "Function", but received ${typeof config}.`))
    }

    if (!isFunction(operation)) {
      throw (new TypeError(`"operation" is expected to be type of "Function", but received ${typeof config}.`))
    }

    acc[name] = acc[name] || { operation, options }

    return acc
  }, {})

  /**
   * @param target Atom
   * @return Object of Data
   */
  return target => {
    if (!isAtom(target)) {
      throw (new TypeError('"target" is expected to be type of "Atom".'))
    }

    const mutations = Object.entries(configObj).reduce((acc, [name, { operation, options }]) => {
      const { liftType = 'both' } = options
      acc[name] = acc[name] || Mutation.ofLift(operation, { liftType })
      return acc
    }, {})

    const outputs = Object.entries(configObj).reduce((acc, [name]) => {
      acc[name] = acc[name] || Data.empty()
      return acc
    }, {})

    Object.entries(outputs).forEach(([name, output]) => {
      pipeAtom(mutations[name], output)
      binaryTweenPipeAtom(target, mutations[name])
    })

    return outputs
  }
}

/**
 * @param { ?{ sourcesType?: 'Array' | "Object" } } config
 * @return TacheMaker
 */
export const createMSTache = (config = {}) => {
  if (!isObject(config)) {
    throw (new TypeError(`"config" is expected to be type of "Object", but received "${typeof config}".`))
  }

  const { sourcesType } = config
  if (sourcesType.toLowerCase() === 'array') {
    return createArrayMSTache(config)
  }
  if (sourcesType.toLowerCase() === 'object') {
    return createObjectMSTache(config)
  }

  /**
   * @accept ({ name: Atom | Any, ...})
   * @accept ([Atom | Any, ...])
   * @accept (Atom | Any, ...)
   * @return Data
   */
  return (...sources) => {
    if (sources.length === 1 && isObject(sources[0])) {
      return createObjectMSTache(config)(sources[0])
    }
    if (sources.length === 1 && isArray(sources[0])) {
      return createArrayMSTache(config)(...sources[0])
    }
    if (sources.length > 1) {
      return createArraySMTache(config)(...sources)
    }
  }
}

/**
 * @param { ?{
 *   numberOfSources?: number,
 *   acceptNonAtom?: boolean,
 *   opCustomizeType?: 'fully' | 'partly',
 *   opLiftType?: 'both' | 'left' | 'right',
 *   operation: function,
 *   autoUpdateContexts?: boolean
 * } } config
 * @return TacheMaker
 */
export const createArrayMSTache = (config = {}) => {
  if (!isObject(config)) {
    throw (new TypeError(`"config" is expected to be type of "Object", but received ${typeof config}.`))
  }

  const {
    numberOfSources = undefined, acceptNonAtom = true,
    opCustomizeType = 'partly', opLiftType = 'both', operation, autoUpdateContexts = true
  } = config

  if (!isString(opCustomizeType)) {
    throw (new TypeError(`"opCustomizeType" is expected to be type of "String", but received "${typeof opCustomizeType}".`))
  }
  if (opCustomizeType.toLowerCase() !== 'partly' && opCustomizeType.toLowerCase() !== 'fully') {
    throw (new TypeError(`"opCustomizeType" is expected to be "fully" | "partly", but received "${opCustomizeType}".`))
  }
  if (operation === undefined) {
    throw (new TypeError('"operation" is required when use makeArrayMSTache to make tache.'))
  }
  if (!isFunction(operation)) {
    throw (new TypeError(`"operation" is expected to be type of "Function", but received ${typeof operation}.`))
  }

  /**
   * @accept (Atom, ...)
   * @accept ([Atom, ...])
   * @return Data
   */
  const tache = (...sources) => {
    if (!acceptNonAtom) {
      sources.forEach(source => {
        if (!isAtom(source)) {
          throw (new TypeError(`"source" is expected to be type of "Atom", but received ${typeof source}.`))
        }
      })
    } else {
      sources = sources.map(source => {
        return isAtom(source) ? source : replayWithLatest(1, Data.of(source))
      })
    }

    const length = sources.length

    const wrapMutations = Array.from({ length }).map((val, idx) =>
      Mutation.ofLiftLeft(prev => ({ id: idx, value: prev }))
    )
    const wrappedDatas = Array.from({ length }).map(() => Data.empty())

    const trunkM = Mutation.ofLift((() => {
      const baseContexts = { numberOfSources: length, TERMINATOR }

      if (opCustomizeType.toLowerCase() === 'fully') {
        const contexts = { ...baseContexts }
        const actualOperation = operation(contexts)
        if (!isFunction(actualOperation)) {
          throw (new TypeError('"operation" is expected to return a "Function" when "opCustomizeType" is specified to "fully".'))
        }
        return actualOperation
      }
      if (opCustomizeType.toLowerCase() === 'partly') {
        const contexts = {
          ...baseContexts,
          states: Array.from({ length: length }),
          values: Array.from({ length: length })
        }
        // actual operation which will takes prevDatar(or its value) & datar(ot its value) as argument
        return (prev, cur, mutation, ...args) => {
          if (autoUpdateContexts) {
            const { id, value } = prev
            contexts.states[id] = true
            contexts.values[id] = value
          }
          return operation(prev, cur, mutation, contexts, ...args)
        }
      }
    })(), { liftType: opLiftType })

    const output = Data.empty()

    pipeAtom(trunkM, output)
    wrappedDatas.forEach(data => {
      pipeAtom(data, trunkM)
    })
    wrapMutations.forEach((wrapMutation, idx) => {
      pipeAtom(wrapMutation, wrappedDatas[idx])
    })
    sources.forEach((source, idx) => {
      binaryTweenPipeAtom(source, wrapMutations[idx])
    })

    return output
  }

  if (numberOfSources) {
    return looseCurryN(numberOfSources, tache)
  } else {
    return (...sources) => {
      if (sources.length === 1 && isArray(sources[0])) {
        sources = sources[0]
      }
      return tache(...sources)
    }
  }
}

/**
 * @param { ?{
 *   acceptNonAtom?: boolean,
 *   opCustomizeType?: 'fully' | 'partly',
 *   opLiftType?: 'both' | 'left' | 'right',
 *   operation: function,
 *   autoUpdateContexts?: boolean
 * } }config
 * @return TacheMaker
 */
export const createObjectMSTache = (config = {}) => {
  if (!isObject(config)) {
    throw (new TypeError(`"config" is expected to be type of "Object", but received "${typeof config}".`))
  }

  const {
    acceptNonAtom = true,
    opCustomizeType = 'partly', opLiftType = 'both', operation, autoUpdateContexts = true
  } = config

  if (!isString(opCustomizeType)) {
    throw (new TypeError(`"opCustomizeType" is expected to be type of "String", but received "${typeof opCustomizeType}".`))
  }
  if (opCustomizeType.toLowerCase() !== 'partly' && opCustomizeType.toLowerCase() !== 'fully') {
    throw (new TypeError(`"opCustomizeType" is expected to be "fully" | "partly", but received "${opCustomizeType}".`))
  }
  if (operation === undefined) {
    throw (new TypeError('"operation" is required when use makeObjectMSTache to make tache.'))
  }
  if (!isFunction(operation)) {
    throw (new TypeError(`"operation" is expected to be type of "Function", but received "${typeof operation}".`))
  }

  /**
   * @param sources Object
   * @accept ({ name: Atom | Any, ...})
   * @return Data
   */
  const tache = (sources) => {
    if (!isObject(sources)) {
      throw (new TypeError(`"sources" is expected to be type of "Object", but received "${typeof sources}".`))
    }

    if (!acceptNonAtom) {
      Object.values(sources).forEach(source => {
        if (!isAtom(source)) {
          throw (new TypeError(`"source" is expected to be type of "Atom", but received "${typeof source}".`))
        }
      })
    } else {
      sources = Object.entries(sources).reduce((newSources, [name, source]) => {
        newSources[name] = newSources[name] || (isAtom(source) ? source : replayWithLatest(1, Data.of(source)))
        return newSources
      }, {})
    }

    const wrapMutations = Object.entries(sources).reduce((mutations, [key]) => {
      mutations[key] = Mutation.ofLiftLeft((prev) => ({ key: key, value: prev }))
      return mutations
    }, {})
    const wrappedDatas = Object.entries(sources).reduce((datas, [key]) => {
      datas[key] = Data.empty()
      return datas
    }, {})

    const trunkM = Mutation.ofLift((() => {
      const baseContexts = { keysOfSources: Object.keys(sources), TERMINATOR }

      if (opCustomizeType.toLowerCase() === 'fully') {
        const contexts = { ...baseContexts }
        const actualOperation = operation(contexts)
        if (!isFunction(actualOperation)) {
          throw (new TypeError('"operation" is expected to return a "Function" when "opCustomizeType" is specified to "fully".'))
        }
        return actualOperation
      }
      if (opCustomizeType.toLowerCase() === 'partly') {
        const contexts = {
          ...baseContexts,
          states: Object.keys(sources).reduce((acc, key) => {
            acc[key] = false
            return acc
          }, {}),
          values: Object.keys(sources).reduce((acc, key) => {
            acc[key] = undefined
            return acc
          }, {})
        }
        // actual operation which will takes prevDatar(or its value) & datar(ot its value) as argument
        return (prev, cur, mutation, ...args) => {
          if (autoUpdateContexts) {
            const { key, value } = prev
            contexts.states[key] = true
            contexts.values[key] = value
          }
          return operation(prev, cur, mutation, contexts, ...args)
        }
      }
    })(), { liftType: opLiftType })

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

// TODO: waiting for suitable usage scenarios
export const createMMTache = () => {
  throw (new Error('makeMMTache to be developed.'))
}
