import { isArray } from '../../internal.js'
import { TERMINATOR, isTerminator } from '../meta.js'
import { Mutation, isMutation, Data, isData } from '../atom.js'
import { mutationToData } from './transform.taches.js'

export const combineT = (...args) => {
  let atoms = args[0]
  if (!isArray(atoms)) {
    atoms = args
  }
  // 统一转换为 Data Atom
  const inputDatas = atoms.map(atom => {
    if (isData(atom)) {
      return atom
    }
    if (isMutation(atom)) {
      return mutationToData(atom)
    }
    throw (new TypeError('Arguments of combine are expected to be type of "Mutation" or "Data".'))
  })

  // 使用 Mutation Atom 包装一层
  const wrappedMutations = inputDatas.map((data, idx) => {
    const _mutation = Mutation.ofLiftLeft((prev) => {
      return {
        _id: idx,
        value: prev
      }
    })
    _mutation.observe(data)
    return _mutation
  })

  // 转换为 Data Atom
  const wrappedDatas = wrappedMutations.map(mutation => {
    const _data = Data.empty()
    _data.observe(mutation)
    return _data
  })

  // 关键：使用 Mutation Atom 统一订阅
  const combineMutation = wrappedDatas.reduce((mutation, data) => {
    mutation.observe(data)
    return mutation
  }, Mutation.ofLiftLeft((() => {
    const _state = Array.from({ length: atoms.length })
    const intervalValues = Array.from({ length: atoms.length })
    return prev => {
      _state[prev._id] = true
      intervalValues[prev._id] = prev.value
      if (_state.every(val => val) && intervalValues.every(val => !isTerminator(val))) {
        return intervalValues
      } else {
        return TERMINATOR
      }
    }
  })()))

  // 输出 Data Atom
  const outputData = Data.empty()
  outputData.observe(combineMutation)
  return outputData
}
