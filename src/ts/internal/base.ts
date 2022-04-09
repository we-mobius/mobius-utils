/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import type { Observable } from 'rxjs'

/**
 * 进行类型检测的常用手段包括：
 *   - typeof: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
 *             https://tc39.es/ecma262/#sec-typeof-operator
 *   - instanceof: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof
 *   - toString: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString
 *
 * - `typeof` operator can operate on non-exist variable.
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types}
 */
export type Primative = string | number | boolean | bigint | symbol | null | undefined
/**
 * @see {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#object-type}
 */
export type NonPrimative = object

export const isUndefined = (tar: any): tar is undefined =>
  Object.prototype.toString.call(tar) === '[object Undefined]'
/**
 * @see {@link https://stackoverflow.com/a/52097700}
 */
export const isDefined = <T>(tar: T): tar is T =>
  typeof tar !== 'undefined'
export const isBoolean = (tar: any): tar is boolean =>
  Object.prototype.toString.call(tar) === '[object Boolean]'
export const isString = (tar: any): tar is string =>
  Object.prototype.toString.call(tar) === '[object String]'
export const isNumber = (tar: any): tar is number =>
  Object.prototype.toString.call(tar) === '[object Number]'
export const isBigInt = (tar: any): tar is bigint =>
  Object.prototype.toString.call(tar) === '[object BigInt]'
export const isSymbol = (tar: any): tar is symbol =>
  Object.prototype.toString.call(tar) === '[object Symbol]'
export const isNull = (tar: any): tar is null =>
  Object.prototype.toString.call((tar)) === '[object Null]'
export const isPrimative = (tar: any): tar is Primative =>
  isString(tar) || isNumber(tar) || isBoolean(tar) || isBigInt(tar) || isSymbol(tar) || isNull(tar) || isUndefined(tar)
export const isNonPrimative = (tar: any): tar is NonPrimative => !isPrimative(tar)

/**
 * Predicate whether the target is a Object, use `instanceof` operator to check.
 *
 * @see {@link isGeneralObject}, {@link isPlainObject}
 */
export const isObject = (tar: any): tar is Object => tar instanceof Object
/**
 * Predicate whether the target is a general object, use `typeof` operator to check.
 *
 * A general object is an object that is:
 *  - not `null`, not a `function`, not a `primitive`.
 *
 * Any other object is a general object:
 *  - `Array` instance, `Map` instance, `WeakMap` instance, `Set` instance, `Date` instance, etc.
 *
 * @code
 * ```
 * typeof null // => 'object'
 * typeof [] // => 'object'
 * typeof {} // => 'object'
 * typeof { a: 1 } // => 'object'
 * typeof (new Map()) // => 'object'
 * typeof (new WeakMap()) // => 'object'
 * typeof (new Set()) // => 'object'
 * typeof (new WeakSet()) // => 'object'
 * typeof (new Date()) // => 'object'
 * typeof window // => 'object'
 * typeof document // => 'object'
 * ```
 *
 * @see {@link isObject}, {@link isPlainObject}
 */
export const isGeneralObject = (tar: any): tar is Object => tar !== null && typeof tar === 'object'

export interface PlainObject {
  [key: string]: any
  [key: number]: any
  [key: symbol]: any
}
/**
 * Predicate whether the target is a plain object.
 *
 * A plain object is an object that is:
 *  - not `null`, not a `function`, not a `primitive` type,
 *  - not an `Array`, not a `RegExp`, not a `Date`, not a `Map`, not a `Set`, not a `WeakMap`,
 *  - not `window`, not a DOM `element`, not an `Error`,
 *  - not any other customize object type.
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
/**
 * @see {@link Array.isArray}
 */
export const isArray = <T>(tar: any): tar is T[] => Array.isArray(tar)
export const isMap = <K, V>(tar: any): tar is Map<K, V> =>
  Object.prototype.toString.call(tar) === '[object Map]'
export const isWeakMap = <K extends object, V>(tar: any): tar is WeakMap<K, V> =>
  Object.prototype.toString.call(tar) === '[object WeakMap]'
export const isSet = <T>(tar: any): tar is Set<T> =>
  Object.prototype.toString.call(tar) === '[object Set]'
export const isWeakSet = <T extends object>(tar: any): tar is WeakSet<T> =>
  Object.prototype.toString.call(tar) === '[object WeakSet]'

export const isDate = (tar: any): tar is Date =>
  Object.prototype.toString.call(tar) === '[object Date]'
