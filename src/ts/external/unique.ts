import * as uuid from 'uuid'
import * as nanoid from 'nanoid'

// reference: https://pubs.opengroup.org/onlinepubs/9629399/apdxa.htm
// reference: https://www.npmjs.com/package/uuid
// reference: https://github.com/ai/nanoid/
// reference: https://gist.github.com/joepie91/7105003c3b26e65efcea63f3db82dfba
// reference: https://medium.com/teads-engineering/generating-uuids-at-scale-on-the-web-2877f529d2a2

/**
 * timestamp UUID
 */
export const v1UUID = uuid.v1
/**
 * namespace UUID(MD5)
 */
export const v3UUID = uuid.v3
/**
 * random UUID
 */
export const v4UUID = uuid.v4
/**
 * namespace UUID(SHA-1)
 */
export const v5UUID = uuid.v5

export const isUUID = (str: string): boolean => uuid.validate(str)
export const versionOfUUID = (str: string): number => uuid.version(str)
export const isUUIDv1 = (str: string): boolean => uuid.version(str) === 1
export const isUUIDv3 = (str: string): boolean => uuid.version(str) === 3
export const isUUIDv4 = (str: string): boolean => uuid.version(str) === 4
export const isUUIDv5 = (str: string): boolean => uuid.version(str) === 5

/**
 * generate v4 UUID through object URL API
 */
export const urlUUID = (): string => {
  const tempURL = URL.createObjectURL(new Blob())
  const uuid = tempURL.toString() // blob:https://www.cigaret.world/1e34c01e-ab7c-4e60-b6f3-a6101e8c0d2d
  URL.revokeObjectURL(tempURL) // release object URL
  return uuid.substr(uuid.lastIndexOf('/') + 1)
}

/**
 * 获取当前运行时唯一的字符串，可用于标识组件
 *
 * @param prefix default to 'mobius'
 * @param fingerPrint default to 'cigaret'
 * @return String
 */
export const makeUniqueString = (() => {
  let _timestamp = 0
  let _ids: string[] = []

  return (prefix = 'mobius', fingerPrint = 'cigaret'): string => {
    const idGenerator = nanoid.customAlphabet(fingerPrint, 9)
    const timestamp = +new Date()
    let id
    // 按时间分片防碰撞
    if (_timestamp !== timestamp) {
      _timestamp = timestamp
      _ids = []
    }

    do {
      id = idGenerator()
    } while (_ids.includes(id))
    _ids.push(id)

    return `${prefix}--${timestamp}-${id}`
  }
})()
