import { isPlainObject, isArray, isFunction, isEmptyObj, isNil } from '../../internal/base'
import { looseCurryN } from '../../functional'
import { isAtom, Data } from '../atoms'
import { replayWithLatest } from '../mediators'
import { binaryTweenPipeAtom } from '../helpers'

import type { AtomLike, Mutation } from '../atoms'
import type { ReplayDataMediator, ReplayMutationMediator } from '../mediators'

export interface DriverOptions {
  [key: string]: any
}
export interface DriverLevelContexts {
  inputs?: { [key: string]: any }
  outputs?: { [key: string]: any }
  [key: string]: any
}
export interface SingletonLevelContexts {
  inputs?: { [key: string]: any }
  outputs?: { [key: string]: any }
  [key: string]: any
}

const DEFAULT_DRIVER_OPTIONS: DriverOptions = {}
const DEFAULT_DRIVER_LEVEL_CONTEXTS: DriverLevelContexts = { inputs: {}, outputs: {} }
const DEFAULT_SINGLETON_LEVEL_CONTEXTS: SingletonLevelContexts = { inputs: {}, outputs: {} }

type PrepareOptions = (options: DriverOptions) => DriverOptions
type PrepareDriverLevelContexts = () => DriverLevelContexts
type PrepareSingletonLevelContexts = (options: DriverOptions, driverLevelContexts: DriverLevelContexts) => SingletonLevelContexts
type PrepareInstance = (options: DriverOptions, driverLevelContexts: DriverLevelContexts, singletonLevelContexts: SingletonLevelContexts) => { [key: string]: any }

const defaultPrepareOptions: PrepareOptions = (options) => options
const defaultPrepareDriverLevelContexts: PrepareDriverLevelContexts = () => DEFAULT_DRIVER_LEVEL_CONTEXTS
const defaultPrepareSingletonLevelContexts: PrepareSingletonLevelContexts = (options, driverLevelContexts) => DEFAULT_SINGLETON_LEVEL_CONTEXTS
const defaultPrepareInstance: PrepareInstance = (options, driverLevelContexts, singletonLevelContexts) => ({ ...singletonLevelContexts })

export interface GeneralDriverCreateOptions {
  prepareOptions?: PrepareOptions
  prepareDriverLevelContexts?: PrepareDriverLevelContexts
  prepareSingletonLevelContexts?: PrepareSingletonLevelContexts
  prepareInstance: PrepareInstance
}

const DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS: Required<GeneralDriverCreateOptions> = {
  prepareOptions: defaultPrepareOptions,
  prepareDriverLevelContexts: defaultPrepareDriverLevelContexts,
  prepareSingletonLevelContexts: defaultPrepareSingletonLevelContexts,
  prepareInstance: defaultPrepareInstance
}

export interface DriverInterfaces {
  inputs?: { [key: string]: any }
  outputs?: { [key: string]: any }
}
export type DriverFactory = (options: DriverOptions) => DriverInterfaces

/**
 * @param { GeneralDriverCreateOptions | PrepareSingletonLevelContexts } createOptions
 * @return { DriverFactory } DriverFactory :: `(options?: {}) => { inputs: object, outputs: object }`
 */
export const createGeneralDriver = (
  createOptions: GeneralDriverCreateOptions | PrepareSingletonLevelContexts = DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS
): DriverFactory => {
  if (!isPlainObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError('"createOptions" is expected to be type of "PlainObject" | "Function".'))
  }
  if (isFunction(createOptions)) {
    createOptions = { ...DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS, prepareSingletonLevelContexts: createOptions }
  } else {
    createOptions = { ...DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS, ...createOptions }
  }

  const {
    prepareOptions, prepareDriverLevelContexts, prepareSingletonLevelContexts, prepareInstance
  } = createOptions as Required<GeneralDriverCreateOptions>

  const _driverLevelContexts = prepareDriverLevelContexts()
  if (!isPlainObject(_driverLevelContexts)) {
    throw (new TypeError('The returned value of "prepareDriverLevelContexts" is expected to be type of "PlainObject".'))
  }
  const preparedDriverLevelContexts = { ...DEFAULT_DRIVER_LEVEL_CONTEXTS, ...prepareDriverLevelContexts() }

  /**
   * @param { DriverOptions } [options = DEFAULT_DRIVER_OPTIONS] In order to clarify the role of each configuration item,
   *                                           the configuration is best to be in object format.
   * @return { DriverFactory } DriverFactory
   */
  const driverFactory = (options: DriverOptions = DEFAULT_DRIVER_OPTIONS): DriverInterfaces => {
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    const _options = prepareOptions(options)
    if (!isPlainObject(_options)) {
      throw (new TypeError('The returned value of "prepareOptions" is expected to be type of "PlainObject".'))
    }
    const preparedOptions = { ...DEFAULT_DRIVER_OPTIONS, ..._options }

    const _singletonLevelContexts = prepareSingletonLevelContexts(preparedOptions, preparedDriverLevelContexts)
    if (!isPlainObject(_singletonLevelContexts)) {
      throw (new TypeError('"singletonLevelContexts" is expected to be type of "PlainObject"'))
    }
    const preparedSingletomLevelContexts = { ...DEFAULT_SINGLETON_LEVEL_CONTEXTS, ..._singletonLevelContexts }

    const { inputs, outputs } = preparedSingletomLevelContexts
    if (!isPlainObject(inputs)) {
      throw (new TypeError('"inputs" returned as singletonLevelContexts is expected to be type of "PlainObject"'))
    }
    if (!isPlainObject(outputs)) {
      throw (new TypeError('"outputs" returned as singletonLevelContexts is expected to be type of "PlainObject"'))
    }

    const driverInterfaces = prepareInstance(preparedOptions, preparedDriverLevelContexts, preparedSingletomLevelContexts)

    return driverInterfaces
  }

  return driverFactory
}

