const { filter } = require('./array.js')
const { isTruthy, isFalsy } = require('./boolean.js')

exports.filterTruthy = filter(isTruthy)
exports.filterFalsy = filter(isFalsy)
