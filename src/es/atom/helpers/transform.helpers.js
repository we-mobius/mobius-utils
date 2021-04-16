import { isFunction } from '../../internal.js'
import { curryN } from '../../functional.js'
import { Mutation, isMutation, Data, isData, isAtom } from '../atom.js'
import { isReplayMediator, replayWithLatest } from '../mediators.js'

/**
 * @param mutation Mutation
 * @return atom Data
 */
export const mutationToDataS = mutation => {
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" argument of mutationToDataS is expected to be type of "Mutation" only.'))
  }

  const _data = Data.empty()
  _data.observe(mutation)

  if (isReplayMediator(mutation)) {
    return replayWithLatest(1, _data)
  } else {
    return _data
  }
}

/**
 * @param transform Function
 * @param mutation Mutation
 * @return atom Data | ReplayMediator, same type of param "mutation"
 */
export const mutationToData = curryN(2, (transform, mutation) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of mutationToData is expected to be type of "Function".'))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" argument of mutationToData is expected to be type of "Mutation" only.'))
  }

  const _data = Data.empty()
  const _mutation = Mutation.ofLiftBoth(transform)
  const _data2 = Data.empty()

  _data2.observe(_mutation)
  _mutation.observe(_data)
  _data.observe(mutation)

  if (isReplayMediator(mutation)) {
    return replayWithLatest(1, _data2)
  } else {
    return _data2
  }
})

/**
 * @param transform Function
 * @param data Data | ReplayMediator
 * @return atom Data | ReplayMediator, same type of param "data"
 */
export const dataToData = curryN(2, (transform, data) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of dataToData is expected to be type of "Function".'))
  }
  if (!isData(data)) {
    throw (new TypeError('"transform" argument of dataToData is expected to be type of "Data" only.'))
  }

  const _mutation = Mutation.ofLiftBoth(transform)
  const _data = Data.empty()

  _data.observe(_mutation)
  _mutation.observe(data)

  if (isReplayMediator(data)) {
    return replayWithLatest(1, _data)
  } else {
    return _data
  }
})

/**
 * @param transform Function
 * @param atom Atom
 * @return atom Data
 */
export const atomToData = curryN(2, (transform, atom) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of atomToData is expected to be type of "Function".'))
  }
  if (!isAtom(atom)) {
    throw (new TypeError('"atom" argument of atomToData is expected to be type of "Atom" only (i.e. "Data" | "Mutation").'))
  }
  if (isMutation(atom)) {
    return mutationToData(transform, atom)
  }
  if (isData(atom)) {
    return dataToData(transform, atom)
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToData, expected "Mutation" | "Data".'))
})

/**
 * @param data Data
 * @return atom Mutation
 */
export const dataToMutationS = data => {
  if (!isData(data)) {
    throw (new TypeError('"data" argument of dataToMutationS is expected to be type of "Data" only.'))
  }

  const _mutation = Mutation.ofLiftBoth(prev => prev)

  _mutation.observe(data)

  if (isReplayMediator(data)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
}

/**
 * @param transform Function
 * @param data Atom
 * @retrun atom Mutation
 */
export const dataToMutation = curryN(2, (transform, data) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of dataToMutation is expected to be type of "Function".'))
  }
  if (!isData(data)) {
    throw (new TypeError('"data" argument of dataToMutation is expected to be type of "Data" only.'))
  }

  const _mutation = Mutation.ofLiftBoth(transform)

  _mutation.observe(data)

  if (isReplayMediator(data)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
})

/**
 * @param transform Function
 * @param mutation Mutation
 * @return atom Mutation
 */
export const mutationToMutation = curryN(2, (transform, mutation) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of mutationToMutation is expected to be type of "Function".'))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" argument of mutationToMutation is expected to be type of "Mutation" only.'))
  }

  const _data = Data.empty()
  const _mutation = Mutation.ofLiftBoth(transform)

  _mutation.observe(_data)
  _data.observe(mutation)

  if (isReplayMediator(mutation)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
})

/**
 * @param transform Function
 * @param atom Atom
 * @param atom Mutation
 */
export const atomToMutation = curryN(2, (transform, atom) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of atomToMutation is expected to be type of "Function".'))
  }
  if (!isAtom(atom)) {
    throw (new TypeError('"atom" argument of atomToMutation is expected to be type of "Atom" only (i.e. "Data" | "Mutation").'))
  }

  if (isMutation(atom)) {
    return mutationToMutation(transform, atom)
  }
  if (isData(atom)) {
    return dataToMutation(transform, atom)
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToMutation, expected "Mutation" | "Data".'))
})
