import {
  isString, isArray, isObject,
  isTruthy,
  split,
  spreadToArray, filter, reject, join, unshift
} from '../internal'

import { compose } from '../functional'

// @see https://developer.mozilla.org/zh-CN/docs/Web/API/Location
// @see https://npm.taobao.org/mirrors/node/latest/docs/api/url.html
// @see https://github.com/medialize/URI

type PathnameString = string
type PathnameArray = string[]
type PathnameUnion = PathnameString | PathnameArray

type Filter<T> = (tar: T[]) => T[]
/**
 * @signature removeRepetition :: [a] -> [a]
 */
export const removeRepetition: Filter<string> = reject((item: string, index: number, arr: string[]) => {
  return arr[index - 1] !== undefined ? item === arr[index - 1] : false
})
/**
 * @signature removeRepetitionOf :: [a] -> ([a] -> [a])
 */
export const removeRepetitionOf = (ofList: string[]): Filter<string> =>
  reject((item: string, index: number, arr: string[]) => {
    return (arr[index - 1] !== undefined && ofList.includes(item)) ? item === arr[index - 1] : false
  })
/**
 * @signature removeRepetitionExcept :: [a] -> ([a] -> [a])
 */
export const removeRepetitionExcept = (exceptList: string[]): Filter<string> =>
  reject((item: string, index: number, arr: string[]) => {
    return (arr[index - 1] !== undefined && !exceptList.includes(item)) ? item === arr[index - 1] : false
  })
/**
 * @signature removeRepetitionOfEmpty :: [a] -> [a]
 */
export const removeRepetitionOfEmpty = removeRepetitionOf([''])
export const removeRepetitionOfSlash = removeRepetitionOf(['/'])
/**
 * remove empty string item in target array, except the first and the last item.
 */
const _removeInnerEmpty: Filter<string> = arr =>
  arr.filter((item, index, arr) => (index === 0 || index === arr.length - 1) ? true : item !== '')

const _keepMinimumPathArr: Filter<string> = arr => arr.length === 1 && arr[0] === '' ? ['', ''] : arr

/**
 * - remove repetition of slash & empty char
 * - add '' or '/' as prefix of pathname
 */
export const neatenPathname = (pathname: PathnameUnion): typeof pathname => {
  // ['path', 'to', 'page'] -> join('/') -> 'path/to/page'
  //   -> expected to be: '/path/to/page', unshift('') solve the problem
  if (isArray(pathname)) {
    // add '' to the beginning of pathname array, redandant '' will be removed by other steps
    const _0 = unshift('')(pathname)
    // redandant '' will be removed
    const _1 = removeRepetitionOfEmpty(_0)
    const _2 = _keepMinimumPathArr(_1)
    const _3 = _removeInnerEmpty(_2)
    return _3
  } else if (isString(pathname)) {
    const _0 = spreadToArray(pathname)
    // add '/' to the beginning of pathname array, redandant '/' will be removed by other steps
    const _1 = unshift('/')(_0)
    // redandant '/' will be removed
    const _2 = removeRepetitionOfSlash(_1)
    const _3 = join('')(_2)
    const _4 = split('/')(_3)
    const _5 = removeRepetitionOfEmpty(_4)
    const _6 = _keepMinimumPathArr(_5)
    const _7 = join('/')(_6)
    return _7
  } else {
    throw (new TypeError('"pathname" must be string or array.'))
  }
}

