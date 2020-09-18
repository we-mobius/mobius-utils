import { curry, compose } from './functional.js'
import { isArray, isObject } from './base.js'
import { isTruthy, isLooseFalsy } from './boolean.js'
import { split, replace } from './string.js'
import { filter, reduce } from './array.js'

export const prop = curry((key, obj) => obj[key])
export const propEq = curry((prop, value, obj) => obj[prop] === value)
export const entries = Object.entries
export const keys = Object.keys
export const values = Object.values

export const hasOwnProperty = curry((key, obj) => Object.prototype.hasOwnProperty.call(obj, key))

// @refer to: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
// NOTE: rawFn.length === 2
// export const get = curry((obj, path, defaultValue = undefined) => {
export const get = curry((obj, path) => {
  // getPathArray :: s -> [s]
  const getPathArray = compose(filter(isTruthy), split(/[,[\].]+?/), replace(/['|"]/g, ''))
  // getRes :: [s] -> any
  const getRes = reduce((res, path) => isLooseFalsy(res) ? res : res[path], obj)

  const result = getRes(getPathArray(path))

  // return result === undefined || result === obj ? defaultValue : result
  return result
})

export const emptifyObj = obj => {
  for (const key in obj) {
    if (isObject(obj[key])) {
      emptifyObj(obj[key])
    } else {
      delete obj[key]
    }
  }
  return obj
}

export const deepCopyViaJSON = (obj) => JSON.parse(JSON.stringify(obj))
// @refer to: https://github.com/davidmarkclements/rfdc/blob/master/index.js
export const deepCopy = (obj) => {
  if (!isObject(obj)) {
    return obj
  }
  const newObj = isArray(obj) ? [] : {}
  for (const key in obj) {
    if (isObject(obj[key])) {
      newObj[key] = deepCopy(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj
}

export const hardDeepMerge = curry((target, source) => {
  if (!isObject(target) || !isObject(source)) {
    return target
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (isArray(targetValue) && isArray(sourceValue)) {
      target[key] = deepCopy(sourceValue)
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = hardDeepMerge(targetValue, sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
})

export const smartDeepMerge = (target, source) => {
  if (!isObject(target) || !isObject(source)) {
    return target
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key]
    const sourceValue = source[key]

    if (isArray(targetValue) && isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue)
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = smartDeepMerge(targetValue, sourceValue)
    } else {
      target[key] = sourceValue
    }
  })

  return target
}
