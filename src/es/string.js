import { invoker } from './functional.js'

export const toString = invoker(1, 'toString')
export const toLowerCase = invoker(1, 'toLowerCase')
export const toUpperCase = invoker(1, 'toUpperCase')
export const trim = invoker(1, 'trim')
export const trimRight = invoker(1, 'trimRight')
export const trimLeft = invoker(1, 'trimLeft')
export const indexOf = invoker(2, 'indexOf')
export const split = invoker(2, 'split')
export const replace = invoker(3, 'replace')

export const isAllSpace = str => !!trim(str)

const _randomPacket = {}
export const randomString = (length, chars) => {
  let result = ''
  chars = chars || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
  _randomPacket[length] = _randomPacket[length] || []
  const packet = _randomPacket[length]
  if (packet.includes(result)) {
    return randomString()
  } else {
    packet.push(result)
    return result
  }
}
