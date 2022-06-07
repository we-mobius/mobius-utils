/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, isObject } from '../internal/base'

import type { EmptyInterface } from '../@types'

// @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis

// wx only exists in miniprogram
// NOTE: hack to specify the expected type to safeTarget
const safeWX =
  (typeof wx !== 'undefined') ? wx : (undefined as WechatMiniprogram.Wx | undefined)
const safeGlobal =
  (typeof global !== 'undefined') ? global : (undefined as (typeof globalThis) | undefined)
const safeWindow =
  (typeof window !== 'undefined') ? window : (undefined as (Window & typeof globalThis) | undefined)
const safeDocument =
  (typeof document !== 'undefined') ? document : (undefined as Document | undefined)
const safeFetch =
  (typeof fetch !== 'undefined') ? fetch : (undefined as typeof fetch | undefined)
const safeProcess =
  (typeof process !== 'undefined') ? process : (undefined as NodeJS.Process | undefined)

/**
 *
 */
export type EnvironmentUnion = 'wxmina' | 'web' | 'node' | 'unknown'

/**
 * Predicate whether the enviroment is Wexin Mini Program (MINA: MINA is not App).
 * NOTE: `typeof` operator can operate on non-exist variable.
 *
 * @check `wx`, `wx.canIUse`
 */
export const isInWXMINAEnvironment = (): boolean => isObject(safeWX) && isFunction(safeWX.canIUse)
/**
 * Predicate whether the enviroment is Web.
 *
 * @check `document`, `window`
 */
export const isInWebEnvironment = (): boolean => typeof document === 'object' && typeof window === 'object'
/**
 * Predicate whether the enviroment is Browser.
 *
 * @check `document`, `window`
 *
 * @see {@link isInWebEnvironment}
 */
export const isInBrowserEnvironment = isInWebEnvironment
/**
 * Predicate whether the enviroment is Node.js.
 *
 * @check `global`, `process`
 */
export const isInNodeEnvironment = (): boolean => typeof global !== 'undefined' && typeof process !== 'undefined'

interface CommonContexts {
  globalThis: typeof globalThis
}
export interface WebEnvContexts extends CommonContexts {
  window: Window & typeof globalThis
  document: Document
  fetch: typeof fetch
}
export interface NodeEnvContexts extends CommonContexts {
  global: typeof globalThis
  process: typeof process
}
export interface WXMINAEnvContexts extends CommonContexts {
  wxmina: WechatMiniprogram.Wx
}
export interface DefaultEnvContexts extends CommonContexts { }

export const WEB_ENV_CONTEXTS: WebEnvContexts = {
  globalThis,
  window: safeWindow as (Window & typeof globalThis),
  document: safeDocument as Document,
  fetch: safeFetch as typeof fetch
}
export const NODE_ENV_CONTEXTS: NodeEnvContexts = {
  globalThis,
  global: safeGlobal as (typeof globalThis),
  process: safeProcess as NodeJS.Process
}
export const WXMINA_ENV_CONTEXTS: WXMINAEnvContexts = {
  globalThis,
  wxmina: safeWX as WechatMiniprogram.Wx
}
export const DEFAULT_ENV_CONTEXTS: DefaultEnvContexts = {
  globalThis
}

export interface MultipleEnvironmentsAdaptions<R = any> {
  forWeb: (contexts: WebEnvContexts) => R
  forNode: (contexts: NodeEnvContexts) => R
  forWXMINA: (contexts: WXMINAEnvContexts) => R
  forDefault: (contexts: DefaultEnvContexts) => R
}

export interface AsyncMultipleEnvironmentsAdaptions<R = any> {
  forWeb: (contexts: WebEnvContexts) => R | Promise<R>
  forNode: (contexts: NodeEnvContexts) => R | Promise<R>
  forWXMINA: (contexts: WXMINAEnvContexts) => R | Promise<R>
  forDefault: (contexts: DefaultEnvContexts) => R | Promise<R>
}

/**
 * (sync version of adaptMultiPlatformAsync) Run different function according to the environment.
 *
 * @see {@link adaptMultipleEnvironmentsAsync}
 */
export const adaptMultipleEnvironments = <R = any>(adaptions: Partial<MultipleEnvironmentsAdaptions<R>>): R => {
  const { forWeb, forNode, forWXMINA, forDefault } = adaptions

  if (isInWebEnvironment() && isFunction(forWeb)) {
    return forWeb(WEB_ENV_CONTEXTS)
  } else if (isInNodeEnvironment() && isFunction(forNode)) {
    return forNode(NODE_ENV_CONTEXTS)
  } else if (isInWXMINAEnvironment() && isFunction(forWXMINA)) {
    return forWXMINA(WXMINA_ENV_CONTEXTS)
  } else if (isFunction(forDefault)) {
    return forDefault(DEFAULT_ENV_CONTEXTS)
  } else {
    throw (new TypeError('No adaptions found, please provide at least one of "forWeb", "forNode", "forWXMINA", "forDefault".'))
  }
}

