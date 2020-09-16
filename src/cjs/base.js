exports.isDefined = variable => typeof variable !== 'undefined'

// @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Data_types
exports.isBoolean = boo => Object.prototype.toString.call(boo) === '[object Boolean]'
exports.isString = str => Object.prototype.toString.call(str) === '[object String]'
exports.isNumber = num => Object.prototype.toString.call(num) === '[object Number]'
exports.isSymbol = symbol => Object.prototype.toString.call(symbol) === '[object Symbol]'
exports.isUndefined = val => Object.prototype.toString.call(val) === '[object Undefined]'
exports.isNull = val => Object.prototype.toString.call(val) === '[object Null]'
exports.isFunction = fn => fn && Object.prototype.toString.call(fn) === '[object Function]'
const isDate = date =>
  date && Object.prototype.toString.call(new Date(date)) === '[object Date]' && !!new Date(date).getTime()
exports.isDate = isDate
const isObject = obj => Object.prototype.toString.call(obj) === '[object Object]'
exports.isObject = isObject
const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]'
exports.isArray = isArray
exports.isMap = map => Object.prototype.toString.call(map) === '[object Map]'
exports.isWeakMap = weakMap => Object.prototype.toString.call(weakMap) === '[object WeakMap]'
exports.isSet = set => Object.prototype.toString.call(set) === '[object Set]'
exports.isWeakSet = weakSet => Object.prototype.toString.call(weakSet) === '[object WeakSet]'
exports.isRegExp = regex => Object.prototype.toString.call(regex) === '[object RegExp]'
exports.isPromise = obj => Object.prototype.toString.call(obj) === '[object Promise]'
exports.isAsyncFn = fn => Object.prototype.toString.call(fn) === '[object AsyncFunction]'
exports.isGeneratorFunction = fn => Object.prototype.toString.call(fn) === '[object GeneratorFunction]'
exports.isAsyncGeneratorFunction = fn => Object.prototype.toString.call(fn) === '[object AsyncGeneratorFunction]'
exports.isError = err => Object.prototype.toString.call(err) === '[object Error]'
exports.isEmptyArr = arr => isArray(arr) && arr.length === 0
exports.isEmptyObj = obj => isObject(obj) && Object.keys(obj).length === 0
exports.isOutDated = date => isDate(date) && new Date(date).getTime() < new Date().getTime()

exports.asIs = (v) => v
exports.asUndefined = v => undefined
exports.asNull = v => null

exports.and = (...args) => args.every(arg => !!arg())
exports.or = (...args) => args.some(arg => !arg())

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
