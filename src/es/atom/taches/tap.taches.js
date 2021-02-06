import { isNumber } from '../../internal.js'
import { curryN } from '../../functional.js'

/**
 * @param effect Function
 * @param atom Atom
 */
export const tapT = curryN(2, (effect, atom) => {
  effect(atom)
  return atom
})

/**
 * @param name String? ""
 * @param level String? "LOG"(0) | "INFO"(1) | "WARN"(2) | "ERROR"(3)
 * @return tap Tache
 */
export const tapValueT = (name = '', level = 0) => tapT(atom => {
  if (isNumber(name)) {
    level = name
    name = ''
  }
  const levelDict = {
    LOG: 'log',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    0: 'log',
    1: 'info',
    2: 'warn',
    3: 'error'
  }
  level = levelDict[level]
  const colorDict = {
    log: '#30CFCF', // cyan
    info: '#3030CF', // blue
    warn: '#CF8030', // orange
    error: '#CF3030' // red
  }
  atom.subscribe(({ value }) => {
    let stringified = ''
    try {
      stringified = JSON.stringify(value)
    } catch (e) {
      // do nothing
    }
    console[level](
      `%c ${level.toUpperCase()} %c ${name || 'tapLogValueT'}` + ': %c' + value + '%c',
      `background: ${colorDict[level]}; padding: 1px; border-radius: 3px 0 0 3px; color: #FFFFFF;`,
      'background: #6600FF; padding: 1px; border-radius: 0 0 0 0; color: #FFFFFF;',
      'background: #66FF00; padding: 1px 10px; border-radius: 0 3px 3px 0; color: #000000;',
      'background: transparent; color: #00000;', value, stringified
    )
  })
  return atom
})
