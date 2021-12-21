import { Biutor } from './base.request'
import { WebFetchRequestEngine } from './engine__fetch.request'
import { WXRequestEngine } from './engine__wx.request'

/**
 * Register default engines.
 */
export const initializeBiutor = (): void => {
  Biutor.registerGlobalEngine(WebFetchRequestEngine, { isForceReplace: true })
  Biutor.registerGlobalEngine(WXRequestEngine, { isForceReplace: true })
}
