import { isPlainObject, isArray, isFunction, isEmptyObj, isNil } from '../../internal/base'
import { looseCurryN } from '../../functional'
import { isAtomLike, Data } from '../atoms'
import { replayWithLatest } from '../mediators'
import { binaryTweenPipeAtom } from '../helpers'

import type { AnyStringRecord } from '../../@types'
import type { AtomLike, Mutation, AtomLikeOfOutput, AtomLikeOfInput } from '../atoms'
import type { ReplayDataMediator, ReplayMutationMediator } from '../mediators'

/************************************************************************************************
 *
 *                                    Main Types & Functions
 *
 ************************************************************************************************/

/**
 *
 */
export interface DriverOptions extends AnyStringRecord {
}
export interface DriverLevelContexts extends AnyStringRecord {
  inputs?: AnyStringRecord
  outputs?: AnyStringRecord
}
export interface DriverSingletonLevelContexts extends AnyStringRecord {
  inputs?: AnyStringRecord
  outputs?: AnyStringRecord
}
export interface DriverInstance extends AnyStringRecord {
  inputs?: AnyStringRecord
  outputs?: AnyStringRecord
}

export const DEFAULT_DRIVER_OPTIONS: Required<DriverOptions> = {}
export const DEFAULT_DRIVER_LEVEL_CONTEXTS: Required<DriverLevelContexts> = { inputs: {}, outputs: {} }
export const DEFAULT_SINGLETON_LEVEL_CONTEXTS: Required<DriverSingletonLevelContexts> = { inputs: {}, outputs: {} }

type PrepareDriverSingletonLevelContexts<
  Options extends DriverOptions = DriverOptions,
  DLC extends DriverLevelContexts = DriverLevelContexts,
  DSLC extends DriverSingletonLevelContexts = DriverSingletonLevelContexts
> =
  (options: Options, driverLevelContexts: DLC) => DSLC

export interface GeneralDriverCreateOptions<
  Options extends DriverOptions = DriverOptions,
  DLC extends DriverLevelContexts = DriverLevelContexts,
  DSLC extends DriverSingletonLevelContexts = DriverSingletonLevelContexts,
  Instance extends DriverInstance = DriverInstance
> {
  defaultOptions?: Options
  prepareOptions?: (options: Options) => Options
  prepareDriverLevelContexts?: () => DLC
  prepareSingletonLevelContexts?: PrepareDriverSingletonLevelContexts<Options, DLC, DSLC>
  prepareInstance?: (
    options: Options,
    driverLevelContexts: DLC,
    singletonLevelContexts: DSLC
  ) => Instance
}

const DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS: Required<GeneralDriverCreateOptions<any, any, any, any>> = {
  defaultOptions: DEFAULT_DRIVER_OPTIONS,
  prepareOptions: (options) => options,
  prepareDriverLevelContexts: () => DEFAULT_DRIVER_LEVEL_CONTEXTS,
  prepareSingletonLevelContexts: (options, driverLevelContexts) => DEFAULT_SINGLETON_LEVEL_CONTEXTS,
  prepareInstance: (options, driverLevelContexts, singletonLevelContexts) => ({ ...singletonLevelContexts })
}

export type DriverMaker<
  Options extends DriverOptions = DriverOptions, Instance extends DriverInstance = DriverInstance
> = (options?: Options) => Instance

/**
 * @param createOptions
 * @return { DriverMaker } DriverFactory :: `(options?: {}) => { inputs: object, outputs: object }`
 */
export const createGeneralDriver = <
  Options extends DriverOptions = DriverOptions,
  DLC extends DriverLevelContexts = DriverLevelContexts,
  DSLC extends DriverSingletonLevelContexts = DriverSingletonLevelContexts,
  Instance extends DriverInstance = DriverInstance
