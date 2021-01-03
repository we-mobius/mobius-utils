export const isDefined = variable => typeof variable !== 'undefined'

// @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types
export const isBoolean = boo => Object.prototype.toString.call(boo) === '[object Boolean]'
export const isString = str => Object.prototype.toString.call(str) === '[object String]'
export const isNumber = num => Object.prototype.toString.call(num) === '[object Number]'
export const isSymbol = symbol => Object.prototype.toString.call(symbol) === '[object Symbol]'
export const isUndefined = val => Object.prototype.toString.call(val) === '[object Undefined]'
export const isNull = val => Object.prototype.toString.call(val) === '[object Null]'
export const isFunction = fn => fn && Object.prototype.toString.call(fn) === '[object Function]'
export const isDate = date =>
  date && Object.prototype.toString.call(new Date(date)) === '[object Date]' && !!new Date(date).getTime()
export const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'
export const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]'
export const isMap = map => Object.prototype.toString.call(map) === '[object Map]'
export const isWeakMap = weakMap => Object.prototype.toString.call(weakMap) === '[object WeakMap]'
export const isSet = set => Object.prototype.toString.call(set) === '[object Set]'
export const isWeakSet = weakSet => Object.prototype.toString.call(weakSet) === '[object WeakSet]'
export const isRegExp = regex => Object.prototype.toString.call(regex) === '[object RegExp]'
export const isPromise = obj => Object.prototype.toString.call(obj) === '[object Promise]'
export const isAsyncFn = fn => Object.prototype.toString.call(fn) === '[object AsyncFunction]'
export const isGeneratorFunction = fn =>
  Object.prototype.toString.call(fn) === '[object GeneratorFunction]'
export const isAsyncGeneratorFunction = fn =>
  Object.prototype.toString.call(fn) === '[object AsyncGeneratorFunction]'
export const isError = err => Object.prototype.toString.call(err) === '[object Error]'
export const isEmptyStr = str => isString(str) && str.length === 0
export const isEmptyArr = arr => isArray(arr) && arr.length === 0
export const isEmptyObj = obj => isObject(obj) && Object.keys(obj).length === 0
export const isOutDated = date => isDate(date) && new Date(date).getTime() < new Date().getTime()

export const isWindow = obj => Object.prototype.toString.call(obj) === '[object Window]'
export const isEventTarget = obj => obj instanceof EventTarget

export const isObservable = obj => isObject(obj) && (obj.isObservable || isFunction(obj.subscribe))

// - `null` and `undefined` are considered empty values
// - `''` is the empty value for String
// - `[]` is the empty value for Array
// - `{}` is the empty value for Object
export const isEmpty = val =>
  isNull(val) || isUndefined(val) || isEmptyStr(val) || isEmptyArr(val) || isEmptyObj(val) || (isObject(val) && val.isEmpty)

export const asIs = v => v
export const asUndefined = v => undefined
export const asNull = v => null
export const noop = v => {}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
