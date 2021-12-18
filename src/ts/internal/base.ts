/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { Observable } from 'rxjs'

/**
 * 进行类型检测的常用手段包括：
 *   - typeof: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
 *   - instanceof: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
 *   - toString: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
 */

export type Primative = string | number | boolean | bigint | symbol | null | undefined
// @refer https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#object-type
export type NonPrimative = object

// @refer https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types
export const isUndefined = (tar: any): tar is undefined =>
  Object.prototype.toString.call((tar)) === '[object Undefined]'
// @refer https://stackoverflow.com/a/52097700
export const isDefined = <T>(variable: T): variable is T => typeof variable !== 'undefined'
export const isBoolean = (tar: any): tar is boolean =>
  Object.prototype.toString.call(tar) === '[object Boolean]'
export const isString = (tar: any): tar is string =>
  Object.prototype.toString.call(tar) === '[object String]'
export const isNumber = (tar: any): tar is number =>
  Object.prototype.toString.call(tar) === '[object Number]'
export const isBigint = (tar: any): tar is bigint =>
  Object.prototype.toString.call(tar) === '[object BigInt]'
export const isSymbol = (tar: any): tar is symbol =>
  Object.prototype.toString.call(tar) === '[object Symbol]'
export const isNull = (tar: any): tar is null =>
  Object.prototype.toString.call((tar)) === '[object Null]'

/**
 * Predicate whether the target is a Object, use `instanceof` operator to check.
 *
 * @see {@link isGeneralObject}, {@link isPlainObject}
 */
export const isObject = (tar: any): tar is Object =>
  tar instanceof Object
/**
 * Predicate whether the target is a general object, use `typeof` operator to check.
 *
 * A general object is an object that is not null, not a function, not a primitive.
 *   Any other object is a general object, an array is a general object, a Map
 *   is a general object, a Set is a general object, etc.
 *
 * @see {@link isObject}, {@link isPlainObject}
 */
export const isGeneralObject = (tar: any): tar is Object =>
  tar !== null && typeof tar === 'object'

export interface PlainObject {
  [key: string]: any
  [key: number]: any
  [key: symbol]: any
}
/**
 * Predicate whether the target is a plain object.
 *
 * A plain object is an object that is not null, not a function, not a primitive type,
 *   not an array, not a RegExp, not a Date, not a Map, not a Set, not a WeakMap,
 *   not window, not a DOM element, not an Error,
 *   not any other customize object type.
 *
 * @see {@link isObject}, {@link isGeneralObject}
 */
export const isPlainObject = (tar: any): tar is PlainObject => {
  // 非 null、非 Function、非原始类型
  if (tar === null || typeof tar !== 'object') {
    return false
  }
  // 非 Array、非 Regexp、非 Date、非 Map、非 Set、非 Window、非 DOM、非 Error……
  if (Object.prototype.toString.call(tar) !== '[object Object]') {
    return false
  }
  // 非其它自定义类实例对象
  let proto = tar
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  return Object.getPrototypeOf(tar) === proto
}
export const isArray = <T>(tar: any): tar is T[] =>
  Array.isArray(tar)
export const isMap = <K, V>(tar: any): tar is Map<K, V> =>
  Object.prototype.toString.call(tar) === '[object Map]'
export const isWeakMap = <K extends object, V>(tar: any): tar is WeakMap<K, V> =>
  Object.prototype.toString.call(tar) === '[object WeakMap]'
export const isSet = <T>(tar: any): tar is Set<T> =>
  Object.prototype.toString.call(tar) === '[object Set]'
export const isWeakSet = <T extends object>(tar: any): tar is WeakSet<T> =>
  Object.prototype.toString.call(tar) === '[object WeakSet]'

export const isDate = (tar: any): tar is Date =>
  Boolean(tar) && Object.prototype.toString.call(new Date(tar)) === '[object Date]'
export const isRegExp = (tar: any): tar is RegExp =>
  Object.prototype.toString.call(tar) === '[object RegExp]'
export const isError = (tar: any): tar is Error =>
  Object.prototype.toString.call(tar) === '[object Error]'

export const isFunction = (tar: any): tar is Function =>
  typeof tar === 'function'
export const isNormalFunction = (tar: any): tar is Function =>
  Object.prototype.toString.call(tar) === '[object Function]'
export const isAsyncFunction = (tar: any): tar is Function =>
  Object.prototype.toString.call(tar) === '[object AsyncFunction]'
export const isGeneratorFunction = (tar: any): tar is Function =>
  Object.prototype.toString.call((tar)) === '[object GeneratorFunction]'
export const isAsyncGeneratorFunction = (tar: any): tar is Function =>
  Object.prototype.toString.call(tar) === '[object AsyncGeneratorFunction]'
export const isPromise = <T>(tar: any): tar is Promise<T> =>
  Object.prototype.toString.call(tar) === '[object Promise]'

export const isEmptyStr = (tar: any): tar is '' =>
  isString(tar) && tar.length === 0
export const isEmptyArr = (tar: any): tar is [] =>
  isArray(tar) && tar.length === 0
// @refer https://mannes.tech/typescript-object-type-errors/
export const isEmptyObj = (tar: any): tar is {} =>
  isPlainObject(tar) && Object.keys(tar).length === 0
// - `null` and `undefined` are considered empty values
// - `''` is the empty value for String
// - `[]` is the empty value for Array
// - `{}` is the empty value for Object
export const isEmpty = (tar: any): boolean =>
  isNull(tar) || isUndefined(tar) || isEmptyStr(tar) || isEmptyArr(tar) || isEmptyObj(tar) ||
  (isObject(tar) && tar.isEmpty)
export const isNil = (v: any): v is (null | undefined) => v === null || v === undefined
export const isNotNil = (v: any): boolean => !isNil(v)
export const isWindow = (tar: any): tar is Window =>
  Object.prototype.toString.call(tar) === '[object Window]'
export const isElement = (tar: any): tar is Element => tar instanceof Element
export const isNode = (tar: any): tar is Node => tar instanceof Node
export const isHTMLElement = (tar: any): tar is HTMLElement => tar instanceof HTMLElement
export const isDocument = (tar: any): tar is Document =>
  Object.prototype.toString.call(tar) === '[object HTMLDocument]'
// @refer https://developer.mozilla.org/zh-CN/docs/Web/API/Event
export const isEventTarget = (tar: any): tar is EventTarget =>
  tar instanceof EventTarget
export const isIterable = <T>(tar: any): tar is Iterable<T> =>
  Object.prototype.toString.call(tar[Symbol.iterator]) === '[object Function]'
export const isIterator = <T, TReturn = any, TNext = undefined>(tar: any): tar is Iterator<T, TReturn, TNext> =>
  isObject(tar) && isFunction(tar.next)

export const isObservable = <T>(tar: any): tar is Observable<T> =>
  isObject(tar) && (Boolean(tar.isObservable) || isFunction(tar.subscribe))

export const asIs = <T = any>(v: T, ...args: any[]): T => v
export const asUndefined = (...v: any[]): undefined => undefined
export const asNull = (...v: any[]): null => null
export const asVoid = (...v: any[]): void => { /* do nothing */ }