const formatDriverInterfaces = (driverInterfaces: DriverInterfaces): DriverInterfaces => {
  if (!isPlainObject(driverInterfaces)) {
    throw (new TypeError('"driverInterfaces" is expected to be type of "PlainObject".'))
  }
  const { inputs: { ...inputs } = {}, outputs: { ...outputs } = {} } = driverInterfaces

  if (!isPlainObject(inputs)) {
    throw (new TypeError('"inputs" of interfaces is expected to be type of "PlainObject".'))
  }
  if (!isPlainObject(outputs)) {
    throw (new TypeError('"outputs" of interfaces is expected to be type of "PlainObject".'))
  }

  Object.entries(driverInterfaces).forEach(([key, value]) => {
    if (key !== 'inputs' && key !== 'outputs') {
      inputs[key] = value
    }
  })

  return { inputs: { ...inputs }, outputs: { ...outputs } }
}

interface IConnectDriverInterfaces {
  (up: AtomLike, down: any): void
  (up: any, down: AtomLike): void
  (up: Record<string, any>, down: Record<string, any>): void
  (up: any[], down: any[]): void
}
export const connectDriverInterfaces: IConnectDriverInterfaces = (up: any, down: any): void => {
  interface INormalize {
    <D extends Data<any>>(value: D): ReplayDataMediator<D>
    <D extends ReplayDataMediator<Data<any>>>(value: D): D
    <M extends Mutation<any, any>>(value: M): ReplayMutationMediator<M>
    <M extends ReplayMutationMediator<Mutation<any, any>>>(value: M): M
    <D>(value: D): Data<D>
  }
  const normalize: INormalize = (value: any): any => isAtom(value) ? replayWithLatest(1, value as any) : replayWithLatest(1, Data.of(value))

  // The up & down value are expected to be type of Atom,
  //   -> one of the up | down value is required to be type of Atom at least.
  //   -> cause there is no way to get the auto-generated down Atom.
  if (isAtom(up) && !isAtom(down)) {
    if (isArray(down)) {
      down.forEach(i => {
        if (isAtom(i)) {
          binaryTweenPipeAtom(normalize(up), i as AtomLike)
        } else {
          // do nothing
        }
      })
    } else {
      // do nothing
    }
  } else if (isAtom(up) && isAtom(down)) {
    // downstream atom do not need to be replayable
    binaryTweenPipeAtom(normalize(up), down as AtomLike)
  } else if (!isAtom(up) && isAtom(down)) {
    binaryTweenPipeAtom(normalize(up), down as AtomLike)
  } else if (isPlainObject(up) && isPlainObject(down)) {
    Object.entries(up).forEach(([key, value]) => {
      if (!isNil(down[key])) {
        connectDriverInterfaces(value, down[key])
      }
    })
  } else if (isArray<any>(up) && isArray<any>(down)) {
    up.forEach((value, idx) => {
      if (!isNil(down[idx])) {
        connectDriverInterfaces(value, down[idx])
      }
    })
  } else {
    throw (new TypeError(
      'The up interfaces & down interfaces are expected to be the type combinations as follows:' +
      ' (Atom, Any) | (Any, Atom) | (Object | Object) | (Array | Array).'
    ))
  }
}

/**
 * @param { DriverFactory } driverFactory
 * @param { DriverOptions } driverOptions
 * @param { DriverInterfaces } interfaces
 * @return { DriverInterfaces } driverInterfaces
 */
export const useGeneralDriver = (driver: DriverFactory, driverOptions: DriverOptions, interfaces: DriverInterfaces): DriverInterfaces => {
  const driverInterfaces = driver(driverOptions)

  const { inputs: { ...innerInputs } = {}, outputs: { ...innerOutputs } = {}, ...others } = { ...driverInterfaces }

  // 只有当 interfaces 是对象且不为空的时候，才执行 connect 逻辑
  if (isPlainObject(interfaces) && !isEmptyObj(interfaces)) {
    const { inputs: { ...outerInputs } = {}, outputs: { ...outerOutputs } = {} } = { ...formatDriverInterfaces(interfaces) }

    connectDriverInterfaces(outerInputs, innerInputs)
    connectDriverInterfaces(innerOutputs, outerOutputs)
  }

  return { inputs: innerInputs, outputs: innerOutputs, ...others }
}

/**
 * @param { DriverFactory } driverFactory
 * @param { DriverOptions } driverOptions
 * @param { DriverInterfaces } interfaces
 * @return { DriverInterfaces } driver
 */
export const useGeneralDriver_ = looseCurryN(3, useGeneralDriver)