/**
 * @example
 * ```ts
 * pathnameToArray(['']) 👉 ['', '']
 * pathnameToArray(['', '']) 👉 ['', '']
 * pathnameToArray(['app', 'page']) 👉 [ '', 'app', 'page' ]
 * pathnameToArray(['', 'app', 'page']) 👉 [ '', 'app', 'page']
 * pathnameToArray(['', 'app', '', 'page']) 👉 [ '', 'app', 'page']
 * pathnameToArray(['', 'app', '', 'page', '']) 👉 [ '', 'app', 'page', '']
 * pathnameToArray(['', '', 'app', '', 'page', '']) 👉 [ '', 'app', 'page', '']
 * pathnameToArray(['', '', 'app', '', '', 'page', '']) 👉 [ '', 'app', 'page', '']
 * pathnameToArray(['', '', 'app', '', '', 'page', '', '']) 👉 [ '', 'app', 'page', '']
 * pathnameToArray('app/page') 👉 [ '', 'app', 'page' ]
 * pathnameToArray('/app/page') 👉 [ '', 'app', 'page' ]
 * pathnameToArray('/app/page/') 👉 [ '', 'app', 'page', '' ]
 * pathnameToArray('//app/page/') 👉 [ '', 'app', 'page', '' ]
 * pathnameToArray('//app//page/') 👉 [ '', 'app', 'page', '' ]
 * pathnameToArray('//app//page//') 👉 [ '', 'app', 'page', '' ]
 * ```
 */
export const pathnameToArray = (pathname: PathnameUnion): PathnameArray => {
  const neatedPathname = neatenPathname(pathname)
  if (isArray(neatedPathname)) {
    return neatedPathname
  } if (isString(neatedPathname)) {
    return split('/', neatedPathname)
  } else {
    throw (new TypeError('"pathname" must be string or array.'))
  }
}

/**
 * @example
 * ```
 * pathnameToString(['']) // '/'
 * pathnameToString(['', '']) // '/'
 * pathnameToString(['app', 'page']) // '/app/page'
 * pathnameToString(['', 'app', 'page']) // '/app/page'
 * pathnameToString(['app', '', 'page']) // '/app/page'
 * pathnameToString(['app', 'page', '']) // '/app/page/'
 * pathnameToString(['', 'app', '', 'page', '']) // '/app/page/'
 * pathnameToString(['', '', 'app', '', '', 'page', '', '']) // '/app/page/'
 * pathnameToString('') // '/'
 * pathnameToString('/') // '/'
 * pathnameToString('//') // '/'
 * pathnameToString('/app/page') // '/app/page'
 * pathnameToString('//app/page') // '/app/page'
 * pathnameToString('//app//page') // '/app/page'
 * pathnameToString('//app//page/') // '/app/page/'
 * pathnameToString('//app//page//') // '/app/page/'
 * ```
 */
export const pathnameToString = (pathname: PathnameUnion): PathnameString => {
  const neatedPathname = neatenPathname(pathname)
  if (isString(neatedPathname)) {
    return neatedPathname
  } if (isArray(neatedPathname)) {
    return join('/', neatedPathname)
  } else {
    throw (new TypeError('"pathname" must be string or array.'))
  }
}

/**
 * (strict) judge whether two pathname are equal.
 *  - strict mode: pathname must be equal
 *  - loose mode: pathname must be equal despite the last '/'
 * @example
 * ```ts
 * '/app/page' equals '/app/page'
 * '/app/page' not equals '/app/page/'
 * ```
 */
export const isPathnameStrictEqual = (pathname1: PathnameUnion, pathname2: PathnameUnion): boolean =>
  pathnameToString(pathname1) === pathnameToString(pathname2)
/**
 * (loose) judge whether two pathname are equal.
 *  - loose mode: pathname must be equal despite the last '/'
 *  - strict mode: pathname must be equal
 * @example
 * ```ts
 * '/app/page' equals '/app/page'
 * '/app/page' equals '/app/page/'
 * ```
 */
export const isPathnameLooseEqual = (pathname1: PathnameUnion, pathname2: PathnameUnion): boolean => {
  const preCook = compose(join('/'), filter(isTruthy), pathnameToArray)
  return preCook(pathname1) === preCook(pathname2)
}
/**
 * judge whether two pathname are equal.
 * @param mode mode of comparing
 * @return { boolean } whether two pathname are equal
 */
export const isPathnameEqual = (mode: 'strict' | 'loose', pathname1: PathnameUnion, pathname2: PathnameUnion): boolean => {
  mode = mode ?? 'strict'
  if (mode === 'strict') {
    return isPathnameStrictEqual(pathname1, pathname2)
  } else if (mode === 'loose') {
    return isPathnameLooseEqual(pathname1, pathname2)
  } else {
    throw (new TypeError('"mode" must be "strict" or "loose".'))
  }
}

