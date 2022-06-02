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

export const isUndefined = (target: unknown): target is undefined =>
  Object.prototype.toString.call(target) === '[object Undefined]'
/**
 * @see {@link https://stackoverflow.com/a/52097700}
 */
export const isDefined = <T>(target: T): target is T =>
  typeof target !== 'undefined'
export const isBoolean = (target: unknown): target is boolean =>
  Object.prototype.toString.call(target) === '[object Boolean]'
export const isString = (target: unknown): target is string =>
  Object.prototype.toString.call(target) === '[object String]'
export const isNumber = (target: any): target is number =>
  Object.prototype.toString.call(target) === '[object Number]' && !isNaN(parseFloat(target))
export const isFiniteNumber = (target: unknown): target is number => isNumber(target) && Number.isFinite(target)
export const isInfiniteNumber = (target: unknown): target is number => isNumber(target) && !Number.isFinite(target)
export const isNaN = (target: unknown): boolean => Number.isNaN(target)
export const isBigInt = (target: unknown): target is bigint =>
  Object.prototype.toString.call(target) === '[object BigInt]'
export const isSymbol = (target: unknown): target is symbol =>
  Object.prototype.toString.call(target) === '[object Symbol]'
export const isNull = (target: unknown): target is null =>
  Object.prototype.toString.call((target)) === '[object Null]'
export const isPrimative = (target: unknown): target is Primative =>
  isString(target) || isNumber(target) || isBoolean(target) || isBigInt(target) || isSymbol(target) || isNull(target) || isUndefined(target)
export const isNonPrimative = (target: unknown): target is NonPrimative => !isPrimative(target)

/**
 * Predicate whether the targetget is a Object, use `instanceof` operator to check.
 *
 * @see {@link isGeneralObject}, {@link isPlainObject}
 */
export const isObject = (target: unknown): target is Object => target instanceof Object
/**
 * Predicate whether the targetget is a general object, use `typeof` operator to check.
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
export const isGeneralObject = (target: unknown): target is Object => target !== null && typeof target === 'object'

export interface PlainObject {
  [key: string]: any
  [key: number]: any
  [key: symbol]: any
}
/**
 * Predicate whether the targetget is a plain object.
 *
 * A plain object is an object that is:
 *  - not `null`, not a `function`, not a `primitive` type,
 *  - not an `Array`, not a `RegExp`, not a `Date`, not a `Map`, not a `Set`, not a `WeakMap`,
 *  - not `window`, not a DOM `element`, not an `Error`,
 *  - not any other customize object type.
 *
 * @see {@link isObject}, {@link isGeneralObject}
 */
export const isPlainObject = (target: unknown): target is PlainObject => {
  // 非 null、非 Function、非原始类型
  if (target === null || typeof target !== 'object') {
    return false
  }
  // 非 Array、非 Regexp、非 Date、非 Map、非 Set、非 Window、非 DOM、非 Error……
  if (Object.prototype.toString.call(target) !== '[object Object]') {
    return false
  }
  // 非其它自定义类实例对象
  let proto = target
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }
  if (Object.getPrototypeOf(target) === proto) {
    return true
  } else {
    return false
  }
}
/**
 * @see {@link Array.isArray}
 */
export function isArray <T> (target: T[]): target is T[]
export function isArray <T> (target: unknown): target is T[]
export function isArray <T> (target: unknown): target is T[] { return Array.isArray(target) }

export function isArrayLike <T> (target: ArrayLike<T>): target is ArrayLike<T>
export function isArrayLike <T> (target: unknown): target is ArrayLike<T>
export function isArrayLike <T> (target: any): target is ArrayLike<T> {
  return isGeneralObject(target) && isNumber(target.length)
}

export function isMap <K, V> (target: Map<K, V>): target is Map<K, V>
export function isMap <K, V> (target: unknown): target is Map<K, V>
export function isMap <K, V> (target: unknown): target is Map<K, V> {
  return Object.prototype.toString.call(target) === '[object Map]'
}

