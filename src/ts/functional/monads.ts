export {}
// import { reduce } from '../internal'
// import { curry, curryN, invoker } from './helpers'
// import { Either } from './either.monad'
// import { Maybe } from './maybe.monad'

// export * from './identity.monad'
// export * from './maybe.monad'
// export * from './either.monad'
// export * from './io.monad'
// export * from './task.monad'

// // predicate functions
// // @see https://crocks.dev/docs/functions/predicate-functions.html
// export const isFunctor = m => {}
// export const isMonad = m => {}
// export const isApplicative = m => {}
// export const isMonoid = m => {}
// // ……

// // point-free functions
// export const of = invoker(2, 'of')
// export const chain = invoker(2, 'chain')
// export const ap = invoker(2, 'ap')
// export const cata = invoker(1, 'cata')

// // helper functions
// export const liftN = curry((fnArgsLen, fn) => {
//   const lifted = curryN(fnArgsLen, fn)
//   return curryN(fnArgsLen, (...args) => {
//     return reduce(ap, args[0].map(lifted), args.slice(1))
//   })
// })
// export const lift = fn => liftN(fn.length, fn)
// // export const liftA2 = curry((f, a, b) => b.ap(a.map(f)))
// // export const liftA3 = curry((f, a, b, c) => c.ap(b.ap(a.map(f))))
// export const liftA2 = liftN(2)
// export const liftA3 = liftN(3)
// export const liftA4 = liftN(4)
// export const liftA5 = liftN(5)
// // ...

// // transformation functions
// export const maybeToEither = (left, m) => {
//   if (m.isNothing) {
//     return Either.left(left)
//   }
//   return m.chain(Either.right)
// }
// export const eitherToMaybe = e => {
//   if (e.isLeft) {
//     return Maybe.nothing()
//   }
//   return e.chain(Maybe.just)
// }