// console.log('\n[path] pathnameToString:')
// console.log(pathnameToString(['']))
// console.log(pathnameToString(['', '']))
// console.log(pathnameToString(['app', 'page']))
// console.log(pathnameToString(['', 'app', 'page']))
// console.log(pathnameToString(['app', '', 'page']))
// console.log(pathnameToString(['app', 'page', '']))
// console.log(pathnameToString(['', 'app', '', 'page', '']))
// console.log(pathnameToString(['', '', 'app', '', '', 'page', '', '']))
// console.log(pathnameToString(''))
// console.log(pathnameToString('/'))
// console.log(pathnameToString('//'))
// console.log(pathnameToString('/app/page'))
// console.log(pathnameToString('//app/page'))
// console.log(pathnameToString('//app//page'))
// console.log(pathnameToString('//app//page/'))
// console.log(pathnameToString('//app//page//'))
// console.log('\n[path] pathnameToArray:')
// console.log(pathnameToArray([''])) // ['', '']
// console.log(pathnameToArray(['', ''])) // ['', '']
// console.log(pathnameToArray(['app', 'page'])) // [ '', 'app', 'page']
// console.log(pathnameToArray(['', 'app', 'page'])) // [ '', 'app', 'page']
// console.log(pathnameToArray(['', 'app', '', 'page'])) // [ '', 'app', 'page']
// console.log(pathnameToArray(['', 'app', '', 'page', ''])) // [ '', 'app', 'page', '']
// console.log(pathnameToArray(['', '', 'app', '', 'page', ''])) // [ '', 'app', 'page', '']
// console.log(pathnameToArray(['', '', 'app', '', '', 'page', ''])) // [ '', 'app', 'page', '']
// console.log(pathnameToArray(['', '', 'app', '', '', 'page', '', ''])) // [ '', 'app', 'page', '']
// console.log(pathnameToArray(''))
// console.log(pathnameToArray('/'))
// console.log(pathnameToArray('app/page'))
// console.log(pathnameToArray('/app/page'))
// console.log(pathnameToArray('/app/page/'))
// console.log(pathnameToArray('//app/page/'))
// console.log(pathnameToArray('//app//page/'))
// console.log(pathnameToArray('//app//page//'))
// console.log('\n[path] isPathnameStrictEqual:')
// console.log(isPathnameStrictEqual('', ['', '']))
// console.log(isPathnameStrictEqual('/', ['', '']))
// console.log(isPathnameStrictEqual('//app//page1//', ['', 'app', 'page1']))
// console.log(isPathnameStrictEqual('//app//page1//', ['', 'app', 'page1', '']))
// console.log('\n[path] isPathnameLooseEqual:')
// console.log(isPathnameLooseEqual('', ['', '']))
// console.log(isPathnameLooseEqual('/', ['', '']))
// console.log(isPathnameLooseEqual('//app//page1//', ['', 'app', 'page1']))
// console.log(isPathnameLooseEqual('//app//page1//', ['', 'app', 'page1', '']))

type SearchString = string
type QueryString = string
type QueryObject = Record<string, string>
type QueryUnion = SearchString | QueryString | QueryObject

/**
 * @return { string } search string
 * @example
 * ```ts
 * '?name=cigaret' 👉 '?name=cigaret'
 * 'name=cigaret' 👉 '?name=cigaret'
 * ```
 */
export const neatenSearch = (str: string): SearchString => str.indexOf('?') === 0 ? str : `?${str}`
/**
 * @return { string } query string
 * @example
 * ```ts
 * '?name=cigaret' 👉 'name=cigaret'
 * 'name=cigaret' 👉 'name=cigaret'
 * ```
 */
export const neatenQueryStr = (str: string): QueryString => str.indexOf('?') === 0 ? str.substring(1) : str

