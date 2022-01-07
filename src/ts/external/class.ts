import { isString, isPlainObject, isArray } from '../internal'
import { curry } from '../functional'

export type ClassString = string
export type ClassArray = string[]
export type ClassObject = Record<string, boolean>
export type ClassUnion = ClassString | ClassArray | ClassObject

/**
 * @param str same as value of class attribute on HTML tags
 * @return formatted class string
 * @example
 * ```ts
 * 'mobius-base mobius-theme--light' 👉 'mobius-base mobius-theme--light'
 * '.mobius-base.mobius-theme--light' 👉 'mobius-base mobius-theme--light'
 * '.mobius-base mobius-theme--light' 👉 'mobius-base mobius-theme--light'
 * '  .mobius-base   mobius-theme--light  ' 👉 'mobius-base mobius-theme--light'
 * ```
 */
export const neatenClassString = (str: string): ClassString => {
  if (!isString(str)) {
    throw (new TypeError('"str" is expected to be type of String.'))
  }
  // replace '.' to single space
  // replace multiple spaces to single space
  // trim start and end spaces
  const classString = str.replace('.', ' ').replace(/\s+/g, ' ').trim()
  return classString
}

/**
 * Format target string to standard class string using `neatenClassString`, then split it to array by space.
 *
 * @param str class string
 * @return array of classnames
 * @example
 * ```ts
 * 'mobius-base mobius-theme--light' 👉 ['mobius-base', 'mobius-theme--light']
 * '.mobius-base.mobius-theme--light' 👉 ['mobius-base', 'mobius-theme--light']
 * '.mobius-base mobius-theme--light' 👉 ['mobius-base', 'mobius-theme--light']
 * '  .mobius-base   mobius-theme--light  ' 👉 ['mobius-base', 'mobius-theme--light']
 * ```
 */
export const classStringToClassArray = (str: ClassString): ClassArray => {
  if (!isString(str)) {
    throw (new TypeError('"str" is expected to be type of String.'))
  }
  const classArray = neatenClassString(str).split(' ').filter(s => s.length > 0)
  return classArray
}
/**
 * @param arr array of classnames
 * @return PlainObject which use classname as key and exist of classname as value
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
export const classArrayToClassObject = (arr: ClassArray): ClassObject => {
  if (!isArray(arr)) {
    throw (new TypeError('"arr" is expected to be type of Array.'))
  }
  const classObject: ClassObject = {}
  arr.flat(Infinity).filter(isString).forEach(s => {
    classObject[s] = true
  })
  return classObject
}
/**
 * Equal to `pipe(classStringToClassArray, classArrayToClassObject)`.
 *
 * @param str class string
 * @return PlainObject which use classname as key and exist of classname as value
 */
export const classStringToClassObject = (str: ClassString): ClassObject => {
  if (!isString(str)) {
    throw (new TypeError('"str" is expected to be type of String.'))
  }
  const classArray = classStringToClassArray(str)
  const classObject = classArrayToClassObject(classArray)
  return classObject
}
/**
 * Classname in target object which value is false will be ignored.
 *
 * @param classObject PlainObject which use classname as key and exist of classname as value
 * @return array of classnames
 */
export const classObjectToClassArray = (obj: ClassObject): ClassArray => {
  if (!isPlainObject(obj)) {
    throw (new TypeError('"obj" is expected to be type of PlainObject.'))
  }
  const classArray: string[] = []
  Object.entries(obj).filter(([key, value]) => value).forEach(([key, value]) => {
    classArray.push(key)
  })
  return classArray
}
/**
 * @param arr array of classnames
 * @return class string
 */
export const classArrayToClassString = (arr: ClassArray): ClassString => {
  if (!isArray(arr)) {
    throw (new TypeError('"arr" is expected to be type of Array.'))
  }
  const classString = arr.flat(Infinity).filter(isString).filter(s => s.length > 0).join(' ')
  return classString
}
/**
 * Same as `pipe(classObjectToClassArray, classArrayToClassString)`.
 *
 * @param classObject PlainObject which use classname as key and exist of classname as value
 * @return class string
 */
export const classObjectToClassString = (obj: ClassObject): ClassString => {
  if (!isPlainObject(obj)) {
    throw (new TypeError('"obj" is expected to be type of PlainObject.'))
  }
  const classArray = classObjectToClassArray(obj)
  const classString = classArrayToClassString(classArray)
  return classString
}
/**
 * @param tar target, type of classString | classArray | classObject
 * @return class string
 */
export const toClassString = (tar: ClassUnion): ClassString => {
  if (isString(tar)) {
    return '' + tar
  } else if (isArray(tar)) {
    return classArrayToClassString(tar)
  } else if (isPlainObject(tar)) {
    return classObjectToClassString(tar)
  } else {
    throw (new TypeError('"tar" is expected to be type of String | Array | Object.'))
  }
}
/**
 * @param tar target, type of classString | classArray | classObject
 * @return array of classnames
 */
export const toClassArray = (tar: ClassUnion): ClassArray => {
  if (isString(tar)) {
    return classStringToClassArray(tar)
  } else if (isArray(tar)) {
    return [...tar.flat(Infinity).filter(isString)]
  } else if (isPlainObject(tar)) {
    return classObjectToClassArray(tar)
  } else {
    throw (new TypeError('"tar" is expected to be type of String | Array | Object.'))
  }
}
/**
 * @param tar target, type of classString | classArray | classObject
 * @return { ClassObject } PlainObject which use classname as key and exist of classname as value
 */
