import { isString, isArray, isObject } from './base.js'
import { isTruthy, allPass } from './boolean.js'
import { split, isStartWith } from './string.js'
import { toArray, map, filter, reject, reduce, join, unshift } from './array.js'
import { hasOwnProperty, prop, entries } from './object.js'
import { compose } from './functional.js'

// @see https://developer.mozilla.org/zh-CN/docs/Web/API/Location
// @see https://npm.taobao.org/mirrors/node/latest/docs/api/url.html
// @see https://github.com/medialize/URI.js

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

export const neatenPathname = pathname => {
  if (isArray(pathname)) {
    return compose(removeRepetitionOfEmpty, unshift(''))(pathname)
  }
  if (isString(pathname)) {
    return compose(join('/'), removeRepetitionOfEmpty, unshift(''), split('/'), join(''), removeRepetitionOfSlash, toArray)(pathname)
  }
}
export const pathnameToArray = pathname => {
  const neatedPathname = neatenPathname(pathname)
  if (isArray(neatedPathname)) {
    return neatedPathname
  }
  if (isString(neatedPathname)) {
    return split('/', neatedPathname)
  }
}
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
  if (allPass([isObject, hasOwnProperty('pathnames'), compose(isArray, prop('pathnames'))], mode)) {
    pathnames = mode.pathnames
    mode = mode.mode || 'strict'
    return isPathnameEqual(mode, pathnames)
  }
  mode = mode || 'strict'
  if (mode === 'strict') return isPathnameStrictEqual(...pathnames)
  if (mode === 'loose') return isPathnameLooseEqual(...pathnames)
}

// console.log('\n[path.js] pathnameToString:')
// console.log(pathnameToString(['app', 'page1']))
// console.log(pathnameToString(['', 'app', 'page1', '']))
// console.log(pathnameToString(['', 'app', 'page1', '', '']))
// console.log(pathnameToString(['', '', 'app', 'page1', '', '']))
// console.log(pathnameToString('/app/page1'))
// console.log(pathnameToString('//app/page1'))
// console.log(pathnameToString('//app//page1'))
// console.log(pathnameToString('//app//page1/'))
// console.log(pathnameToString('//app//page1//'))
// console.log('\n[path.js] pathnameToArray:')
// console.log(pathnameToArray(['app', 'page1']))
// console.log(pathnameToArray(['', 'app', 'page1', '']))
// console.log(pathnameToArray(['', 'app', 'page1', '', '']))
// console.log(pathnameToArray(['', '', 'app', 'page1', '', '']))
// console.log(pathnameToArray('/app/page1'))
// console.log(pathnameToArray('//app/page1'))
// console.log(pathnameToArray('//app//page1'))
// console.log(pathnameToArray('//app//page1/'))
// console.log(pathnameToArray('//app//page1//'))
// console.log('\n[path.js] isPathnameStrictEqual:')
// console.log(isPathnameStrictEqual('//app//page1//', ['app', 'page1']))
// console.log(isPathnameStrictEqual('//app//page1//', ['app', 'page1', '']))
// console.log('\n[path.js] isPathnameLooseEqual:')
// console.log(isPathnameLooseEqual('//app//page1//', ['app', 'page1']))
// console.log(isPathnameLooseEqual('//app//page1//', ['app', 'page1', '']))

export const neatenSearch = str => isStartWith('?', str) ? str : `?${str}`
export const neatenQueryStr = str => isStartWith('?', str) ? str.substring(1) : str

export const queryStrToQueryObj = compose(reduce((acc, cur) => {
  if (!cur) return acc
  const [key, value] = cur.split('=')
  acc[key] = decodeURIComponent(value)
  return acc
}, {}), split('&'), neatenQueryStr)
export const queryObjToQueryStr = compose(join('&'), map(join('=')), map(([k, v]) => [k, encodeURIComponent(v)]), entries)
export const searchToQueryStr = neatenQueryStr
export const searchToQueryObj = compose(queryStrToQueryObj, searchToQueryStr)
export const queryStrToSearch = neatenSearch
export const queryObjToSearch = compose(queryStrToSearch, queryObjToQueryStr)

export const toSearch = sth => {
  if (isString(sth)) return neatenSearch(sth)
  if (isObject(sth)) return queryObjToSearch(sth)
}
export const toQueryStr = sth => {
  if (isString(sth)) return neatenQueryStr(sth)
  if (isObject(sth)) return queryObjToQueryStr(sth)
}
export const toQueryObj = sth => {
  if (isString(sth)) return queryStrToQueryObj(sth) // NOTE: queryStrToQueryObj 自带 neatenQueryStr
  if (isObject(sth)) return sth
}

// console.log('\n[path.js] neatenSearch:')
// console.log(neatenSearch('a=1&b=2&c=3'))
// console.log(neatenSearch('?a=1&b=2&c=3'))
// console.log('\n[path.js] queryStrToQueryObj:')
// console.log(queryStrToQueryObj('a=1&b=2&c=3'))
// console.log(queryStrToQueryObj('?a=1&b=2&c=3'))
// console.log('\n[path.js] queryObjToQueryStr:')
// console.log(queryObjToQueryStr({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] searchToQueryStr:')
// console.log(searchToQueryStr('?a=1&b=2&c=3'))
// console.log('\n[path.js] searchToQueryObj:')
// console.log(searchToQueryObj('?a=1&b=2&c=3'))
// console.log('\n[path.js] queryStrToSearch:')
// console.log(queryStrToSearch('a=1&b=2&c=3'))
// console.log('\n[path.js] queryObjToSearch:')
// console.log(queryObjToSearch({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] toSearch:')
// console.log(toSearch('a=1&b=2&c=3'))
// console.log(toSearch('?a=1&b=2&c=3'))
// console.log(toSearch({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] toQueryStr:')
// console.log(toQueryStr('a=1&b=2&c=3'))
// console.log(toQueryStr('?a=1&b=2&c=3'))
// console.log(toQueryStr({ a: '1', b: '2', c: '3' }))
// console.log('\n[path.js] toQueryObj:')
// console.log(toQueryObj('a=1&b=2&c=3'))
// console.log(toQueryObj('?a=1&b=2&c=3'))
// console.log(toQueryObj({ a: '1', b: '2', c: '3' }))
