const { composeL } = require('./functional.js')
const { applyTo } = require('./functional.js')

exports.semmantic = {
  equiped: composeL,
  equip: applyTo
}
