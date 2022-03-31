/* eslint-disable no-extend-native */

/**
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/BigInt#%E5%9C%A8_json_%E4%B8%AD%E4%BD%BF%E7%94%A8}
 */
export const extendBigInt = (): void => {
  // @ts-expect-error - extend BigInt toJSON
  BigInt.prototype.toJSON = function (): number {
    return Number(this.toString())
  }
}