export const isRegExp = (tar: any): tar is RegExp =>
  Object.prototype.toString.call(tar) === '[object RegExp]'
export const isError = (tar: any): tar is Error =>
  Object.prototype.toString.call(tar) === '[object Error]'

export const isFunction = (tar: any): tar is Function => typeof tar === 'function'
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

export const isEmptyStr = (tar: any): tar is '' => isString(tar) && tar.length === 0
export const isEmptyArr = (tar: any): tar is [] => isArray(tar) && tar.length === 0
/**
 * @see {@link https://mannes.tech/typescript-object-type-errors/}
 */
export const isEmptyObj = (tar: any): tar is {} => isPlainObject(tar) && Object.keys(tar).length === 0
/**
 * - `null` and `undefined` are considered empty values
 * - `''` is the empty value for String
 * - `[]` is the empty value for Array
 * - `{}` is the empty value for PlainObject
 * - for other object types, it will be considered empty
 *   when the value its `isEmpty` property is true
 *
 * @see {@link isNull}, {@link isUndefined}, {@link isEmptyStr}, {@link isEmptyArr}, {@link isEmptyObj}
 */
export const isEmpty = (tar: any): boolean => {
  return isNull(tar) || isUndefined(tar) || isEmptyStr(tar) || isEmptyArr(tar) || isEmptyObj(tar) ||
  (isObject(tar) && tar.isEmpty)
}

export const isNil = (tar: any): tar is (null | undefined) => tar === null || tar === undefined
export const isNotNil = (tar: any): boolean => !isNil(tar)

/**
 * Check `tar` and `Window` is both defined
 * before use the `instanceof` operator to check `tar` is instanceof `Window`.
 */
export const isWindow = (tar: any): tar is Window =>
  isGeneralObject(tar) && isDefined(Window) && tar instanceof Window
/**
 * Check `tar` and `Element` is both defined
 * before use the `instanceof` operator to check `tar` is instanceof `Element`.
 */
export const isElement = (tar: any): tar is Element =>
  isGeneralObject(tar) && isDefined(Element) && tar instanceof Element
/**
 * Check `tar` and `Node` is both defined
 * before use the `instanceof` operator to check `tar` is instanceof `Node`.
 */
export const isNode = (tar: any): tar is Node =>
  isGeneralObject(tar) && isDefined(Node) && tar instanceof Node
/**
 * Check `tar` and `HTMLElement` is both defined
 * before use the `instanceof` operator to check `tar` is instanceof `HTMLElement`.
 */
export const isHTMLElement = (tar: any): tar is HTMLElement =>
  isGeneralObject(tar) && isDefined(HTMLElement) && tar instanceof HTMLElement
/**
 * Check `tar` and `HTMLCollection` is both defined
 * before use the `instanceof` operator to check `tar` is instanceof `HTMLCollection`.
 */
export const isHTMLCollection = (tar: any): tar is HTMLCollection =>
  isGeneralObject(tar) && isDefined(HTMLCollection) && tar instanceof HTMLCollection
/**
 * Check `tar` and `Document` is both defined
 * before use the `instanceof` operator to check `tar` is instanceof `Document`.
 */
export const isDocument = (tar: any): tar is Document =>
  isGeneralObject(tar) && isDefined(Document) && tar instanceof Document
/**
 * Check `tar` and `EventTarget` is both defined
 * before use the `instanceof` operator to check `tar` is instanceof `EventTarget`.
 *
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Event}
 */
export const isEventTarget = (tar: any): tar is EventTarget =>
  isGeneralObject(tar) && isDefined(EventTarget) && tar instanceof EventTarget
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol}
 */
export const isIterable = <T>(tar: any): tar is Iterable<T> =>
  Object.prototype.toString.call(tar[Symbol.iterator]) === '[object Function]'
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol}
 */
export const isIterator = <T, TReturn = any, TNext = undefined>(tar: any): tar is Iterator<T, TReturn, TNext> =>
  isObject(tar) && isFunction(tar.next)

export const isObservable = <T>(tar: any): tar is Observable<T> =>
  isObject(tar) && (Boolean(tar.isObservable) || isFunction(tar.subscribe))

export const asIs = <T = any>(tar: T, ...args: any[]): T => tar
export const asUndefined = (...tar: any[]): undefined => undefined
export const asNull = (...tar: any[]): null => null
export const asVoid = (...tar: any[]): void => { /* do nothing */ }
