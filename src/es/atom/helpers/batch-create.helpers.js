import { isArray, isObject, isFunction } from '../../internal.js'
import { looseCurryN } from '../../functional.js'
import { Data, Mutation, isData, isMutation, isAtom } from '../atom.js'
import { mutationToDataS, dataToMutationS } from './transform.helpers.js'

/**
 * items will be wrapped in Data.
 */
const forceWrapToData = (item) => Data.of(item)
/**
 * Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */
const wrapToData = (item) => isData(item) ? item : (isMutation(item) ? mutationToDataS(item) : Data.of(item))
/**
 * forceWrap - true: items will be wrapped in Data.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */
export const createDataInArray = looseCurryN(1, (arr, options = {}) => {
  if (!isArray(arr)) {
    throw new TypeError(`"arr" argument in createDataInArray is expected to be type of "Array", but received ${typeof arr}.`)
  }

  const { forceWrap = false } = options

  const wrapFn = forceWrap ? forceWrapToData : wrapToData
  return arr.map(wrapFn)
})
/**
 * forceWrap - true: items will be wrapped in Data.
 *
 * forceWrap - false: Mutations will be transform to Data, Datas will not be handled, other values will be wrapped in Data.
 */
export const createDataInObject = looseCurryN(1, (obj, options = { }) => {
  if (!isObject(obj)) {
    throw new TypeError(`"obj" argument in createDataInObject is expected to be type of "Objcet", but received ${typeof obj}.`)
  }
  const { forceWrap = false } = options
  const result = {}

  const wrapFn = forceWrap ? forceWrapToData : wrapToData
  Object.keys(obj).map(key => {
    result[key] = wrapFn(obj[key])
  })

  return result
})

/**
 * Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */
const forceWrapToMutation = (item) => {
  if (isFunction(item)) {
    return Mutation.of(item)
  } else {
    return Mutation.of(() => item)
  }
}
/**
 * items will be wrapped in Mutation.
 */
const wrapToMutation = (item) => {
  if (isData(item)) {
    return dataToMutationS(item)
  } else if (isMutation(item)) {
    return item
  } else if (isFunction(item)) {
    return Mutation.of(item)
  } else {
    return Mutation.of(() => item)
  }
}
/**
 * forceWrap - true: items will be wrapped in Mutation.
 *
 * forceWrap - false: Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */
export const createMutationInArray = looseCurryN(1, (arr, options = {}) => {
  if (!isArray(arr)) {
    throw new TypeError(`"arr" argument in createMutationInArray is expected to be type of "Array", but received ${typeof arr}.`)
  }
  const { forceWrap = false } = options

  const wrapFn = forceWrap ? forceWrapToMutation : wrapToMutation
  return arr.map(wrapFn)
})
/**
 * forceWrap - true: items will be wrapped in Mutation.
 *
 * forceWrap - false: Datas will be transform to Mutation, Mutations will not be handled, other values will be wrapped in Mutation.
 */
export const createMutationInObject = looseCurryN(1, (obj, options = {}) => {
  if (!isObject(obj)) {
    throw new TypeError(`"obj" argument in createMutationInObject is expected to be type of "Objcet", but received ${typeof obj}.`)
  }
  const { forceWrap = false } = options

  const result = {}
  const wrapFn = forceWrap ? forceWrapToMutation : wrapToMutation
  Object.keys(obj).map(key => {
    result[key] = wrapFn(obj[key])
  })

  return result
})

/**
 * functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
const forceWrapToAtom = (item) => {
  if (isFunction(item)) {
    return Mutation.of(item)
  } else {
    return Data.of(item)
  }
}

/**
 * Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
const wrapToAtom = (item) => {
  if (isAtom(item)) {
    return item
  } else if (isFunction(item)) {
    return Mutation.of(item)
  } else {
    return Data.of(item)
  }
}

/**
 * forceWrap - true: functions will be wrapped in Mutation, other values will be wrapped in Data.
 *
 * forceWrap - false: Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
export const createAtomInArray = looseCurryN(1, (arr, options = {}) => {
  if (!isArray(arr)) {
    throw new TypeError(`"arr" argument in createAtomInArray is expected to be type of "Array", but received ${typeof arr}.`)
  }
  const { forceWrap = false } = options

  const wrapFn = forceWrap ? forceWrapToAtom : wrapToAtom
  return arr.map(wrapFn)
})
/**
 * forceWrap - true: functions will be wrapped in Mutation, other values will be wrapped in Data.
 *
 * forceWrap - false: Atoms will not be handled, functions will be wrapped in Mutation, other values will be wrapped in Data.
 */
export const createAtomInObject = looseCurryN(1, (obj, options = {}) => {
  if (!isObject(obj)) {
    throw new TypeError(`"obj" argument in createMutationInObject is expected to be type of "Objcet", but received ${typeof obj}.`)
  }
  const { forceWrap = false } = options

  const result = {}
  const wrapFn = forceWrap ? forceWrapToAtom : wrapToAtom
  Object.keys(obj).map(key => {
    result[key] = wrapFn(obj[key])
  })

  return result
})
