const { curry, compose } = require('./functional.js')
const { isArray, isObject } = require('./base.js')
const { isTruthy, isLooseFalsy } = require('./boolean.js')
const { split, replace } = require('./string.js')
const { filter, reduce } = require('./array.js')

exports.prop = curry((key, obj) => obj[key])
exports.propEq = curry((prop, value, obj) => obj[prop] === value)

const hasOwnProperty = curry((key, obj) => Object.prototype.hasOwnProperty.call(obj, key))
exports.hasOwnProperty = hasOwnProperty

// @refer to: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
// NOTE: rawFn.length === 2
// export const get = curry((obj, path, defaultValue = undefined) => {
const get = curry((obj, path) => {
  // getPathArray :: s -> [s]
  const getPathArray = compose(filter(isTruthy), split(/[,[\].]+?/), replace(/['|"]/g, ''))
  // getRes :: [s] -> any
  const getRes = reduce((res, path) => isLooseFalsy(res) ? res : res[path], obj)

  const result = getRes(getPathArray(path))

  // return result === undefined || result === obj ? defaultValue : result
  return result
})
exports.get = get

// 用于响应式系统
const emptifyObj = obj => {
  for (const key in obj) {
    if (isObject(obj[key])) {
      emptifyObj(obj[key])
    } else {
      delete obj[key]
    }
  }
  return obj
}
exports.emptifyObj = emptifyObj

const deepCopyViaJSON = (obj) => JSON.parse(JSON.stringify(obj))
exports.deepCopyViaJSON = deepCopyViaJSON
// @refer to: https://github.com/davidmarkclements/rfdc/blob/master/index.js
const deepCopy = (obj) => {
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
exports.deepCopy = deepCopy

const hardDeepMerge = curry((target, source) => {
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
exports.hardDeepMerge = hardDeepMerge

const smartDeepMerge = (target, source) => {
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
exports.smartDeepMerge = smartDeepMerge