/**
 * (async version of adaptMultiPlatform) Run different function according to the environment.
 *
 * @see {@link adaptMultipleEnvironments}
 */
export const adaptMultipleEnvironmentsAsync = async <R = any>(adaptions: Partial<AsyncMultipleEnvironmentsAdaptions<R>>): Promise<R> => {
  const { forWeb, forNode, forWXMINA, forDefault } = adaptions
  if (isInWebEnvironment() && isFunction(forWeb)) {
    return await Promise.resolve(forWeb(WEB_ENV_CONTEXTS))
  } else if (isInNodeEnvironment() && isFunction(forNode)) {
    return await Promise.resolve(forNode(NODE_ENV_CONTEXTS))
  } else if (isInWXMINAEnvironment() && isFunction(forWXMINA)) {
    return await Promise.resolve(forWXMINA(WXMINA_ENV_CONTEXTS))
  } else if (isFunction(forDefault)) {
    return await Promise.resolve(forDefault(DEFAULT_ENV_CONTEXTS))
  } else {
    throw (new TypeError('No adaptions found, please provide at least one of "forWeb", "forNode", "forWXMINA", "forDefault".'))
  }
}

type ParsersOfVariables<Variables> = {
  [K in keyof Variables]?: (value: string) => Variables[K]
}
interface EnvironmentVariableManagerOptions<Variables> {
  variables?: Variables
  parsers?: ParsersOfVariables<Variables>
}
const DEFAULT_ENVIRONMENT_VARIABLE_MANAGER_OPTIONS: Required<EnvironmentVariableManagerOptions<any>> = {
  variables: {},
  parsers: {}
}
/**
 * 用于以类型安全的方式获取环境变量。
 *
 * @example
 * interface ENV {
 *   DATABASE: string
 *   URL: string
 * }
 * const appEnvironmentVariableManager = EnvironmentVariableManager.of<ENV>()
 * const database = appEnvironmentVariableManager.get('DATABASE') // success
 * const name = appEnvironmentVariableManager.get('NAME') // type check passed
 * const safeName = appEnvironmentVariableManager.safeGet('NAME') // type check error
 */
export class EnvironmentVariableManager<Variables extends EmptyInterface = EmptyInterface> {
  _variables: Variables
  _parsers: ParsersOfVariables<Variables>

  constructor (options: EnvironmentVariableManagerOptions<Variables> = DEFAULT_ENVIRONMENT_VARIABLE_MANAGER_OPTIONS) {
    const { variables, parsers } = {
      ...DEFAULT_ENVIRONMENT_VARIABLE_MANAGER_OPTIONS as Required<EnvironmentVariableManagerOptions<Variables>>,
      ...options
    }
    this._variables = { ...variables }
    this._parsers = { ...parsers }
    this.resetVariables()
  }

  resetVariables (): void {
    adaptMultipleEnvironments({
      forNode: ({ process }) => {
        const _emptyVariables = {} as any as Variables
        this._variables = Object.entries(process.env).reduce<Variables>((accumulatedVariables, [key, value]) => {
          const _key = key as keyof Variables
          const _value = value as string
          if (accumulatedVariables[_key] === undefined) {
            const parser = this._parsers[_key]
            if (parser === undefined) {
              accumulatedVariables[_key] = _value as unknown as Variables[keyof Variables]
            } else {
              accumulatedVariables[_key] = parser(_value)
            }
          }
          return accumulatedVariables
        }, _emptyVariables)
      },
      forDefault: ({ globalThis }) => {
        this._variables = (globalThis as any).env ?? {}
      }
    })
  }

  get variables (): Variables { return this._variables }

  static of<Variables extends EmptyInterface = EmptyInterface> (
    options: EnvironmentVariableManagerOptions<Variables> = DEFAULT_ENVIRONMENT_VARIABLE_MANAGER_OPTIONS
  ): EnvironmentVariableManager<Variables> {
    return new EnvironmentVariableManager(options)
  }

  /**
   * Get the value of the environment variable.
   *
   * @see {@link safeGet}, {@link recklessGet}
   */
  get<Key extends keyof Variables> (key: Key): Variables[Key] | undefined {
    return this._variables[key]
  }

  /**
   * Get the value of the environment variable.
   * @see {@link get}, {@link safeGet}
   */
  recklessGet<Key extends keyof Variables> (key: Key): Variables[Key] {
    return this._variables[key]
  }

  /**
   * Get the value of the environment variable.
   * When the target key is not exist in variables, an error will be thrown.
   *
   * @see {@link get}, {@link recklessGet}
   */
  safeGet<Key extends keyof Variables> (key: Key): Variables[Key] {
    if (this._variables[key] === undefined) {
      throw (new Error(`Environment variable "${key.toString()}" is not defined.`))
    }
    return this._variables[key]
  }
}
