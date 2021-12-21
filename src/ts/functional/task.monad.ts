export {}
// import { inspect } from './__deps__'

// // Task\Continuation\Lazy Promise\Future
// export class Task {
//   // ({ reject, resolve }) => resolve(a)
//   constructor (fn) {
//     this._value = fn
//   }

//   static of (x) {
//     return new Task(({ reject, resolve }) => resolve(x))
//   }

//   get isTask () {
//     return true
//   }

//   inspect () {
//     return `Task(${inspect(this._value)})`
//   }

//   fork ({ reject, resolve }) {
//     return this._value({ reject, resolve })
//   }

//   // fn :: a -> a
//   map (fn) {
//     return new Task(({ reject, resolve }) => this.fork({
//       reject: reject,
//       resolve: x => resolve(fn(x))
//     }))
//   }

//   join () {
//     return new Task(({ reject, resolve }) => this.fork({
//       reject: reject,
//       resolve: mx => mx.fork({
//         reject, resolve: x => resolve(x)
//       })
//     }))
//     // return this.chain(identity)
//   }

//   // fn :: a -> ma
//   chain (fn) {
//     return new Task(({ reject, resolve }) => this.fork({
//       reject: reject,
//       resolve: x => fn(x).fork({ reject, resolve })
//     }))
//   }

//   // mfn :: a -> a
//   ap (mfn) {
//     return this.map(mfn._value)
//   }
// }