>(
    createOptions: GeneralDriverCreateOptions<Options, DLC, DSLC, Instance> |
    PrepareDriverSingletonLevelContexts<Options, DLC, DSLC> = DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS
  ): DriverMaker<Options, Instance> => {
  if (!isPlainObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError('"createOptions" is expected to be type of "PlainObject" | "Function".'))
  }
  let preparedCreateOptions: Required<GeneralDriverCreateOptions<Options, DLC, DSLC, Instance>>
  if (isFunction(createOptions)) {
    preparedCreateOptions = { ...DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS, prepareSingletonLevelContexts: createOptions }
  } else {
    preparedCreateOptions = { ...DEFAULT_GENERAL_DRIVER_CREATE_OPTIONS, ...createOptions }
  }

  const {
    defaultOptions, prepareOptions, prepareDriverLevelContexts, prepareSingletonLevelContexts, prepareInstance
  } = preparedCreateOptions

  const _driverLevelContexts = prepareDriverLevelContexts()
  if (!isPlainObject(_driverLevelContexts)) {
    throw (new TypeError('The returned value of "prepareDriverLevelContexts" is expected to be type of "PlainObject".'))
  }
  const preparedDriverLevelContexts = {
    ...DEFAULT_DRIVER_LEVEL_CONTEXTS, ..._driverLevelContexts
  }

  /**
   * @param options In order to clarify the role of each configuration item,
   *                the configuration is best to be in object format.
   * @return { DriverMaker } DriverFactory
   */
  const driverFactory = (options: Options = defaultOptions): Instance => {
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    const preparedOptions = prepareOptions({ ...defaultOptions, ...options })
    if (!isPlainObject(preparedOptions)) {
      throw (new TypeError('The returned value of "prepareOptions" is expected to be type of "PlainObject".'))
    }

    const _singletonLevelContexts = prepareSingletonLevelContexts(preparedOptions, preparedDriverLevelContexts)
    if (!isPlainObject(_singletonLevelContexts)) {
      throw (new TypeError('"singletonLevelContexts" is expected to be type of "PlainObject"'))
    }
    const preparedSingletonLevelContexts = {
      ...DEFAULT_SINGLETON_LEVEL_CONTEXTS, ..._singletonLevelContexts
    }

    const { inputs, outputs } = preparedSingletonLevelContexts
    if (!isPlainObject(inputs)) {
      throw (new TypeError('"inputs" returned as singletonLevelContexts is expected to be type of "PlainObject"'))
    }
    if (!isPlainObject(outputs)) {
      throw (new TypeError('"outputs" returned as singletonLevelContexts is expected to be type of "PlainObject"'))
    }

    const driverInterfaces = prepareInstance(preparedOptions, preparedDriverLevelContexts, preparedSingletonLevelContexts)

    return driverInterfaces
  }

  return driverFactory
}

