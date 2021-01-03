import { invoker } from '../functional.js'

export * from './helpers/create.helpers.js'

export const observe = invoker(2, 'observe')
export const beObservedBy = invoker(2, 'beObservedBy')

export const pipeAtom = (...args) => {
  args.reverse().forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1])
    }
  })
}
