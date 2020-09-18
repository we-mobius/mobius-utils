import { filterTruthy, allPass, complement } from './index.js'
import { pathToArray } from './path.js'

// console.log(filterTruthy([1, 0, 2, 3]))

const isOdd = x => x % 2 !== 0
const isEven = complement(isOdd)
const isOne = x => x === 1
const isTwo = x => x === 2
console.log(allPass([isEven, isTwo], 2))

console.log(pathToArray('/shege'))
