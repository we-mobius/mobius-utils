import {
  isString, isPlainObject, isFunction
} from '../internal'
import {
  Data, isAtomLike,
  replayWithLatest,
  binaryTweenPipeAtom
} from '../atom'

type ScopeManagerCreator = (...args: any[]) => any | any
interface ScopeManagerCreateOptions {
  isStray?: boolean
  strayFlag?: string
}
interface GetInstanceOptions {
  acceptPromise?: boolean
}
export interface ScopeManager<Creator extends ScopeManagerCreator> {
  getCreator: () => Creator
  getOptions: () => ScopeManagerCreateOptions
  isRegisteredScope: (scope: string) => boolean
  releaseScope: (scope: string) => boolean
  releaseManager: () => boolean

  registerScope: <Instance extends any>(
    scope: string, options: { instance?: Instance, params?: Parameters<Creator>[0]}
  ) => ReturnType<Creator> | Creator | Instance

  getInstance: (scope: string, options?: GetInstanceOptions) => any
  scope: (scope: string, params?: Parameters<Creator>[0]) => any
}

/**
 * Map{
 *   [Creator | CreatorInfo]: ScopeManager{
 *     [scope]: Instance,
 *     ...
 *   },
 *   ...
 * }
 */
const SCOPE_MANAGERS = new Map()

/**
 * @param creator
 * @param options
 * @return ScopeManager
 */
const createScopeManager = <Creator extends ScopeManagerCreator>(
  creator: Creator, options: ScopeManagerCreateOptions
): ScopeManager<Creator> => {
  const scopeMap = new Map()
  const promiseMap = new Map()

  return {
    getCreator: () => creator,
    getOptions: () => options,
    isRegisteredScope: scope => scopeMap.get(scope) !== undefined,
    releaseScope: scope => scopeMap.delete(scope),
    releaseManager: () => {
      const { isStray = false, strayFlag } = options
      if (isStray) {
        let res = false
        // TODO: strayFlay 同名检测
        SCOPE_MANAGERS.forEach((val, key) => {
          if (!res && key.flag === strayFlag) {
            res = SCOPE_MANAGERS.delete(key)
          }
        })
        return res
      } else {
        return SCOPE_MANAGERS.delete(creator)
      }
    },

    /**
     * register an instance with given scope,
     * if there is none, create one,
     * if there is one, just return it.
     *
     * @param scope
     * @param [options] can be omitted when the type of scope is Object
     * @return instance
     */
    registerScope: function (scope, options) {
      if (!isString(scope)) {
        throw (new TypeError('"scope" is required and is expected to be type of "String".'))
      }
      if (options !== undefined && !isPlainObject(options)) {
        throw (new TypeError('"options" is expected to be type of "Object" when provided.'))
      }

      let { instance: _instance, params = { '@scopeName': scope } } = options ?? {}

      if (isPlainObject(params)) {
        params = { ...params, '@scopeName': scope }
      }

      let instance = scopeMap.get(scope)

      // If there is no instance registered, create one.
      // Then check if there is a promise has been made, if so, trigger it
      if (instance === undefined) {
        instance = _instance ?? (isFunction(creator) ? creator(params) : creator)
        scopeMap.set(scope, instance)

        const promise = promiseMap.get(scope)
        if (promise !== undefined) {
          if (isAtomLike(instance)) {
            binaryTweenPipeAtom(replayWithLatest(1, instance as any), promise)
          } else {
            binaryTweenPipeAtom(replayWithLatest(1, Data.of(instance)), promise)
          }
        }
      }

      return instance
    },

    /**
     * @param scope
     * @param [options]
     * @return instance | Atom of instance
     */
    getInstance: function (scope, options = {}) {
      if (!isString(scope)) {
        throw (new TypeError('"scope" is required and is expected to be type of "String".'))
      }
      if (!isPlainObject(options)) {
        throw (new TypeError('"options" is expected to be type of "PlainObject".'))
      }

      const { acceptPromise = true } = options

      const instance = scopeMap.get(scope)
      if (instance !== undefined) return instance
      if (!acceptPromise) return false
      // no instance exists & acceptPromise
      const promise = promiseMap.get(scope)
      if (promise !== undefined) return promise
      promiseMap.set(scope, Data.empty())
      return promiseMap.get(scope)
    },

    // ! use function declaration to keep "this" context
    /**
     * Same as pipe(registerScope, getInstance)
     */
    scope: function (scope, params) {
      this.registerScope(scope, { params })
      return this.getInstance(scope)
    }
  }
}

/**
 * Make and return a ScopeManager.
 *
 * @param creator scope manager creator
 * @param [options.isStray = false]
 * @param [options.strayFlag]
 * @return { ScopeManager } ScopeManager
 * @todo TODO: strayFlay 同名检测
 */
export const makeScopeManager = <Creator extends ScopeManagerCreator>(
  creator: Creator, options: ScopeManagerCreateOptions = {}
): ScopeManager<Creator> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const { isStray = false, strayFlag } = options

  let manager

  if (isStray) {
    // TODO: strayFlay 同名检测
    manager = createScopeManager(creator, options)
    SCOPE_MANAGERS.set({ creator, options: { isStray, strayFlag }, flag: strayFlag }, manager)
  } else {
    manager = SCOPE_MANAGERS.get(creator)
    if (manager === undefined) {
      manager = createScopeManager(creator, options)
      SCOPE_MANAGERS.set(creator, manager)
    }
  }

  return manager
}
