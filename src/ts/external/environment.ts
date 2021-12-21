/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction, isObject } from '../internal/base'

// @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis

// wx only exists in miniprogram
// NOTE: hack to specify the expected type to safeTarget
const safeWX =
  (typeof wx !== 'undefined') ? wx : (undefined as WechatMiniprogram.Wx | undefined)
const safeGlobal =
  typeof global !== 'undefined' ? global : (undefined as (typeof globalThis) | undefined)
const safeWindow =
  typeof window !== 'undefined' ? window : (undefined as (Window & typeof globalThis) | undefined)
const safeDocument =
  typeof document !== 'undefined' ? document : (undefined as Document | undefined)
const safeFetch =
  typeof fetch !== 'undefined' ? fetch : (undefined as typeof fetch | undefined)

/**
 *
 */
export type EnvironmentUnion = 'wxmina' | 'web' | 'node' | 'unknown'

/**
 * Predicate whether the enviroment is Wexin Mini Program (MINA: MINA is not App).
 * NOTE: typeof operator can operate on non-exist variable.
 *
 * @check `wx`, `wx.canIUse`
 */
export const isInWXMINAEnvironment = (): boolean =>
  isObject(safeWX) && isFunction(safeWX.canIUse)
/**
 * Predicate whether the enviroment is Web.
 *
 * @check `document`, `window`
 */
export const isInWebEnvironment = (): boolean => typeof document === 'object' && typeof window === 'object'
/**
 * Predicate whether the enviroment is Browser.
 *
 * @check `document`
 */
export const isInBrowserEnvironment = isInWebEnvironment
/**
 * Predicate whether the enviroment is Node.js.
 *
 * @check `global`
 */
export const isInNodeEnvironment = (): boolean => typeof global !== 'undefined'

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
  globalThis, global: safeGlobal as (typeof globalThis)
}
export const WXMINA_ENV_CONTEXTS: WXMINAEnvContexts = {
  globalThis, wxmina: safeWX as WechatMiniprogram.Wx
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
