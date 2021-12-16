import {
  isUndefined, isString, isPlainObject, isObject
} from '../internal/base'
import {
  Data, isAtomLike,
  replayWithLatest,
  binaryTweenPipeAtom
} from '../atom'

import type { AnyFunction } from '../@types/index'

/*********************************************************************************************************************
 *
 *                                                   Predicate
 *
 *********************************************************************************************************************/

/**
 * @param tar anything
 * @return whether the target is a ScopeManager instance.
 */
export const isScopeManager = <Creator extends AnyFunction = AnyFunction>(tar: any): tar is ScopeManager<Creator> =>
  isObject(tar) && tar.isScopeManager

/*********************************************************************************************************************
 *
 *                                               ScopeManager Auxiliary
 *
 *********************************************************************************************************************/

/**
 *
 */
type ScopableCreator = AnyFunction

/**
 *
 */
interface ScopeManagerOptions {
  isStray?: boolean
  strayFlag?: string
}
const DEFAULT_SCOPE_MANAGER_CREATE_OPTIONS: Required<ScopeManagerOptions> = {
  isStray: false,
  strayFlag: undefined as any
}

interface InstanceGetOptions {
  acceptPromise?: boolean
}
const DEFAULT_GET_INSTANCE_OPTIONS: Required<InstanceGetOptions> = {
  acceptPromise: true
}

interface ScopableCreatorInfo {
  creator: ScopableCreator
  options: ScopeManagerOptions
}
/**
 * @structure `Map<[Creator | CreatorInfo], ScopeManager{ [scope]: Instance }>`
 */
const SCOPE_MANAGERS = new Map<ScopableCreatorInfo, ScopeManager<ScopableCreator>>()
const getScopeManager = <Creator extends ScopableCreator>(
  creator: Creator, options: Required<ScopeManagerOptions>
): ScopeManager<Creator> | undefined => {
  const info = { creator, options }
  let manager: ScopeManager<Creator> | undefined

  SCOPE_MANAGERS.forEach((value, key) => {
    if (
      key.creator === creator &&
      key.options.isStray === info.options.isStray &&
      key.options.strayFlag === info.options.strayFlag
    ) {
      // It is not necessary to check the duplicate key, `setScopeManager` ensures there is no duplicate key.
      manager = value as ScopeManager<Creator>
    }
  })

  return manager
}
const setScopeManager = <Creator extends ScopableCreator>(
  creator: Creator, options: Required<ScopeManagerOptions>, manager: ScopeManager<Creator>
): boolean => {
  const info = { creator, options }

  if (getScopeManager(creator, options) !== undefined) {
    console.error('ScopeManager already exists.', creator, options)
    throw (new Error(`ScopeManager already exists: { isStray: ${String(options.isStray)}, strayFlag: ${options.strayFlag} }.`))
  } else {
    SCOPE_MANAGERS.set(info, manager)
  }

  return true
}
const deleteScopeManager = <Creator extends ScopableCreator>(
  creator: Creator, options: Required<ScopeManagerOptions>
): boolean => {
  const info = { creator, options }
  let managerFound = false
  let deleteResult = false

  SCOPE_MANAGERS.forEach((value, key) => {
    if (
      key.creator === creator &&
        key.options.isStray === info.options.isStray &&
        key.options.strayFlag === info.options.strayFlag
    ) {
      managerFound = true
      deleteResult = SCOPE_MANAGERS.delete(key)
    }
  })

  if (!managerFound) {
    console.error('ScopeManager does not exist.', creator, options)
    throw (new Error(`ScopeManager does not exist: { isStray: ${String(options.isStray)}, strayFlag: ${options.strayFlag} }.`))
  }

  return deleteResult
}

/*********************************************************************************************************************
 *
 *                                                  Main ScopeManager
 *
 *********************************************************************************************************************/

/**
 *
 */
export class ScopeManager<Creator extends ScopableCreator> {
  private readonly _options: Required<ScopeManagerOptions>
  private readonly _creator: Creator
  private readonly _scopes: Map<string, ReturnType<Creator>>
  private readonly _promises: Map<string, Data<ReturnType<Creator>>>

  constructor (creator: Creator, options: ScopeManagerOptions = DEFAULT_SCOPE_MANAGER_CREATE_OPTIONS) {
    this._options = { ...DEFAULT_SCOPE_MANAGER_CREATE_OPTIONS, ...options }
    this._creator = creator
    this._scopes = new Map()
    this._promises = new Map()
  }

  get isScopeManager (): true { return true }

  get creator (): Creator { return this._creator }
  get options (): Required<ScopeManagerOptions> { return this._options }