export function isWeakMap <K extends object, V> (target: WeakMap<K, V>): target is WeakMap<K, V>
export function isWeakMap <K extends object, V> (target: unknown): target is WeakMap<K, V>
export function isWeakMap <K extends object, V> (target: unknown): target is WeakMap<K, V> {
  return Object.prototype.toString.call(target) === '[object WeakMap]'
}

export function isSet <T> (target: Set<T>): target is Set<T>
export function isSet <T> (target: unknown): target is Set<T>
export function isSet <T> (target: unknown): target is Set<T> {
  return Object.prototype.toString.call(target) === '[object Set]'
}

export function isWeakSet <T extends object> (target: WeakSet<T>): target is WeakSet<T>
export function isWeakSet <T extends object> (target: unknown): target is WeakSet<T>
export function isWeakSet <T extends object> (target: unknown): target is WeakSet<T> {
  return Object.prototype.toString.call(target) === '[object WeakSet]'
}

export const isDate = (target: unknown): target is Date =>
  Object.prototype.toString.call(target) === '[object Date]'
export const isRegExp = (target: unknown): target is RegExp =>
  Object.prototype.toString.call(target) === '[object RegExp]'
export const isError = (target: unknown): target is Error =>
  Object.prototype.toString.call(target) === '[object Error]'

export const isFunction = (target: unknown): target is Function => typeof target === 'function'
export const isNormalFunction = (target: unknown): target is Function =>
  Object.prototype.toString.call(target) === '[object Function]'
export const isAsyncFunction = (target: unknown): target is Function =>
  Object.prototype.toString.call(target) === '[object AsyncFunction]'
export const isGeneratorFunction = (target: unknown): target is Function =>
  Object.prototype.toString.call((target)) === '[object GeneratorFunction]'
export const isAsyncGeneratorFunction = (target: unknown): target is Function =>
  Object.prototype.toString.call(target) === '[object AsyncGeneratorFunction]'

export function isPromise <T> (target: Promise<T>): target is Promise<T>
export function isPromise <T> (target: unknown): target is Promise<T>
export function isPromise <T> (target: unknown): target is Promise<T> {
  return Object.prototype.toString.call(target) === '[object Promise]'
}
export const isEmptyString = (target: unknown): target is '' => isString(target) && target.length === 0
export const isEmptyArray = (target: unknown): target is [] => isArray(target) && target.length === 0
/**
 * @see {@link isEmptyObject}
 */
export const isEmptyPlainObject = (target: unknown): target is PlainObject => isPlainObject(target) && Object.keys(target).length === 0
/**
 * @see {@link isEmptyPlainObject}, {@link https://mannes.tech/typescript-object-type-errors/}
 */
export const isEmptyObject = (target: unknown): target is {} => isEmptyPlainObject(target)
/**
 * - `null` and `undefined` are considered empty values
 * - `''` is the empty value for String
 * - `[]` is the empty value for Array
 * - `{}` is the empty value for PlainObject
 * - for other object types, they will be considered empty
 *   when the value of their `isEmpty` property is true
 *
 * @see {@link isNull}, {@link isUndefined}, {@link isEmptyString}, {@link isEmptyArray}, {@link isEmptyObject}
 */
export const isEmpty = (target: any): boolean => {
  return isNull(target) || isUndefined(target) || isEmptyString(target) || isEmptyArray(target) || isEmptyObject(target) ||
  (isObject(target) && target.isEmpty === true)
}

export const isNil = (target: unknown): target is (null | undefined) => target === null || target === undefined

/**
 * Check `target` and `Window` is both defined
 * before use the `instanceof` operator to check `target` is instanceof `Window`.
 */
export const isWindow = (target: unknown): target is Window =>
  isGeneralObject(target) && isDefined(Window) && target instanceof Window
/**
 * Check `target` and `Element` is both defined
 * before use the `instanceof` operator to check `target` is instanceof `Element`.
 */
