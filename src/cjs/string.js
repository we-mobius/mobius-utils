const { invoker } = require('./functional.js')

exports.toString = invoker(1, 'toString')
exports.toLowerCase = invoker(1, 'toLowerCase')
exports.toUpperCase = invoker(1, 'toUpperCase')
const trim = invoker(1, 'trim')
exports.trim = trim
exports.trimRight = invoker(1, 'trimRight')
exports.trimLeft = invoker(1, 'trimLeft')
exports.indexOf = invoker(2, 'indexOf')
exports.split = invoker(2, 'split')
exports.replace = invoker(3, 'replace')

exports.isAllSpace = str => !!trim(str)

const _randomPacket = {}
const randomString = (length, chars) => {
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
exports.randomString = randomString
