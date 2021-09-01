import {
  isString, isObject, isArray, isFunction
} from '../internal.js'
import {
  Data, isAtom,
  replayWithLatest,
  binaryTweenPipeAtom
} from '../atom.js'

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
 * @param { object | function } creator
 * @param { object? } options
 * @return ScopeManager
 */
const createScopeManager = (creator, options) => {
  if (!creator) throw (new TypeError('"creator" is required!'))
  const scopeMap = new Map()
  const promiseMap = new Map()

  return {
    getCreator: () => creator,
    getOptions: () => options,

    /**
     * @param { string } scope
     * @return { boolean } given scope is registered or not
     */
    isRegisteredScope: scope => !!scopeMap.get(scope),

    /**
     * @param { string } scope
     * @return { boolean }
     */
    releaseScope: scope => {
      return scopeMap.delete(scope)
    },
    releaseManager: () => {
      const { isStray, strayFlag } = options
      if (isStray) {
        let res = false
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
     * @param { string | object } scope
     * @param { { instance?, params? }? } options can be omitted when the type of scope is Object
     *
     * @accept ({ scope, instance?, params? })
     * @accept (scope, { instance?, params? })
     *
     * @return instance
     */
    registerScope: (scope, options) => {
      let _scope, _instance, _params
      // accept ({ scope, instance?, params? })
      if (isObject(scope)) {
        _instance = scope.instance
        _params = scope.params
        _scope = scope.scope
      } else if (isString(scope)) {
        // accept (scope, { instance?, params? })
        _scope = scope
        if (options && !isObject(options)) {
          throw (new TypeError(`"options" is expected to be type of "Object" when "scope" is of type "String", but received "${typeof options}".`))
        }
        if (isObject(options)) {
          _instance = options.instance
          _params = options.params
        }
      } else {
        throw (new TypeError(`first argument of registerScope is expected to be type of "String" | "Object", but received "${typeof scope}".`))
      }

      if (!isString(_scope)) throw (new TypeError(`"scope" is required and is expected to be type of "String", but received "${typeof _scope}".`))
      if (!creator && !_instance) throw (new TypeError('One of "creator" and "instance" is required at least.'))
      if (isObject(_params)) {
        _params = { ..._params, '@scopeName': _scope }
      }

      let instance = scopeMap.get(_scope)

      // If there is no instance registered, create one.
      // Then check if there is a promise has been made, if so, trigger it
      if (!instance) {
        instance = _instance ||
         (isFunction(creator)
           ? (_params ? creator(_params) : creator({ '@scopeName': _scope }))
           : creator
         )
        scopeMap.set(_scope, instance)

        const promise = promiseMap.get(_scope)
        if (promise) {
          if (isAtom(instance)) {
            binaryTweenPipeAtom(replayWithLatest(1, instance), promise)
          } else {
            binaryTweenPipeAtom(replayWithLatest(1, Data.of(instance)), promise)
          }
        }
      }

      return instance
    },

    /**
     * @param { string | object } scope
     * @param { { acceptPromise?: true }? }options
     *
     * @accept accept ({ scope, options | ...options })
     * @accept accept (scope, options? )
     *
     * @return instance | Atom of instance
     */
    getInstance: (scope, options = {}) => {
      // accept ({ scope, options | ...options })
      const _scope = isObject(scope) ? scope.scope : scope
      if (!isString(_scope)) {
        throw (new TypeError(`"scope" is required and is expected to be type of "String", but received "${typeof _scope}".`))
      }

      if (isObject(scope)) {
        if (!scope.options) {
          options = Object.assign({}, scope)
          delete options.scope
        } else {
          options = scope.options
        }
      } else if (isString(scope)) {
        options = options || {}
      }

      if (!isObject(options)) {
        throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
      }

      const { acceptPromise = true } = options

      const instance = scopeMap.get(_scope)
      if (instance) return instance
      if (!acceptPromise) return false
      const promise = promiseMap.get(_scope)
      if (promise) return promise
      const _promise = Data.empty()
      promiseMap.set(_scope, _promise)
      return _promise
    },

    // ! use function declaration to keep "this" context
    /**
     * registerScope -> getInstance
     */
    scope: function (scope, params) {
      this.registerScope(scope, { params })
      return this.getInstance(scope)
    }
  }
}

/**
 * @param creator Any
 * @param { { isStray?: false, strayFlag?: string } } options
 * @return ScopeManager
 */
export const makeScopeManager = (creator, options = {}) => {
  if (!isObject(options)) {
    throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
  }

  const { isStray = false, strayFlag } = options

  let manager

  if (isStray) {
    manager = createScopeManager(creator, options)
    SCOPE_MANAGERS.set({ creator, options: { isStray, strayFlag }, flag: strayFlag }, manager)
  } else {
    manager = SCOPE_MANAGERS.get(creator)
    if (!manager) {
      manager = createScopeManager(creator, options)
      SCOPE_MANAGERS.set(creator, manager)
    }
  }

  return manager
}
