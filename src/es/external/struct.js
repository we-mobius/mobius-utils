import { isBoolean, isString, isNumber, isArray, isObject } from '../internal.js'
import { curryS } from '../functional.js'

export const struct = curryS((type, validatorMaker) => {
  return config => val => {
    const res = validatorMaker(config)(val)
    const { isValid } = res
    const detail = res.detail || {}
    const { path, message } = detail

    return [isValid, isValid ? undefined : message || 'Expected a value of type `' + type + `\`${path ? ' for `' + path + '`' : ''} but received "${JSON.stringify(val)}".`]
  }
})

export const boolean = struct('Boolean', () => val => {
  return {
    isValid: isBoolean(val)
  }
})
export const string = struct('String', () => val => {
  return {
    isValid: isString(val)
  }
})
export const number = struct('Number', () => val => {
  return {
    isValid: isNumber(val)
  }
})

export const array = struct('Array', config => val => {
  if (!isArray(val) || !config) {
    return {
      isValid: isArray(val)
    }
  }
  return val.reduce((acc, item) => {
    const [isValid, message] = config(item)
    acc.isValid = !acc.isValid ? false : isValid
    acc.detail.message = acc.detail.message || message
    return acc
  }, { isValid: true, detail: { message: undefined } })
})

export const object = struct('Object', () => val => {
  return {
    isValid: isObject(val)
  }
})

export const is = (data, struct) => {
  console.log(struct(data))
  return struct(data)[0]
}

// console.info(is({}, object()))
// console.info(is(312312, string()))
// console.info(is([123], array(string())))
