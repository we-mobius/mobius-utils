import { isString, isPlainObject, isArray } from '../internal'
import { curry } from '../functional'

type ClassString = string
type ClassArray = string[]
type ClassObject = Record<string, boolean>
type ClassUnion = ClassString | ClassArray | ClassObject

/**
 * @param str same as value of class attribute on HTML tags
 * @return { ClassString } formatted class string
 * @example
 * ```ts
 * 'mobius-base mobius-theme--light' 👉 'mobius-base mobius-theme--light'
 * '.mobius-base.mobius-theme--light' 👉 'mobius-base mobius-theme--light'
 * '.mobius-base mobius-theme--light' 👉 'mobius-base mobius-theme--light'
 * '  .mobius-base   mobius-theme--light  ' 👉 'mobius-base mobius-theme--light'
 * ```
 */
export const neatenClassStr = (str: string): ClassString => {
  if (!isString(str)) {
    throw (new TypeError('"str" is expected to be type of String.'))
  }
  // replace '.' to single space
  // replace multiple spaces to single space
  // trim start and end spaces
  const classStr = str.replace('.', ' ').replace(/\s+/g, ' ').trim()
  return classStr
}

/**
 * Format target string to standard class string using `neatenClassStr`, then split it to array by space.
 * @param str class string
 * @return { ClassArray } array of classnames
 * @example
 * ```ts
 * 'mobius-base mobius-theme--light' 👉 ['mobius-base', 'mobius-theme--light']
 * '.mobius-base.mobius-theme--light' 👉 ['mobius-base', 'mobius-theme--light']
 * '.mobius-base mobius-theme--light' 👉 ['mobius-base', 'mobius-theme--light']
 * '  .mobius-base   mobius-theme--light  ' 👉 ['mobius-base', 'mobius-theme--light']
 * ```
 */
export const classStrToArr = (str: ClassString): ClassArray => {
  if (!isString(str)) {
    throw (new TypeError('"str" is expected to be type of String.'))
  }
  const classArr = neatenClassStr(str).split(' ').filter(s => s.length > 0)
  return classArr
}
/**
 * @param arr array of classnames
 * @return { ClassObject } PlainObject which use classname as key and exist of classname as value
 * @example
 * ```ts
 * ['mobius-base', 'mobius-theme--light']
 * 👇
 * {
 *  'mobius-base': true,
 *  'mobius-theme--light': true
 * }
 * ```
 */
export const classArrToObj = (arr: ClassArray): ClassObject => {
  if (!isArray(arr)) {
    throw (new TypeError('"arr" is expected to be type of Array.'))
  }
  const classObj: ClassObject = {}
  arr.flat(Infinity).filter(isString).forEach(s => {
    classObj[s] = true
  })
  return classObj
}
/**
 * Equal to `pipe(classStrToArr, classArrToObj)`.
 * @param str class string
 * @return { ClassObject } PlainObject which use classname as key and exist of classname as value
 */
export const classStrToObj = (str: ClassString): ClassObject => {
  if (!isString(str)) {
    throw (new TypeError('"str" is expected to be type of String.'))
  }
  const classArr = classStrToArr(str)
  const classObj = classArrToObj(classArr)
  return classObj
}
/**
 * Classname in target object which value is false will be ignored.
 * @param classObject PlainObject which use classname as key and exist of classname as value
 * @return { ClassArray } array of classnames
 */
export const classObjToArr = (obj: ClassObject): ClassArray => {
  if (!isPlainObject(obj)) {
    throw (new TypeError('"obj" is expected to be type of PlainObject.'))
  }
  const classArr: string[] = []
  Object.entries(obj).filter(([key, value]) => value).forEach(([key, value]) => {
    classArr.push(key)
  })
  return classArr
}
/**
 * @param arr array of classnames
 * @return { ClassString } class string
 */
export const classArrToStr = (arr: ClassArray): ClassString => {
  if (!isArray(arr)) {
    throw (new TypeError('"arr" is expected to be type of Array.'))
  }
  const classStr = arr.flat(Infinity).filter(isString).filter(s => s.length > 0).join(' ')
  return classStr
}
/**
 * Same as `pipe(classObjToArr, classArrToStr)`.
 * @param classObject PlainObject which use classname as key and exist of classname as value
 * @return { ClassString } class string
 */
