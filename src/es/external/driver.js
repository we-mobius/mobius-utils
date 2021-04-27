import { isFunction } from '../internal.js'
import { isObject } from '../internal/base.js'

/**
 * @param { {
 *   prepareOptions?: ((_) => _),
 *   prepareDriverLevelContexts?: ((options: object) => {}),
 *   prepareSingletonLevelContexts?: ((options: object) => {}),
 *   main: (options, driverLevelContexts: object, singletonLevelContexts: object) => { inputs: object, outputs: object }
 * } }
 * @return { (options?: {}) => { inputs: object, outputs: object } } Driver
 */
export const makeGeneralDriver = ({
  prepareOptions = _ => _,
  prepareDriverLevelContexts = _ => {},
  prepareSingletonLevelContexts = _ => {},
  main
} = {}) => {
  if (!isFunction(prepareOptions)) {
    throw (new TypeError(`"prepareOptions" is expected to be type of "Function", but received "${typeof prepareOptions}".`))
  }
  if (!isFunction(prepareDriverLevelContexts)) {
    throw (new TypeError(`"prepareDriverLevelContexts" is expected to be type of "Function", but received "${typeof prepareDriverLevelContexts}".`))
  }
  if (!isFunction(prepareSingletonLevelContexts)) {
    throw (new TypeError(`"prepareSingletonLevelContexts" is expected to be type of "Function", but received "${typeof prepareSingletonLevelContexts}".`))
  }
  if (!isFunction(main)) {
    throw (new TypeError(`"main" is expected to be type of "Function", but received "${typeof main}".`))
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

    const driverLevelContexts = prepareDriverLevelContexts(options)
    const singletonLevelContexts = prepareSingletonLevelContexts(options, driverLevelContexts)

    const driverInterfaces = main(options, driverLevelContexts, singletonLevelContexts)

    return driverInterfaces
  }

  return driver
}
