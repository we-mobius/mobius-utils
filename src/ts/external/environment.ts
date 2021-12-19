/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction } from '../internal/base'

// @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis

// wx only exists in miniprogram
const globalWX = typeof wx === undefined ? wx : undefined
const nodeGlobal = typeof global === undefined ? global : undefined

/**
 * Predicate whether the enviroment is Wexin Mini Program (MINA: MINA is not App).
 * NOTE: typeof operator can operate on non-exist variable.
 *
 * @check `wx`, `wx.canIUse`
 */
export const isInWXMINAEnvironment = (): boolean => (typeof globalWX !== 'undefined') && isFunction(globalWX.canIUse)
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
  window: Window
  document: Document
}
export interface NodeEnvContexts extends CommonContexts {
  global: NodeJS.Global
}
export interface WXMINAEnvContexts extends CommonContexts {
  wxmina: WechatMiniprogram.Wx
}
export interface DefaultEnvContexts extends CommonContexts { }

export const WEB_ENV_CONTEXTS: WebEnvContexts = { globalThis, window, document }
export const NODE_ENV_CONTEXTS: NodeEnvContexts = { globalThis, global: nodeGlobal as NodeJS.Global }
export const WXMINA_ENV_CONTEXTS: WXMINAEnvContexts = { globalThis, wxmina: globalWX as WechatMiniprogram.Wx }
export const DEFAULT_ENV_CONTEXTS: DefaultEnvContexts = { globalThis }

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
