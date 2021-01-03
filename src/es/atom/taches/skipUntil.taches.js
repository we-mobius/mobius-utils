import { curry } from '../../functional.js'
import { Mutation, isMutation } from '../atom.js'
import { TERMINATOR } from '../meta.js'
import { mutationToData } from './transform.taches.js'

export const skipUntilT = curry((condAtom, valAtom) => {
  let condD = condAtom
  if (isMutation(condAtom)) {
    condD = mutationToData(condAtom)
  }

  // 标识条件 Atom
  const wrapCondM = Mutation.ofLiftLeft(prev => {
    return {
      _type: 'cond',
      value: prev
    }
  })
  wrapCondM.observe(condD)
  const wrappedCondD = mutationToData(wrapCondM)

  // 标识值 Atom
  const wrapValM = Mutation.ofLiftLeft(prev => {
    return {
      _type: 'val',
      value: prev
    }
  })
  wrapValM.observe(valAtom)
  const wrappedValD = mutationToData(wrapValM)

  // 统一订阅
  const combineMutation = Mutation.ofLiftLeft((() => {
    const _state = { cond: false, val: false }
    const intervalValues = { val: undefined }
    return prev => {
      _state[prev._type] = true
      if (prev._type === 'val') {
        intervalValues.val = prev.value
      }
      if (_state.cond && _state.val) {
        return intervalValues.val
      } else {
        return TERMINATOR
      }
    }
  })())

  combineMutation.observe(wrappedCondD)
  combineMutation.observe(wrappedValD)

  const outputD = mutationToData(combineMutation)
  return outputD
})