const formatDriverInterfaces = (driverInterfaces: DriverInstance): DriverInstance => {
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
    <V>(value: Data<V>): ReplayDataMediator<V>
    <D extends ReplayDataMediator<Data<any>>>(value: D): D
    <P, C>(value: Mutation<P, C>): ReplayMutationMediator<P, C>
    <M extends ReplayMutationMediator<any, any>>(value: M): M
    <D>(value: D): Data<D>
  }
  const normalize: INormalize = (value: any): any => isAtomLike(value) ? replayWithLatest(1, value as any) : replayWithLatest(1, Data.of(value))

  // The up & down value are expected to be type of Atom,
  //   -> one of the up | down value is required to be type of Atom at least.
  //   -> cause the developer is no way to get the auto-generated down Atom, and it makes no sense.
  if (isAtomLike(up) && !isAtomLike(down)) {
    if (isArray(down)) {
      down.forEach(i => {
        if (isAtomLike(i)) {
          binaryTweenPipeAtom(normalize(up), i)
        } else {
          // do nothing
        }
      })
    } else {
      // do nothing
    }
  } else if (isAtomLike(up) && isAtomLike(down)) {
    // downstream atom do not need to be replayable
    binaryTweenPipeAtom(normalize(up), down)
  } else if (!isAtomLike(up) && isAtomLike(down)) {
    binaryTweenPipeAtom(normalize(up), down)
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

type ConnectedInputsRecord<Target> = {
  [K in keyof Target]+?: Target[K] extends AtomLikeOfOutput<infer V> ? V | AtomLikeOfOutput<V> : never
}
type ConnectedInputs<Target> = {
  [K in keyof Target]+?: Target[K] extends AtomLikeOfOutput<infer V> ? (
    V | AtomLikeOfOutput<V>
  ) : Target[K] extends AnyStringRecord | undefined ? (
    ConnectedInputsRecord<NonNullable<Target[K]>>
  ) : (Target[K] | AtomLikeOfOutput<Target[K]>)
}
type ConnectedOutputs<Target> = {
  [K in keyof Target]+?: Target[K] extends AtomLikeOfOutput<infer V> ? AtomLikeOfInput<V> : never
}
type ConnectedInterfacesOf<Instance extends DriverInstance = DriverInstance> = {
  [K in keyof Instance]+?: K extends 'inputs' ?
    ConnectedInputs<Instance[K]> : K extends 'outputs' ?
      ConnectedOutputs<Instance[K]> : any
}

/**
 * @return A simple copy of the driver instance, plainobject has `inputs`, `outputs` or others.
 */
export const useGeneralDriver = <Options extends DriverOptions = DriverOptions, Instance extends DriverInstance = DriverInstance>(
  driver: DriverMaker<Options, Instance>, driverOptions: Options | undefined, interfaces: ConnectedInterfacesOf<Instance>
): Instance => {
  const driverInterfaces = driver(driverOptions)

  const { inputs: { ...innerInputs } = {}, outputs: { ...innerOutputs } = {}, ...others } = { ...driverInterfaces }

  // 只有当 interfaces 是对象且不为空的时候，才执行 connect 逻辑
  if (isPlainObject(interfaces) && !isEmptyObj(interfaces)) {
    const { inputs: { ...outerInputs } = {}, outputs: { ...outerOutputs } = {} } = { ...formatDriverInterfaces(interfaces) }

    // outer inputs as upstream, send data to inner inputs
    //   -> inner inputs as downstream, receive data from outer inputs
    connectDriverInterfaces(outerInputs, innerInputs)
    // inner outputs as upstream, send data to outer outputs
    //   -> outer outputs as downstream, receive data from inner outputs
    connectDriverInterfaces(innerOutputs, outerOutputs)
  }

  // return a simple copy of driver instance
  const returnedDriver = { inputs: innerInputs, outputs: innerOutputs, ...others } as unknown as Instance
  return returnedDriver
}

export interface IPartialUseGeneralDriver_<
  Options extends DriverOptions = DriverOptions, Instance extends DriverInstance = DriverInstance
> {
  (driverOptions: Options | undefined, interfaces: ConnectedInterfacesOf<Instance>): Instance
  (driverOptions: Options | undefined): (interfaces: ConnectedInterfacesOf<Instance>) => Instance
}
export interface IUseGeneralDriver_ {
  // pass all three arguments at one time
  <Options extends DriverOptions = DriverOptions, Instance extends DriverInstance = DriverInstance>(
    driver: DriverMaker<Options, Instance>, driverOptions: Options | undefined, interfaces: ConnectedInterfacesOf<Instance>
  ): Instance
  // pass first two arguments then rest one, first two at one time
  <Options extends DriverOptions = DriverOptions, Instance extends DriverInstance = DriverInstance>
  (driver: DriverMaker<Options, Instance>, driverOptions: Options | undefined): (interfaces: ConnectedInterfacesOf<Instance>) => Instance
  // pass all three arguments one by one
  // or pass first argument then rest two, rest two at one time
  <Options extends DriverOptions = DriverOptions, Instance extends DriverInstance = DriverInstance>
  (driver: DriverMaker<Options, Instance>): IPartialUseGeneralDriver_<Options, Instance>
}
/**
 * @see {@link useGeneralDriver}
 */
export const useGeneralDriver_: IUseGeneralDriver_ = looseCurryN(3, useGeneralDriver)
