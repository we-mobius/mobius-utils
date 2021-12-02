import { isPlainObject, isString } from '../../internal/base'
import { curryN } from '../../functional'

import type { AtomLikeOfOutput } from '../atoms'

/**
 * Do something with the target, then pass target through.
 */
export const tapT = <T>(effect: (target: T) => void, target: T): T => {
  effect(target)
  return target
}
interface ITapT_ {
  <T>(effect: (target: T) => void, target: T): T
  <T>(effect: (target: T) => void): (target: T) => T
}
/**
 * @see {@link tapT}
 */
export const tapT_: ITapT_ = curryN(2, tapT)

const levelDict = {
  LOG: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  0: 'log',
  1: 'info',
  2: 'warn',
  3: 'error'
} as const
type Level = keyof typeof levelDict
/**
 * @see {@link tapT}
 */
export const tapValueT = <V extends AtomLikeOfOutput<any>>(
  name: string | { name?: string, level: Level },
  target: V
): V => {
  return tapT((target: V) => {
    let initName: string
    let initLevel: Level

    if (isPlainObject(name)) {
      initName = name.name ?? 'tapLogValueT'
      initLevel = name.level
    } else if (isString(name)) {
      initName = name
      initLevel = 'LOG'
    } else {
      throw (new TypeError('"name" is expected to be type of "String" | "PlainObject".'))
    }

    const consoleLevel = levelDict[initLevel]
    const colorDict = {
      log: '#30CFCF', // cyan
      info: '#3030CF', // blue
      warn: '#CF8030', // orange
      error: '#CF3030' // red
    }
    target.subscribe(({ value }: any) => {
      let stringified = ''
      try {
        stringified = JSON.stringify(value)
      } catch (e) {
      // do nothing
      }
      console[consoleLevel](
      `%c ${consoleLevel.toUpperCase()} %c ${initName}: %c ${value as string} %c`,
      `background: ${colorDict[consoleLevel]}; padding: 1px; border-radius: 3px 0 0 3px; color: #FFFFFF;`,
      'background: #6600FF; padding: 1px; border-radius: 0 0 0 0; color: #FFFFFF;',
      'background: #66FF00; padding: 1px 10px; border-radius: 0 3px 3px 0; color: #000000;',
      'background: transparent; color: #00000;', value, stringified
      )
    })
  }, target)
}
interface ITapValueT_ {
  <V extends AtomLikeOfOutput<any>>(name: string | { name?: string, level: Level }, target: V): V
  <V extends AtomLikeOfOutput<any>>(name: string | { name?: string, level: Level}): (target: V) => V
}
/**
 * @see {@link tapValueT}
 */
export const tapValueT_: ITapValueT_ = curryN(2, tapValueT)
