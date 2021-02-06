import { curryN } from '../../functional.js'
import { Mutator, Datar } from '../meta.js'
import { isData, isMutation } from '../atom.js'

/**
 * @param value Any
 * @param target Atom
 * @return atom Atom, which is exactly the "target" param.
 */
export const setToT = curryN(2, (value, target) => {
  if (isData(target)) {
    return target.mutate(Mutator.of(() => value))
  } else if (isMutation(target)) {
    return target.mutate(Datar.of(value))
  } else {
    throw (new TypeError('"atom" argument of setToT are expected to be type of "Atom".'))
  }
})
