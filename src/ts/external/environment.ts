/* eslint-disable @typescript-eslint/no-explicit-any */

import { isFunction } from '../internal/base'

// reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis

// @ts-expect-error wx only exists in miniprogram
const globalWX = typeof wx === undefined ? wx : undefined
const nodeGlobal = typeof global === undefined ? global : undefined

/**
 * Judge whether the enviroment is Wexin Mini Program (MINA: MINA is not App).
 * NOTE: typeof operator can operate on non-exist variable.
 * @check `wx`, `wx.canIUse`
 */
export const isInWXMINA = (): boolean => (typeof globalWX !== 'undefined') && globalWX.canIUse
/**
 * Judge whether the enviroment is Web.
 * @check `document`, `window`
 */
export const isInWeb = (): boolean => typeof document === 'object' && typeof window === 'object'
/**
 * Judge whether the enviroment is Browser.
 * @check `document`
 */
export const isInBrowser = isInWeb
/**
 * Judge whether the enviroment is Node.js.
 * @check `global`
 */
export const isInNode = (): boolean => typeof global !== 'undefined'

interface CommonContexts {
  globalThis: typeof globalThis
}
export interface WebContexts extends CommonContexts {
  document: Document
}
export interface NodeContexts extends CommonContexts {
  global?: NodeJS.Global
}
export interface WXMINAContexts extends CommonContexts {
  wxmina: typeof globalWX
}
export interface DefaultContexts extends CommonContexts { }

export interface MultiPlatformAdaptions {
  forWeb: (contexts: WebContexts) => any
  forNode: (contexts: NodeContexts) => any
  forWXMINA: (contexts: WXMINAContexts) => any
  forDefault: (contexts: DefaultContexts) => any
}

/**
 * (sync version of adaptMultiPlatformAsync) Run different function according to the environment.
 */
export const adaptMultiPlatform = (adaptions: Partial<MultiPlatformAdaptions>): any => {
  const { forWeb, forNode, forWXMINA, forDefault } = adaptions

  if (isInWeb() && isFunction(forWeb)) {
    return forWeb({ globalThis, document })
  } else if (isInNode() && isFunction(forNode)) {
    return forNode({ globalThis, global: nodeGlobal })
  } else if (isInWXMINA() && isFunction(forWXMINA)) {
    return forWXMINA({ globalThis, wxmina: globalWX })
  } else if (isFunction(forDefault)) {
    return forDefault({ globalThis })
  } else {
    throw (new TypeError('No adaptions found, please provide at least one of "forWeb", "forNode", "forWXMINA", "forDefault".'))
  }
}

/**
 * (async version of adaptMultiPlatform) Run different function according to the environment.
 */
export const adaptMultiPlatformAsync = async (adaptions: Partial<MultiPlatformAdaptions>): Promise<any> => {
  const { forWeb, forNode, forWXMINA, forDefault } = adaptions
  if (isInWeb() && isFunction(forWeb)) {
    return await Promise.resolve(forWeb({ globalThis, document }))
  } else if (isInNode() && isFunction(forNode)) {
    return await Promise.resolve(forNode({ globalThis, global: nodeGlobal }))
  } else if (isInWXMINA() && isFunction(forWXMINA)) {
    return await Promise.resolve(forWXMINA({ globalThis, wxmina: globalWX }))
  } else if (isFunction(forDefault)) {
    return await Promise.resolve(forDefault({ globalThis }))
  } else {
    throw (new TypeError('No adaptions found, please provide at least one of "forWeb", "forNode", "forWXMINA", "forDefault".'))
  }
}