export const classObjToStr = (obj: ClassObject): ClassString => {
  if (!isPlainObject(obj)) {
    throw (new TypeError('"obj" is expected to be type of PlainObject.'))
  }
  const classArr = classObjToArr(obj)
  const classStr = classArrToStr(classArr)
  return classStr
}
/**
 * @param tar target, type of classString | classArray | classObject
 * @return { classString } class string
 */
export const toClassStr = (tar: ClassUnion): ClassString => {
  if (isString(tar)) {
    return '' + tar
  } else if (isArray(tar)) {
    return classArrToStr(tar)
  } else if (isPlainObject(tar)) {
    return classObjToStr(tar)
  } else {
    throw (new TypeError('"tar" is expected to be type of String | Array | Object.'))
  }
}
/**
 * @param tar target, type of classString | classArray | classObject
 * @return { ClassArray } array of classnames
 */
export const toClassArr = (tar: ClassUnion): ClassArray => {
  if (isString(tar)) {
    return classStrToArr(tar)
  } else if (isArray(tar)) {
    return [...tar.flat(Infinity).filter(isString)]
  } else if (isPlainObject(tar)) {
    return classObjToArr(tar)
  } else {
    throw (new TypeError('"tar" is expected to be type of String | Array | Object.'))
  }
}
/**
 * @param tar target, type of classString | classArray | classObject
 * @return { ClassObject } PlainObject which use classname as key and exist of classname as value
 */
export const toClassObj = (tar: ClassUnion): ClassObject => {
  if (isString(tar)) {
    return classStrToObj(tar)
  } else if (isArray(tar)) {
    return classArrToObj(tar)
  } else if (isPlainObject(tar)) {
    return { ...tar }
  } else {
    throw (new TypeError('"tar" is expected to be type of String | Array | Object.'))
  }
}
/**
 * Curried.
 * @param target string | array | object
 * @param cls target, type of classString | classArray | classObject
 * @return { ClassUnion } classString | classArray | classObject
 */
export const formatClassTo = curry(
  (target: string | any[] | Record<any, any>, cls: ClassUnion): typeof cls => {
    if (isString(target)) {
      return toClassStr(cls)
    } else if (isArray(target)) {
      return toClassArr(cls)
    } else if (isPlainObject(target)) {
      return toClassObj(cls)
    } else {
      throw (new TypeError('"target" is expected to be type of String | Array | Object.'))
    }
  }
)

/**
 * Curried.
 * @param prefix classname prefix
 * @param cls class, type of classString | classArray | classObject
 * @return { ClassUnion } typeof param class, says classString | classArray | classObject
 */
export const prefixClassWith = curry((prefix: string, cls: ClassUnion): typeof cls => {
  if (isString(cls)) {
    const classArr = classStrToArr(cls).map(item =>
      item.indexOf(prefix) === 0 ? item : `${prefix}${item}`
    )
    const classStr = classArrToStr(classArr)
    return classStr
  } else if (isArray(cls)) {
    const classArr = cls.map(item =>
      item.indexOf(prefix) === 0 ? item : `${prefix}${item}`
    )
    return classArr
  } else if (isPlainObject(cls)) {
    const classObj: ClassObject = {}
    Object.entries(cls).forEach(([key, value]) => {
      const _key = key.indexOf(prefix) === 0 ? key : `${prefix}${key}`
      classObj[_key] = value
    })
    return classObj
  } else {
    throw (new Error('"cls"(aka. class) is expected to be type of String | Array | Object.'))
  }
})
/**
 * Curried.
 * @param prefix classname prefix
 * @param cls class, type of classString | classArray | classObject
 * @return { ClassUnion } typeof param class, says classString | classArray | classObject
 */
