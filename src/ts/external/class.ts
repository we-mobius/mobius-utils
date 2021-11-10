import { isString, isObject, isArray, hasOwnProperty } from '../internal'
import { curryN } from '../functional'

/**
 * @param str same as value of class attribute on HTML tags
 * @return classString str
 * @example
 * ```js
 * 'mobius-base mobius-theme--light'
 * '.mobius-base.mobius-theme--light'
 * '.mobius-base mobius-theme--light'
 * ```
 */
export const neatenClassStr = str => {
  if (!isString(str)) {
    throw (new TypeError(`"str" is expected to be type of String, but received typeof "${str}".`))
  }
  return str.replace('.', ' ').replace(/\s+/g, ' ').trim()
}
/**
 * @param str class string
 * @return classArray array of classnames
 * @example
 * ```js
 * ['mobius-base', 'mobius-theme--light']
 * ```
 */
export const classStrToArr = str => {
  if (!isString(str)) {
    throw (new TypeError(`"str" is expected to be type of String, but received typeof "${str}".`))
  }
  return neatenClassStr(str).split(' ').filter(s => s.length > 0)
}
/**
 * @param arr array of classnames
 * @return classObject which use key as classname and value as exist of classname
 * @example
 * ```js
 * {
 *  'mobius-base': true,
 *  'mobius-theme--light': true
 * }
 * ```
 */
export const classArrToObj = arr => {
  if (!isArray(arr)) {
    throw (new TypeError(`"arr" is expected to be type of Array, but received typeof "${arr}".`))
  }
  const obj = arr.flat(Infinity).filter(isString).reduce((acc, cur) => {
    acc[cur] = true
    return acc
  }, {})
  return obj
}
/**
 * @param str classString
 * @return classObject
 */
export const classStrToObj = str => {
  if (!isString(str)) {
    throw (new TypeError(`"str" is expected to be type of String, but received typeof "${str}".`))
  }
  const arr = classStrToArr(str)
  const obj = classArrToObj(arr)
  return obj
}
/**
 * @param obj classObject
 * @return classArray
 */
export const classObjToArr = obj => {
  if (!isObject(obj)) {
    throw (new TypeError(`"obj" is expected to be type of Object, but received typeof "${obj}".`))
  }
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value === true) {
      acc.push(key)
    }
    return acc
  }, [])
}
/**
 * @param arr classArray
 * @return classString
 */
export const classArrToStr = arr => {
  if (!isArray(arr)) {
    throw (new TypeError(`"arr" is expected to be type of Array, but received typeof "${arr}".`))
  }
  const str = arr.flat(Infinity).filter(isString).filter(s => s.length > 0).join(' ')
  return str
}
/**
 * @param obj classObject
 * @return classString
 */
export const classObjToStr = obj => {
  if (!isObject(obj)) {
    throw (new TypeError(`"obj" is expected to be type of Object, but received typeof "${obj}".`))
  }
  const arr = classObjToArr(obj)
  const str = classArrToStr(arr)
  return str
}
/**
 * @param tar aka. target, type of classString | classArray | classObject
 * @return classString
 */
export const toClassStr = tar => {
  if (isString(tar)) {
    return '' + tar
  } else if (isArray(tar)) {
    return classArrToStr(tar)
  } else if (isObject(tar)) {
    return classObjToStr(tar)
  } else {
    throw (new TypeError(`"tar" is expected to be type of String | Array | Object, but received typeof ${tar}`))
  }
}
/**
 * @param tar aka. target, type of classString | classArray | classObject
 * @return classArray
 */
export const toClassArr = tar => {
  if (isString(tar)) {
    return classStrToArr(tar)
  } else if (isArray(tar)) {
    return [...tar.flat(Infinity).filter(isString)]
  } else if (isObject(tar)) {
    return classObjToArr(tar)
  } else {
    throw (new TypeError(`"tar" is expected to be type of String | Array | Object, but received typeof ${tar}`))
  }
}
/**
 * @param tar aka. target, type of classString | classArray | classObject
 * @return classObject
 */
export const toClassObj = tar => {
  if (isString(tar)) {
    return classStrToObj(tar)
  } else if (isArray(tar)) {
    return classArrToObj(tar)
  } else if (isObject(tar)) {
    return { ...tar }
  } else {
    throw (new TypeError(`"tar" is expected to be type of String | Array | Object, but received typeof ${tar}`))
  }
}
/**
 * @param target classString | classArray | classObject
 * @param cls aka. class, type of classString | classArray | classObject
 * @return classString | classArray | classObject
 */
export const formatClassTo = curryN(2, (target, cls) => {
  if (isString(target)) {
    return toClassStr(cls)
  } else if (isObject(target)) {
    return toClassObj(cls)
  } else if (isArray(target)) {
    return toClassArr(cls)
  } else {
    throw (new TypeError(`"target" is expected to be type of String | Array | Object, but received typeof ${target}`))
  }
})

/**
 * @param prefix String
 * @param cls aka. class, type of classString | classArray | classObject
 * @return classString | classArray | classObject
 */
export const prefixClassWith = curryN(2, (prefix, cls) => {
  if (isString(cls)) {
    const classArr = classStrToArr(cls).map(item =>
      item.indexOf(prefix) === 0 ? item : prefix + item
    )
    const classStr = classArrToStr(classArr)
    return classStr
  } else if (isObject(cls)) {
    const classObj = Object.entries(cls).reduce((acc, [key, value]) => {
      const _key = key.indexOf(prefix) === 0 ? key : prefix + key
      acc[_key] = value
      return acc
    }, {})
    return classObj
  } else if (isArray(cls)) {
    const classArr = cls.map(item =>
      item.indexOf(prefix) === 0 ? item : prefix + item
    )
    return classArr
  } else {
    throw (new Error(`"cls"(aka. class) is expected to be type of String | Array | Object, but received ${cls}`))
  }
})
/**
 * @param prefix String
 * @param cls aka. class, type of classString | classArray | classObject
 * @return classString | classArray | classObject
 */
