/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { curry, looseCurry } from '../functional/helpers'
import { isNumber, isArray, isGeneralObject, isPlainObject, isString, isNil, PlainObject } from './base'
import { isTruthy } from './boolean'

// TODO: 比较两个对象相等
// TODO: 比较两个对象相同

export const prop = curry((key, obj) => obj[key])
export const propEq = curry((prop, value, obj) => obj[prop] === value)
export const propEqBy = curry((prop, value, compareFn, obj) => compareFn(obj[prop], value))
export const entries = Object.entries
export const keys = Object.keys
export const values = Object.values
type PartialKeys = <V>(obj: { [key: string]: V } | ArrayLike<V>) => string[]
type PartialValues = <V>(obj: { [key: string]: V } | ArrayLike<V>) => V[]
export const truthyKeys: PartialKeys = obj =>
  entries(obj).filter(([k, v]) => Boolean(v)).map(([k, v]) => k)
export const truthyValues: PartialValues = obj =>
  entries(obj).filter(([k, v]) => Boolean(v)).map(([k, v]) => v)
export const falsyKeys: PartialKeys = obj =>
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  entries(obj).filter(([k, v]) => !v).map(([k, v]) => k)
export const falsyValues: PartialValues = obj =>
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  entries(obj).filter(([k, v]) => !v).map(([k, v]) => v)

export const hasOwnProperty = curry((key, obj) => Object.prototype.hasOwnProperty.call(obj, key))
export const assign = curry((source, target) => Object.assign(target, source))
export const assignTo = looseCurry((target, source, ...sources) => Object.assign(target, source, ...sources))

type Path = number | string | Array<number | string>
/**
 * @param { Array<number | string> | string | number } path Can be 'a.b,c/e/"f".["g.h"]\\i\\j'
 */
export const getPropByPath = curry((path: Path, obj) => {
  if (!isArray(path) && !isString(path) && !isNumber(path)) {
    throw (new TypeError(`"path" is expected to be type of "Array" | "String" | "Number", but received "${typeof path}".`))
  }
  let _path = path
  if (isNumber(_path)) {
    _path = String(parseInt(String(_path)))
  }

  const pathToArray = (path: string): string[] => path.replace(/['|"]/g, '').split(/[,./[\]\\]/g).filter(isTruthy)
  const pathArray = isArray(_path) ? _path : pathToArray(_path)
  const result = pathArray.reduce((res, path) => isNil(res) ? res : res[path], obj)

  return result
})

/**
 * @param { Array<number | string> | string | number } path Can be 'a.b,c/e/"f".["g.h"]\\i\\j'
 */
export const setPropByPath = curry((path: Path, value, obj) => {
  if (!isArray(path) && !isString(path) && !isNumber(path)) {
    throw (new TypeError(`"path" is expected to be type of "Array" | "String" | "Number", but received "${typeof path}".`))
  }
  let _path = path
  if (isNumber(_path)) {
    _path = String(parseInt(String(_path)))
  }

  const pathToArray = (path: string): string[] => path.replace(/['|"]/g, '').split(/[,./[\]\\]/g).filter(isTruthy)
  const pathArray = isArray(_path) ? _path : pathToArray(_path)
  pathArray.reduce((res, path, index) => {
    if (index === pathArray.length - 1) {
      res[path] = value
    } else {
      res[path] = res[path] ?? (isNaN(parseInt(String(pathArray[index + 1]))) ? {} : [])
    }
    return res[path]
  }, obj)

  return obj
})

export const copyByJSON = (tar: any): any => JSON.parse(JSON.stringify(tar))

export const deepCopy = (tar: any): any => {
  if (!isGeneralObject(tar)) {
    return tar
  }
  const newObj: { [key: string]: any } = isArray<any>(tar) ? [] : {}
  for (const key in tar) {
    if (isGeneralObject(tar[key])) {
      newObj[key] = deepCopy(tar[key])
    } else {
      newObj[key] = tar[key]
    }
  }
  return newObj
}

/**
 * @TODO: 支持保留循环引用关系，通过添加一个额外的 Map 作为参数实现
 * @param { any } target target
 * @param { any } source source
 * @return { any } target
 */
export const deepMerge = curry((target, source) => {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return target
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (isArray(targetValue) && isArray(sourceValue)) {
      target[key] = deepCopy(sourceValue)
    } else if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      target[key] = deepMerge(targetValue, sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
})

/**
 * Delete target's key one by one.
 */
export const emptifyObj = (target: PlainObject): PlainObject => {
  Object.keys(target).forEach(key => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete target[key]
  })
  return target
}