export const isElement = (target: unknown): target is Element =>
  isGeneralObject(target) && isDefined(Element) && target instanceof Element
/**
 * Check `target` and `Node` is both defined
 * before use the `instanceof` operator to check `target` is instanceof `Node`.
 */
export const isNode = (target: unknown): target is Node =>
  isGeneralObject(target) && isDefined(Node) && target instanceof Node
/**
 * Check `target` and `HTMLElement` is both defined
 * before use the `instanceof` operator to check `target` is instanceof `HTMLElement`.
 */
export const isHTMLElement = (target: unknown): target is HTMLElement =>
  isGeneralObject(target) && isDefined(HTMLElement) && target instanceof HTMLElement
/**
 * Check `target` and `HTMLCollection` is both defined
 * before use the `instanceof` operator to check `target` is instanceof `HTMLCollection`.
 */
export const isHTMLCollection = (target: unknown): target is HTMLCollection =>
  isGeneralObject(target) && isDefined(HTMLCollection) && target instanceof HTMLCollection
/**
 * Check `target` and `Document` is both defined
 * before use the `instanceof` operator to check `target` is instanceof `Document`.
 */
export const isDocument = (target: unknown): target is Document =>
  isGeneralObject(target) && isDefined(Document) && target instanceof Document
/**
 * Check `target` and `EventTarget` is both defined
 * before use the `instanceof` operator to check `target` is instanceof `EventTarget`.
 *
 * @see {@link https://developer.mozilla.org/zh-CN/docs/Web/API/Event}
 */
export const isEventTarget = (target: unknown): target is EventTarget =>
  isGeneralObject(target) && isDefined(EventTarget) && target instanceof EventTarget
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol}
 */
export function isIterable <T> (target: Iterable<T>): target is Iterable<T>
export function isIterable <T> (target: unknown): target is Iterable<T>
export function isIterable <T> (target: any): target is Iterable<T> {
  return Object.prototype.toString.call(target[Symbol.iterator]) === '[object Function]'
}
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator}
 */
export function isAsyncIterable <T> (target: AsyncIterable<T>): target is AsyncIterable<T>
export function isAsyncIterable <T> (target: unknown): target is AsyncIterable<T>
export function isAsyncIterable <T> (target: any): target is AsyncIterable<T> {
  return Object.prototype.toString.call(target[Symbol.asyncIterator]) === '[object AsyncGeneratorFunction]'
}
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterator_protocol}
 */
export function isIterator <T, TReturn = unknown, TNext = undefined> (
  target: Iterator<T, TReturn, TNext>
): target is Iterator<T, TReturn, TNext>
export function isIterator <T, TReturn = unknown, TNext = undefined> (target: unknown): target is Iterator<T, TReturn, TNext>
export function isIterator <T, TReturn = unknown, TNext = undefined> (target: any): target is Iterator<T, TReturn, TNext> {
  return isObject(target) && isFunction(target.next)
}
export function isAsyncIterator <T, TReturn = unknown, TNext = undefined> (
  target: AsyncIterator<T, TReturn, TNext>
): target is AsyncIterator<T, TReturn, TNext>
export function isAsyncIterator <T, TReturn = unknown, TNext = undefined> (target: unknown): target is AsyncIterator<T, TReturn, TNext>
export function isAsyncIterator <T, TReturn = unknown, TNext = undefined> (target: any): target is AsyncIterator<T, TReturn, TNext> {
  return isObject(target) && isFunction(target.next)
}

export function isObservable <T> (target: Observable<T>): target is Observable<T>
export function isObservable <T> (target: unknown): target is Observable<T>
export function isObservable <T> (target: any): target is Observable<T> {
  return isObject(target) && (Boolean(target.isObservable) || isFunction(target.subscribe))
}

export const asIs = <T = unknown>(target: T, ...args: unknown[]): T => target
export const asUndefined = (...target: unknown[]): undefined => undefined
export const asNull = (...target: unknown[]): null => null
export const asVoid = (...target: unknown[]): void => { /* do nothing */ }