  /**
   * Create a ScopeManager instance with given `creator` and `options`,
   *   put it in global `SCOPE_MANAGERS` map as well.
   */
  static of <Creator extends ScopableCreator>(
    creator: Creator, options: ScopeManagerOptions = DEFAULT_SCOPE_MANAGER_CREATE_OPTIONS
  ): ScopeManager<Creator> {
    if (!isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject".'))
    }

    const { isStray, strayFlag } = { ...DEFAULT_SCOPE_MANAGER_CREATE_OPTIONS, ...options }

    let manager: ScopeManager<Creator> | undefined

    if (isStray) {
      manager = new ScopeManager(creator, options)
      // `setScopeManager` Manager will do the duplicate check.
      setScopeManager(creator, { isStray, strayFlag }, manager)
    } else {
      manager = getScopeManager(creator, { isStray, strayFlag })
      if (manager === undefined) {
        manager = new ScopeManager(creator, options)
        setScopeManager(creator, { isStray, strayFlag }, manager)
      }
    }

    return manager
  }

  /**
   * @param scope scope name to be checked.
   * @return whether the given scope name is registered.
   */
  isRegistered (scope: string): boolean {
    return this._scopes.has(scope)
  }

  /**
   * @param scope scope name to be released.
   * @return whether the given scope name is successfully released.
   */
  releaseScope (scope: string): boolean {
    return this._scopes.delete(scope)
  }

  release (): boolean {
    this._scopes.clear()
    return deleteScopeManager(this._creator, this._options)
  }

  /**
   * Register an instance with given scope name & options,
   *   if there is none, create one,
   *   if there is one, just return it.
   */
  registerScope (scope: string, options?: { instance: ReturnType<Creator> }): ReturnType<Creator>
  registerScope (scope: string, options?: { params?: Parameters<Creator>[0] }): ReturnType<Creator>
  registerScope (
    scope: string, options: { instance?: ReturnType<Creator>, params?: Parameters<Creator>[0]} = {}
  ): ReturnType<Creator> {
    if (!isString(scope)) {
      throw (new TypeError('"scope" is required and is expected to be type of "String".'))
    }
    if (!isUndefined(options) && !isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject" when provided.'))
    }

    const { instance, params } = options

    let preparedParams
    if (isUndefined(params)) {
      preparedParams = { '@scopeName': scope }
    } else if (isPlainObject(params)) {
      preparedParams = { ...params, '@scopeName': scope }
    } else {
      preparedParams = params
    }

    let preparedInstance: ReturnType<Creator> | undefined
    preparedInstance = this._scopes.get(scope)
    // If there is no instance registered, create one.
    // Then check if there is a promise has been made, if so, trigger it
    if (preparedInstance === undefined) {
      // If `options.instance` is provided, use it directly, otherwise create one using `this._creator`.
      preparedInstance = instance ?? this._creator(preparedParams)
      this._scopes.set(scope, preparedInstance as ReturnType<Creator>)

      const promise = this._promises.get(scope)
      if (promise !== undefined) {
        if (isAtomLike(preparedInstance)) {
          binaryTweenPipeAtom(replayWithLatest(1, preparedInstance as any), promise)
        } else {
          binaryTweenPipeAtom(replayWithLatest(1, Data.of(preparedInstance)), promise)
        }
      }
    }

    return preparedInstance as ReturnType<Creator>
  }

  getInstance (scope: string): ReturnType<Creator> | Data<ReturnType<Creator>>
  getInstance (
    scope: string, options?: InstanceGetOptions & { acceptPromise: true }
  ): ReturnType<Creator> | Data<ReturnType<Creator>>
  getInstance (
    scope: string, options?: InstanceGetOptions & { acceptPromise: false }
  ): ReturnType<Creator> | undefined
  getInstance (
    scope: string, options: InstanceGetOptions = DEFAULT_GET_INSTANCE_OPTIONS
  ): ReturnType<Creator> | Data<ReturnType<Creator>> | undefined {
    if (!isString(scope)) {
      throw (new TypeError('"scope" is required and is expected to be type of "String".'))
    }
    if (!isUndefined(options) && !isPlainObject(options)) {
      throw (new TypeError('"options" is expected to be type of "PlainObject" when provided.'))
    }

    const { acceptPromise } = { ...DEFAULT_GET_INSTANCE_OPTIONS, ...options }

    const instance = this._scopes.get(scope)
    if (!isUndefined(instance)) return instance
    // instance is undefined, check if acceptPromise
    if (!acceptPromise) return undefined
    // no instance exists & acceptPromise, check if there is a promise has been made
    const promise = this._promises.get(scope)
    if (!isUndefined(promise)) return promise
    // no premake promise, create one
    this._promises.set(scope, Data.empty())
    return this._promises.get(scope)
  }

  /**
   * Synchronously get an instance with given scope name.
   */
  scope (scope: string, params?: Parameters<Creator>[0]): ReturnType<Creator> {
    // Invoking `registerScope` first ensures that the instance is created.
    this.registerScope(scope, { params })
    // So the `getInstance` is guaranteed to return a instance instead of Promise.
    return this.getInstance(scope) as ReturnType<Creator>
  }
}