export const removePrefixOfClass = curry((prefix: string, cls: ClassUnion): typeof cls => {
  if (isString(cls)) {
    const classArr = classStrToArr(cls).map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length)
      }
      return item
    })
    const classStr = classArrToStr(classArr)
    return classStr
  } else if (isArray(cls)) {
    const classArr = cls.map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length)
      }
      return item
    })
    return classArr
  } else if (isPlainObject(cls)) {
    const classObj: ClassObject = {}
    Object.entries(cls).forEach(([key, value]) => {
      const _key = key.indexOf(prefix) === 0 ? key.slice(prefix.length) : key
      classObj[_key] = value
    })
    return classObj
  } else {
    throw (new Error('"cls"(aka. class) is expected to be type of String | Array | Object.'))
  }
})

/**
 * Curried.
 * @param added class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return { ClassUnion } typeof param class, says classString | classArray | classObject
 */
export const addClass = curry((added: ClassUnion, target: ClassUnion): typeof target => {
  const addedClassObj = toClassObj(added)
  const targetClassObj = toClassObj(target)
  const resClassObj = { ...targetClassObj, ...addedClassObj }
  return formatClassTo(target, resClassObj)
})
/**
 * Curried.
 * @param removed class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return { ClassUnion } typeof param class, says classString | classArray | classObject
 */
export const removeClass = curry((removed: ClassUnion, target: ClassUnion): typeof target => {
  const removedClassObj = toClassObj(removed)
  Object.keys(removedClassObj).forEach(key => {
    removedClassObj[key] = false
  })
  const targetClassObj = toClassObj(target)
  const resClassObj = { ...targetClassObj, ...removedClassObj }
  return formatClassTo(target, resClassObj)
})
/**
 * Curried.
 * @param toggled class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return { ClassUnion } typeof param class, says classString | classArray | classObject
 */
export const toggleClass = curry((toggled: ClassUnion, target: ClassUnion): typeof target => {
  const toggledClassArr = toClassArr(toggled)
  const targetClassObj = toClassObj(target)
  toggledClassArr.forEach(cls => {
    targetClassObj[cls] = !targetClassObj[cls]
  })
  return formatClassTo(target, targetClassObj)
})
type Replaced = Record<string, string> | Array<string | string[]> | string
/**
 * Curried.
 * @param replaced class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return { ClassUnion } typeof param class, says classString | classArray | classObject
 */
export const replaceClass = curry((replaced: Replaced, target: ClassUnion): typeof target => {
  if (isArray(replaced)) {
    const replacedArr = replaced
      .filter(item => (isArray(item) && item.length > 0) || isString(item))
      .map(item => {
        let formatted: string[] = []
        if (isArray(item)) {
          if (item.length === 1) {
            formatted = [item[0], '']
          } else if (item.length === 2) {
            formatted = item
          } else if (item.length > 2) {
            formatted = item.slice(0, 2)
          } else {
            throw (new Error('Unexpected error happened!'))
          }
        } else if (isString(item)) {
          formatted = [item, '']
        }
        return formatted
      })
    const targetClassObj = toClassObj(target)
    replacedArr.forEach(([from, to]) => {
      if (!isString(from) || !isString(to)) {
        return
      }
      if (targetClassObj[from] !== undefined) {
        if (to !== '') {
          targetClassObj[to] = targetClassObj[from]
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete targetClassObj[from]
      }
    })
    return formatClassTo(target, targetClassObj)
  } else if (isPlainObject(replaced)) {
    const targetClassObj = toClassObj(target)
    Object.entries(replaced).forEach(([from, to]) => {
      if (!isString(from) || !isString(to)) {
        return
      }
      if (targetClassObj[from] !== undefined) {
        if (to !== '') {
          targetClassObj[to] = targetClassObj[from]
        }
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete targetClassObj[from]
      }
    })
    return formatClassTo(target, targetClassObj)
  } else if (isString(replaced)) {
    return removeClass(replaced, target)
  } else {
    throw (new TypeError('"replaced" is expected to be type of String | Array | Object.'))
  }
})
/**
 * Curried.
 * @param contained class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return { boolean } whether target class contains contained class
 */
export const containClass = curry((contained, target) => {
  const containedClassArr = toClassArr(contained)
  const targetClassArr = toClassArr(target)
  return containedClassArr.every(item => targetClassArr.includes(item))
})

// const classStr = ' mobius-add .   del'
// const classArr = ['mobius-add', 'del']
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
