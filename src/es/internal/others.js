import { looseInvoker, invoker } from '../functional/helpers.js'

// @see: https://crocks.dev/docs/functions/helpers.html#composep
export const thenDo = invoker(2, 'then')
export const looseThenDo = looseInvoker(2, 'then')
export const catchReject = invoker(2, 'catch')

// const p = () => new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve('resolved')
//   }, 1000)
//   reject(new Error('rejected'))
// })
// pipe(p, thenDo(val => console.log(val)), catchReject(err => console.error(err)))()
// looseThenDo(val => console.log(val), err => console.error(err), p())
