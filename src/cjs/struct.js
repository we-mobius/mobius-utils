const { simpleCurry } = require('./functional.js')
const { isBoolean, isString, isNumber, isArray, isObject } = require('./base.js')

const struct = simpleCurry((type, validatorMaker) => {
  return config => val => {
    const res = validatorMaker(config)(val)
    const { isValid } = res
    const detail = res.detail || {}
    const { path, message } = detail

    return [isValid, isValid ? undefined : message || 'Expected a value of type `' + type + `\`${path ? ' for `' + path + '`' : ''} but received "${JSON.stringify(val)}".`]
  }
})
exports.struct = struct

const boolean = struct('Boolean', () => val => {
  return {
    isValid: isBoolean(val)
  }
})
exports.boolean = boolean

const string = struct('String', () => val => {
  return {
    isValid: isString(val)
  }
})
exports.string = string

const number = struct('Number', () => val => {
  return {
    isValid: isNumber(val)
  }
})
exports.number = number

const array = struct('Array', config => val => {
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
exports.array = array

const object = struct('Object', () => val => {
  return {
    isValid: isObject(val)
  }
})
exports.object = object

const is = (data, struct) => {
  console.log(struct(data))
  return struct(data)[0]
}
exports.is = is

// console.info(is({}, object()))
// console.info(is(312312, string()))
console.info(is([123], array(string())))
