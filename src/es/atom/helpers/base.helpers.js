import { curryN } from '../../functional.js'
import { isAtom } from '../atom.js'
import { isMediator } from '../mediators.js'

export const getAtomType = tar => {
  return isMediator(tar) ? getAtomType(tar.atom) : tar.type
}

export const isSameTypeOfAtom = curryN(2, (tarA, tarB) => {
  if (!isAtom(tarA) || !isAtom(tarB)) {
    return false
  } else {
    const atomTypeA = getAtomType(tarA)
    const atomTypeB = getAtomType(tarB)
    return atomTypeA === atomTypeB
  }
})
export const isSameTypeOfMediator = curryN(2, (tarA, tarB) => isMediator(tarA) && isMediator(tarB) && tarA.type === tarB.type)
