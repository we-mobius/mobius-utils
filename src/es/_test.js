import { compose, flip, curryS, curry, curryN, looseCurryN, unary } from './functional.js'
import { map, flat, get, getByPath } from './internal.js'

// const a = [1, 2, 3]
// const b = [4, 5, 6]
// const sum = curryS((x, y) => x + y) // unary(sum) -> x => y => x + y

// const res = map(unary(compose(flip(map)(b), sum)), a)

// console.log(flat(res))

console.log(getByPath('a.b,c/e/"f".["g.h"]\\i\\j', { a: { b: { c: 'gg' } } }))