export const removePrefixOfClass = curryN(2, (prefix, cls) => {
  if (isString(cls)) {
    const classArr = classStrToArr(cls).map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length)
      }
      return item
    })
    const classStr = classArr.join(' ')
    return classStr
  } else if (isObject(cls)) {
    const classObj = Object.entries(cls).reduce((acc, [key, value]) => {
      if (key.indexOf(prefix) === 0) {
        acc[key.slice(prefix.length)] = value
      } else {
        acc[key] = value
      }
      return acc
    }, { })
    return classObj
  } else if (isArray(cls)) {
    const classArr = cls.map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length)
      }
      return item
    })
    return classArr
  } else {
    throw (new Error(`"cls"(aka. class) is expected to be type of String | Array | Object, but received ${cls}`))
  }
})

export const addClass = curryN(2, (added, target) => {
  const addedClassObj = toClassObj(added)
  const targetClassObj = toClassObj(target)
  const resClassObj = { ...targetClassObj, ...addedClassObj }
  return formatClassTo(target, resClassObj)
})
export const removeClass = curryN(2, (removed, target) => {
  const removedClassObj = toClassObj(removed)
  Object.keys(removedClassObj).forEach(key => {
    removedClassObj[key] = false
  })
  const targetClassObj = toClassObj(target)
  const resClassObj = { ...targetClassObj, ...removedClassObj }
  return formatClassTo(target, resClassObj)
})
export const toggleClass = curryN(2, (toggled, target) => {
  const toggledClassArr = toClassArr(toggled)
  const targetClassObj = toClassObj(target)
  toggledClassArr.forEach(cls => {
    targetClassObj[cls] = !targetClassObj[cls]
  })
  return formatClassTo(target, targetClassObj)
})
export const replaceClass = curryN(2, (replaced, target) => {
  if (isObject(replaced)) {
    const targetClassObj = toClassObj(target)
    Object.entries(replaced).forEach(([prev, cur]) => {
      if (!isString(prev) || !isString(cur)) {
        return
      }
      if (hasOwnProperty(prev, targetClassObj)) {
        if (cur !== '') {
          targetClassObj[cur] = targetClassObj[prev]
        }
        delete targetClassObj[prev]
      }
    })
    return formatClassTo(target, targetClassObj)
  } else if (isArray(replaced)) {
    const replacedArr = replaced.filter(item => (isArray(item) && item.length > 0) || isString(item)).map(item => {
      if (isArray(item)) {
        if (item.length === 1) {
          return [item[0], '']
        } else if (item.length === 2) {
          return item
        } else if (item.length > 2) {
          return item.slice(0, 2)
        } else {
          throw (new Error('Unexpected error happened!'))
        }
      } else if (isString(item)) {
        return [item, '']
      }
    })
    const targetClassObj = toClassObj(target)
    replacedArr.forEach(replaced => {
      const [prev, cur] = replaced
      if (!isString(prev) || !isString(cur)) {
        return
      }
      if (hasOwnProperty(prev, targetClassObj)) {
        if (cur !== '') {
          targetClassObj[cur] = targetClassObj[prev]
        }
        delete targetClassObj[prev]
      }
    })
    return formatClassTo(target, targetClassObj)
  } else if (isString(replaced)) {
    return replaceClass(toClassArr(replaced), target)
  } else {
    throw (new TypeError(`"replaced" is expected to be type of String | Array | Object, but received ${replaced}`))
  }
})
export const containClass = curryN(2, (contained, target) => {
  const containedClassArr = toClassArr(contained)
  const targetClassArr = toClassArr(target)
  return containedClassArr.every(item => targetClassArr.includes(item))
})

// const classStr = ' mobius-add .   del'
// const classArr = [['mobius-add'], ['del']]
// const classObj = { 'mobius-add': true, del: false }

// console.log('【Type transformation】')
// console.log(classStrToArr(classStr))
// console.log(classArrToObj(classArr))
// console.log(classStrToObj(classStr))
// console.log(classObjToArr(classObj))
// console.log(classArrToStr(classArr))
// console.log(classObjToStr(classObj))
// console.log('【prefix】')
// console.log(prefixClassWith('mobius-', classStr))
// console.log(prefixClassWith('mobius-', classArr))
// console.log(prefixClassWith('mobius-', classObj))
// console.log(removePrefixOfClass('mobius-', classStr))
// console.log(removePrefixOfClass('mobius-', classArr))
// console.log(removePrefixOfClass('mobius-', classObj))
// console.log('【add】')
// console.log(addClass(classArr, classObj))
// console.log(addClass(classStr, classObj))
// console.log('【remove】')
// console.log(removeClass(classStr, classObj))
// console.log(removeClass(classArr, classObj))
// console.log('【toggle】')
// console.log(toggleClass(classStr, classObj))
// console.log(toggleClass(classArr, classObj))
// console.log('【replace】')
// console.log(replaceClass(classStr, classObj))
// console.log(replaceClass(classArr, classObj))
// console.log(replaceClass({ 'mobius-add': 'add', del: 'mobius-del' }, classObj))
// console.log('【contain】')
// console.log(containClass(classStr, classObj))
// console.log(containClass(classArr, classObj))
// console.log(containClass(classArr, { 'mobius-add': true, del: true }))

// console.log(prefixClassWith('mobius-', ''))
