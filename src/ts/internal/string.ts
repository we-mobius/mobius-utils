import { invoker, curry } from '../functional/helpers'

export const toString = invoker(1, 'toString')
export const toLowerCase = invoker(1, 'toLowerCase')
export const toUpperCase = invoker(1, 'toUpperCase')
export const trim = invoker(1, 'trim')
export const trimRight = invoker(1, 'trimRight')
export const trimLeft = invoker(1, 'trimLeft')
export const indexOf = invoker(2, 'indexOf')
export const split = invoker(2, 'split')
export const replace = invoker(3, 'replace')

export const isStartWith = curry((substr, str) => indexOf(substr, str) === 0)

export const isAllSpace = (str: string): boolean => trim(str) === ''

const _randomPacket: { [key: number]: string[] } = {}
export const randomString = curry((length: number, chars: string): string => {
  let result = ''
  chars = chars ?? '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  _randomPacket[length] = _randomPacket[length] ?? []
  const packet = _randomPacket[length]
  if (packet.includes(result)) {
    return randomString(length, chars)
  } else {
    packet.push(result)
    return result
  }
})