/**
 * @return { QueryObject } query object
 * @example
 * ```ts
 * 'name=cigaret' 👉 { name: 'cigaret' }
 * ```
 */
export const queryStrToQueryObj = (str: QueryString): QueryObject => {
  const queryString = neatenQueryStr(str)
  const querys = queryString.split('&')
  const queryObj: QueryObject = {}
  querys.forEach(query => {
    if (query === '') return
    const [key, value] = query.split('=')
    queryObj[key] = decodeURIComponent(value)
  })
  return queryObj
}
/**
 * @return { QueryString } query string
 * @example
 * ```ts
 * { name: 'cigaret' } 👉 'name=cigaret'
 * ```
 */
export const queryObjToQueryStr = (obj: QueryObject): QueryString => {
  const queryStr = Object.entries(obj).map(([k, v]) => [k, encodeURIComponent(v)]).map(([k, v]) => `${k}=${v}`).join('&')
  return queryStr
}
export const searchToQueryStr = neatenQueryStr
export const searchToQueryObj = (str: string): QueryObject => queryStrToQueryObj(searchToQueryStr(str))
export const queryStrToSearch = neatenSearch
export const queryObjToSearch = (str: QueryObject): string => queryStrToSearch(queryObjToQueryStr(str))

export const toSearch = (tar: QueryUnion): SearchString => {
  if (isString(tar)) {
    return neatenSearch(tar)
  } else if (isObject(tar)) {
    return queryObjToSearch(tar)
  } else {
    throw (new TypeError('"target" is expected to be type of "string" | "object".'))
  }
}
export const toQueryStr = (tar: QueryUnion): QueryString => {
  if (isString(tar)) {
    return neatenQueryStr(tar)
  } else if (isObject(tar)) {
    return queryObjToQueryStr(tar)
  } else {
    throw (new TypeError('"target" is expected to be type of "string" | "object".'))
  }
}
export const toQueryObj = (tar: QueryUnion): QueryObject => {
  if (isString(tar)) {
    // NOTE: queryStrToQueryObj 自带 neatenQueryStr
    return queryStrToQueryObj(tar)
  } else if (isObject(tar)) {
    return tar
  } else {
    throw (new TypeError('"target" is expected to be type of "string" | "object".'))
  }
}

// console.log('\n[path] neatenSearch:')
// console.log(neatenSearch('a=1&b=2&c=3'))
// console.log(neatenSearch('?a=1&b=2&c=3'))
// console.log('\n[path] queryStrToQueryObj:')
// console.log(queryStrToQueryObj('a=1&b=2&c=3'))
// console.log(queryStrToQueryObj('?a=1&b=2&c=3'))
// console.log('\n[path] queryObjToQueryStr:')
// console.log(queryObjToQueryStr({ a: '1', b: '2', c: '3' }))
// console.log('\n[path] searchToQueryStr:')
// console.log(searchToQueryStr('?a=1&b=2&c=3'))
// console.log('\n[path] searchToQueryObj:')
// console.log(searchToQueryObj('?a=1&b=2&c=3'))
// console.log('\n[path] queryStrToSearch:')
// console.log(queryStrToSearch('a=1&b=2&c=3'))
// console.log('\n[path] queryObjToSearch:')
// console.log(queryObjToSearch({ a: '1', b: '2', c: '3' }))
// console.log('\n[path] toSearch:')
// console.log(toSearch('a=1&b=2&c=3'))
// console.log(toSearch('?a=1&b=2&c=3'))
// console.log(toSearch({ a: '1', b: '2', c: '3' }))
// console.log('\n[path] toQueryStr:')
// console.log(toQueryStr('a=1&b=2&c=3'))
// console.log(toQueryStr('?a=1&b=2&c=3'))
// console.log(toQueryStr({ a: '1', b: '2', c: '3' }))
// console.log('\n[path] toQueryObj:')
// console.log(toQueryObj('a=1&b=2&c=3'))
// console.log(toQueryObj('?a=1&b=2&c=3'))
// console.log(toQueryObj({ a: '1', b: '2', c: '3' }))
// console.log(toQueryObj(''))
