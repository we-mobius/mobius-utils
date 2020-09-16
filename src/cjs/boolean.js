const { complement, curry, applyTo } = require('./functional.js')
const { every } = require('./array.js')

module.exports.isTrue = v => v === true
module.exports.isFalse = v => v === false

const isStrictTruthy = v => !!v === true
module.exports.isStrictTruthy = isStrictTruthy
const isStrictFalsy = v => !!v === false
module.exports.isStrictFalsy = isStrictFalsy
const isLooseFalsy = v => v === null || v === undefined
module.exports.isLooseFalsy = isLooseFalsy

module.exports.isLooseTruthy = complement(isLooseFalsy)
module.exports.isTruthy = isStrictTruthy
module.exports.isFalse = isStrictFalsy

module.exports.allPass = curry((tests, tar) => every(applyTo(tar), tests))
