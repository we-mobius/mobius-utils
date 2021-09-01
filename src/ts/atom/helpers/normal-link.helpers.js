import { isArray } from '../../internal.js'

export const pipeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  args.reverse().forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1])
    }
  })

  return args
}

export const composeAtom = (...args) => {
  if (args.length === 1 && isArray(args[0])) {
    args = args[0]
  }
  args.forEach((cur, idx, all) => {
    if (idx >= 1) {
      cur.beObservedBy(all[idx - 1])
    }
  })
  return args
}