export const toClassObject = (tar: ClassUnion): ClassObject => {
  if (isString(tar)) {
    return classStringToClassObject(tar)
  } else if (isArray(tar)) {
    return classArrayToClassObject(tar)
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
 * @return classString | classArray | classObject
 */
export const formatClassTo = curry(
  (target: string | any[] | Record<any, any>, cls: ClassUnion): typeof cls => {
    if (isString(target)) {
      return toClassString(cls)
    } else if (isArray(target)) {
      return toClassArray(cls)
    } else if (isPlainObject(target)) {
      return toClassObject(cls)
    } else {
      throw (new TypeError('"target" is expected to be type of String | Array | Object.'))
    }
  }
)

/**
 * Curried.
 * @param prefix classname prefix
 * @param cls class, type of classString | classArray | classObject
 * @return typeof param class, says classString | classArray | classObject
 */
export const prefixClassWith = curry((prefix: string, cls: ClassUnion): typeof cls => {
  if (isString(cls)) {
    const classArray = classStringToClassArray(cls).map(item =>
      item.indexOf(prefix) === 0 ? item : `${prefix}${item}`
    )
    const classString = classArrayToClassString(classArray)
    return classString
  } else if (isArray(cls)) {
    const classArray = cls.map(item =>
      item.indexOf(prefix) === 0 ? item : `${prefix}${item}`
    )
    return classArray
  } else if (isPlainObject(cls)) {
    const classObject: ClassObject = {}
    Object.entries(cls).forEach(([key, value]) => {
      const _key = key.indexOf(prefix) === 0 ? key : `${prefix}${key}`
      classObject[_key] = value
    })
    return classObject
  } else {
    throw (new Error('"cls"(aka. class) is expected to be type of String | Array | Object.'))
  }
})
/**
 * Curried.
 * @param prefix classname prefix
 * @param cls class, type of classString | classArray | classObject
 * @return typeof param class, says classString | classArray | classObject
 */
export const removePrefixOfClass = curry((prefix: string, cls: ClassUnion): typeof cls => {
  if (isString(cls)) {
    const classArray = classStringToClassArray(cls).map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length)
      }
      return item
    })
    const classString = classArrayToClassString(classArray)
    return classString
  } else if (isArray(cls)) {
    const classArray = cls.map(item => {
      if (item.indexOf(prefix) === 0) {
        return item.slice(prefix.length)
      }
      return item
    })
    return classArray
  } else if (isPlainObject(cls)) {
    const classObject: ClassObject = {}
    Object.entries(cls).forEach(([key, value]) => {
      const _key = key.indexOf(prefix) === 0 ? key.slice(prefix.length) : key
      classObject[_key] = value
    })
    return classObject
  } else {
    throw (new Error('"cls"(aka. class) is expected to be type of String | Array | Object.'))
  }
})

/**
 * Curried.
 * @param added class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return typeof param class, says classString | classArray | classObject
 */
export const addClass = curry((added: ClassUnion, target: ClassUnion): typeof target => {
  const addedClassObj = toClassObject(added)
  const targetClassObj = toClassObject(target)
  const resClassObj = { ...targetClassObj, ...addedClassObj }
  return formatClassTo(target, resClassObj)
})
/**
 * Curried.
 * @param removed class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return typeof param class, says classString | classArray | classObject
 */
export const removeClass = curry((removed: ClassUnion, target: ClassUnion): typeof target => {
  const removedClassObj = toClassObject(removed)
  Object.keys(removedClassObj).forEach(key => {
    removedClassObj[key] = false
  })
  const targetClassObj = toClassObject(target)
  const resClassObj = { ...targetClassObj, ...removedClassObj }
  return formatClassTo(target, resClassObj)
})
/**
 * Curried.
 * @param toggled class, type of classString | classArray | classObject
 * @param target class, type of classString | classArray | classObject
 * @return typeof param class, says classString | classArray | classObject
 */
export const toggleClass = curry((toggled: ClassUnion, target: ClassUnion): typeof target => {
  const toggledClassArr = toClassArray(toggled)
  const targetClassObj = toClassObject(target)
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
 * @return typeof param class, says classString | classArray | classObject
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
    const targetClassObj = toClassObject(target)
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
    const targetClassObj = toClassObject(target)
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
 * @return whether target class contains contained class
 */
export const containClass = curry((contained, target) => {
  const containedClassArr = toClassArray(contained)
  const targetClassArr = toClassArray(target)
  return containedClassArr.every(item => targetClassArr.includes(item))
})

// const classStr = ' mobius-add .   del'
// const classArr = ['mobius-add', 'del']
// const classObj = { 'mobius-add': true, del: false }

// console.log('【Type transformation】')
// console.log(classStringToClassArray(classStr))
// console.log(classArrayToClassObject(classArr))
// console.log(classStringToClassObject(classStr))
// console.log(classObjectToClassArray(classObj))
// console.log(classArrayToClassString(classArr))
// console.log(classObjectToClassString(classObj))
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
