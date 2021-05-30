import { isObject, isArray, isFunction } from '../../internal.js'
import { looseCurryN } from '../../functional.js'
import { isAtom, Data } from '../atom.js'
import { replayWithLatest } from '../mediators.js'
import { binaryTweenPipeAtom } from '../helpers.js'

/**
 * @param { {
 *   prepareOptions?: ((options: object) => object),
 *   prepareDriverLevelContexts?: (() => object),
 *   prepareSingletonLevelContexts?: ((options: object, driverLevelContexts: object) => object),
 *   prepareInstance: (options: object, driverLevelContexts: object, singletonLevelContexts: object) => { inputs: object, outputs: object }
 * } | function } createOptions
 * @return { (options?: {}) => { inputs: object, outputs: object } } Driver
 */
export const createGeneralDriver = (createOptions = {}) => {
  if (!isObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError(`"createOptions" is expected to be type of "Object" | "Function", but received "${typeof createOptions}".`))
  }
  if (isFunction(createOptions)) {
    createOptions = { prepareSingletonLevelContexts: createOptions }
  }

  const {
    prepareOptions = options => options,
    prepareDriverLevelContexts = () => ({}),
    prepareSingletonLevelContexts = _ => ({}),
    prepareInstance = (_0, _1, singletonLevelContexts) => ({ ...singletonLevelContexts })
  } = createOptions

  if (!isFunction(prepareOptions)) {
    throw (new TypeError(`"prepareOptions" is expected to be type of "Function", but received "${typeof prepareOptions}".`))
  }
  if (!isFunction(prepareDriverLevelContexts)) {
    throw (new TypeError(`"prepareDriverLevelContexts" is expected to be type of "Function", but received "${typeof prepareDriverLevelContexts}".`))
  }
  if (!isFunction(prepareSingletonLevelContexts)) {
    throw (new TypeError(`"prepareSingletonLevelContexts" is expected to be type of "Function", but received "${typeof prepareSingletonLevelContexts}".`))
  }
  if (!isFunction(prepareInstance)) {
    throw (new TypeError(`"prepareInstance" is expected to be type of "Function", but received "${typeof prepareInstance}".`))
  }

  const driverLevelContexts = prepareDriverLevelContexts()
  if (!isObject(driverLevelContexts)) {
    throw (new TypeError(`"driverLevelContexts" is expected to be type of "Object", but received "${typeof driverLevelContexts}"`))
  }

  /**
   * @param { object? } options In order to clarify the role of each configuration item,
   *                            the configuration is best to be in object format.
   * @return { { inputs: object, outputs: object } } DriverInterfaces
   */
  const driver = (options = {}) => {
    if (!isObject(options)) {
      throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
    }

    options = prepareOptions(options)
    if (!isObject(options)) {
      throw (new TypeError(`The returned value of "prepareOptions" is expected to be type of "Object", but received "${typeof options}".`))
    }

    const singletonLevelContexts = prepareSingletonLevelContexts(options, driverLevelContexts)
    if (!isObject(singletonLevelContexts)) {
      throw (new TypeError(`"singletonLevelContexts" is expected to be type of "Object", but received "${typeof singletonLevelContexts}"`))
    }

    const { inputs = {}, outputs = {} } = singletonLevelContexts
    if (!isObject(inputs)) {
      throw (new TypeError(`"inputs" returned as singletonLevelContexts is expected to be type of "Object", but received "${typeof inputs}"`))
    }
    if (!isObject(outputs)) {
      throw (new TypeError(`"outputs" returned as singletonLevelContexts is expected to be type of "Object", but received "${typeof outputs}"`))
    }

    const driverInterfaces = prepareInstance(options, driverLevelContexts, singletonLevelContexts)

    return driverInterfaces
  }

  return driver
}

const formatInterfaces = interfaces => {
  if (!isObject(interfaces)) {
    throw (new TypeError(`"interfaces" is expected to be type of "Object", but received "${typeof interfaces}"`))
  }
  const { inputs: { ...inputs } = {}, outputs: { ...outputs } = {} } = interfaces

  if (!isObject(inputs)) {
    throw (new TypeError(`"inputs" of interfaces is expected to be type of "Object", but received "${typeof inputs}"`))
  }
  if (!isObject(outputs)) {
    throw (new TypeError(`"outputs" of interfaces is expected to be type of "Object", but received "${typeof outputs}"`))
  }

  Object.entries(interfaces).forEach(([key, value]) => {
    if (key !== 'inputs' && key !== 'outputs') {
      inputs[key] = value
    }
  })

  return { inputs: { ...inputs }, outputs: { ...outputs } }
}

export const connectInterfaces = (up, down) => {
  const normalize = value => isAtom(value) ? replayWithLatest(1, value) : replayWithLatest(1, Data.of(value))

  // The up & down value are expected to be type of Atom,
  //   -> one of the up | down value is required to be type of Atom at least.
  //   -> cause there is no way to get the auto-generated down Atom.
  if (isAtom(up) && !isAtom(down)) {
    if (isArray(down)) {
      down.forEach(i => {
        if (isAtom(i)) {
          binaryTweenPipeAtom(normalize(up), i)
        } else {
          // do nothing
        }
      })
    } else {
      // do nothing
    }
  } else if (isAtom(up) && isAtom(down)) {
    // downstream atom do not need to be replayable
    binaryTweenPipeAtom(normalize(up), down)
  } else if (!isAtom(up) && isAtom(down)) {
    binaryTweenPipeAtom(normalize(up), down)
  } else if (isObject(up) && isObject(down)) {
    Object.entries(up).forEach(([key, value]) => {
      if (down[key]) {
        connectInterfaces(value, down[key])
      }
    })
  } else if (isArray(up) && isArray(down)) {
    up.forEach((value, idx) => {
      if (down[idx]) {
        connectInterfaces(value, down[idx])
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
 * @param { function } driver
 * @param { { } } driverOptions
 * @param { { inputs?: object, outputs?: object } } interfaces
 * @return { { inputs: object, outputs: object, ... } }
 */
export const useGeneralDriver = looseCurryN(3, (driver, driverOptions, interfaces) => {
  const driverInterfaces = driver(driverOptions)

  const { inputs: { ...innerInputs } = {}, outputs: { ...innerOutputs } = {}, ...others } = { ...driverInterfaces }
  const { inputs: { ...outerInputs } = {}, outputs: { ...outerOutputs } = {} } = { ...formatInterfaces(interfaces) }

  connectInterfaces(outerInputs, innerInputs)
  connectInterfaces(innerOutputs, outerOutputs)

  return { inputs: innerInputs, outputs: innerOutputs, ...others }
})
