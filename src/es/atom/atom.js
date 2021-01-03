import { isData } from './atoms/data.atom.js'
import { isMutation } from './atoms/mutation.atom.js'

export * from './atoms/data.atom.js'
export * from './atoms/mutation.atom.js'

export const isAtom = tar => isData(tar) || isMutation(tar)
