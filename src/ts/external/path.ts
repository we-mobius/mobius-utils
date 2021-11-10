import {
  isString, isArray, isObject,
  isTruthy, allPass,
  split, isStartWith,
  spreadToArray, map, filter, reject, reduce, join, unshift,
  hasOwnProperty, prop, entries
} from '../internal'

import { compose } from '../functional'

// @see https://developer.mozilla.org/zh-CN/docs/Web/API/Location
// @see https://npm.taobao.org/mirrors/node/latest/docs/api/url.html
// @see https://github.com/medialize/URI

// removeRepetition :: [a] -> [a]
export const removeRepetition = reject((item, index, arr) => {
  return arr[index - 1] !== undefined ? item === arr[index - 1] : false
})
// removeRepetitionOf :: [a] -> ([a] -> [a])
export const removeRepetitionOf = ofList => reject((item, index, arr) => {
  return (arr[index - 1] !== undefined && ofList.includes(item)) ? item === arr[index - 1] : false
})
// removeRepetitionExcept :: [a] -> ([a] -> [a])
export const removeRepetitionExcept = exceptList => reject((item, index, arr) => {
  return (arr[index - 1] !== undefined && !exceptList.includes(item)) ? item === arr[index - 1] : false
})
// removeRepetitionOfEmpty :: [a] -> ([a] -> [a])
export const removeRepetitionOfEmpty = removeRepetitionOf([''])
export const removeRepetitionOfSlash = removeRepetitionOf(['/'])
const removeInnerEmpty = arr => arr.filter((item, index, arr) => (index === 0 || index === arr.length - 1) ? true : item !== '')

const _keepMinimumPathArr = arr => arr.length === 1 && arr[0] === '' ? ['', ''] : arr
/**
 * - remove repetition of slash & empty char
 * - add '' or '/' as prefix of pathname
 */
export const neatenPathname = pathname => {
  // ['path', 'to', 'page'] -> join('/') -> 'path/to/page'
  //   -> expected to be: '/path/to/page', unshift('') solve the problem
  if (isArray(pathname)) {
    return compose(removeInnerEmpty, _keepMinimumPathArr, removeRepetitionOfEmpty, unshift(''))(pathname)
  }
  if (isString(pathname)) {
    return compose(
      join('/'), _keepMinimumPathArr, removeRepetitionOfEmpty, split('/'), join(''), removeRepetitionOfSlash, unshift('/'), spreadToArray
    )(pathname)
  }
}

/**
 * @example
 * ```
 * pathnameToArray(['']) // ['', '']
 * pathnameToArray(['', '']) // ['', '']
 * pathnameToArray(['app', 'page']) // [ '', 'app', 'page' ]
 * pathnameToArray(['', 'app', 'page']) // [ '', 'app', 'page']
 * pathnameToArray(['', 'app', '', 'page']) // [ '', 'app', 'page']
 * pathnameToArray(['', 'app', '', 'page', '']) // [ '', 'app', 'page', '']
 * pathnameToArray(['', '', 'app', '', 'page', '']) // [ '', 'app', 'page', '']
 * pathnameToArray(['', '', 'app', '', '', 'page', '']) // [ '', 'app', 'page', '']
 * pathnameToArray(['', '', 'app', '', '', 'page', '', '']) // [ '', 'app', 'page', '']
 * pathnameToArray('app/page') // [ '', 'app', 'page' ]
 * pathnameToArray('/app/page') // [ '', 'app', 'page' ]
 * pathnameToArray('/app/page/') // [ '', 'app', 'page', '' ]
 * pathnameToArray('//app/page/') // [ '', 'app', 'page', '' ]
 * pathnameToArray('//app//page/') // [ '', 'app', 'page', '' ]
 * pathnameToArray('//app//page//') // [ '', 'app', 'page', '' ]
 * ```
 */
export const pathnameToArray = pathname => {
  const neatedPathname = neatenPathname(pathname)
  if (isArray(neatedPathname)) {
    return neatedPathname
  }
  if (isString(neatedPathname)) {
    return split('/', neatedPathname)
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
export const pathnameToString = pathname => {
  const neatedPathname = neatenPathname(pathname)
  if (isString(neatedPathname)) {
    return neatedPathname
  }
  if (isArray(neatedPathname)) {
    return join('/', neatedPathname)
  }
}

// 判断两个 pathname 是否相等，有两种模式
//  -> 严格模式：字符串形式的 pathname 必须完全相同
//    -> '/app/page' equals '/app/page'
//    -> '/app/page' not equals '/app/page/'
//  -> 宽松模式：模糊处理路径名最后的 '/'
//    -> '/app/page' equals '/app/page/'
export const isPathnameStrictEqual = (pathname1, pathname2) => pathnameToString(pathname1) === pathnameToString(pathname2)
export const isPathnameLooseEqual = (pathname1, pathname2) => {
  const preCook = compose(join('/'), filter(isTruthy), pathnameToArray)
  return preCook(pathname1) === preCook(pathname2)
}
export const isPathnameEqual = (mode, pathnames) => {
  // @accept { mode, pathnames }
  if (allPass([isObject, hasOwnProperty('pathnames'), compose(isArray, prop('pathnames'))], mode)) {
    pathnames = mode.pathnames
    mode = mode.mode || 'strict'
    return isPathnameEqual(mode, pathnames)
  }
  mode = mode || 'strict'
  if (mode === 'strict') return isPathnameStrictEqual(...pathnames)
  if (mode === 'loose') return isPathnameLooseEqual(...pathnames)
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

export const neatenSearch = str => isStartWith('?', str) ? str : `?${str}`
export const neatenQueryStr = str => isStartWith('?', str) ? str.substring(1) : str

// ! 直接用 reduce 会导致变量污染，即 ruduce 的 acc 会被复用
export const queryStrToQueryObj = compose(tar => reduce((acc, cur) => {
  if (!cur) return acc
  const [key, value] = cur.split('=')
  acc[key] = decodeURIComponent(value)
  return acc
}, {}, tar), split('&'), neatenQueryStr)
export const queryObjToQueryStr = compose(join('&'), map(join('=')), map(([k, v]) => [k, encodeURIComponent(v)]), entries)
export const searchToQueryStr = neatenQueryStr
export const searchToQueryObj = compose(queryStrToQueryObj, searchToQueryStr)
export const queryStrToSearch = neatenSearch
export const queryObjToSearch = compose(queryStrToSearch, queryObjToQueryStr)

export const toSearch = tar => {
  if (isString(tar)) return neatenSearch(tar)
  if (isObject(tar)) return queryObjToSearch(tar)
}
export const toQueryStr = tar => {
  if (isString(tar)) return neatenQueryStr(tar)
  if (isObject(tar)) return queryObjToQueryStr(tar)
}
export const toQueryObj = tar => {
  if (isString(tar)) return queryStrToQueryObj(tar) // NOTE: queryStrToQueryObj 自带 neatenQueryStr
  if (isObject(tar)) return tar
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
