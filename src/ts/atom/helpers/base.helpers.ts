import { curryN } from '../../functional'
import { isAtom } from '../atom'
import { isMediator } from '../mediators'

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
