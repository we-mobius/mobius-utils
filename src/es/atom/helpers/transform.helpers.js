import { isFunction } from '../../internal.js'
import { looseCurryN } from '../../functional.js'
import { Mutation, isMutation, Data, isData, isAtom } from '../atom.js'
import { isReplayMediator, replayWithLatest } from '../mediators.js'

const DEFAULT_MUTATION_OPTIONS = { type: 'both' }

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
 * @param options Object, optional
 * @return atom Data | ReplayMediator, same type of param "mutation"
 */
export const mutationToData = looseCurryN(2, (transform, mutation, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of mutationToData is expected to be type of "Function".'))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" argument of mutationToData is expected to be type of "Mutation" only.'))
  }

  const { type = 'both' } = options

  const _data = Data.empty()
  const _mutation = Mutation.ofLift(transform, { type })
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
 * @param options Object, optional
 * @return atom Data | ReplayMediator, same type of param "data"
 */
export const dataToData = looseCurryN(2, (transform, data, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of dataToData is expected to be type of "Function".'))
  }
  if (!isData(data)) {
    throw (new TypeError('"transform" argument of dataToData is expected to be type of "Data" only.'))
  }

  const { type = 'both' } = options

  const _mutation = Mutation.ofLift(transform, { type })
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
 * @param options Object, optional
 * @return atom Data
 */
export const atomToData = looseCurryN(2, (transform, atom, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of atomToData is expected to be type of "Function".'))
  }
  if (!isAtom(atom)) {
    throw (new TypeError('"atom" argument of atomToData is expected to be type of "Atom" only (i.e. "Data" | "Mutation").'))
  }
  const { type = 'both' } = options
  if (isMutation(atom)) {
    return mutationToData(transform, atom, { type })
  }
  if (isData(atom)) {
    return dataToData(transform, atom, { type })
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
 * @param options Object, optional
 * @retrun atom Mutation
 */
export const dataToMutation = looseCurryN(2, (transform, data, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of dataToMutation is expected to be type of "Function".'))
  }
  if (!isData(data)) {
    throw (new TypeError('"data" argument of dataToMutation is expected to be type of "Data" only.'))
  }

  const { type = 'both' } = options

  const _mutation = Mutation.ofLift(transform, { type })

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
 * @param options Object, optional
 * @return atom Mutation
 */
export const mutationToMutation = looseCurryN(2, (transform, mutation, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of mutationToMutation is expected to be type of "Function".'))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError('"mutation" argument of mutationToMutation is expected to be type of "Mutation" only.'))
  }

  const { type = 'both' } = options

  const _data = Data.empty()
  const _mutation = Mutation.ofLift(transform, { type })

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
 * @param options Object, optional
 * @param atom Mutation
 */
export const atomToMutation = looseCurryN(2, (transform, atom, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError('"transform" argument of atomToMutation is expected to be type of "Function".'))
  }
  if (!isAtom(atom)) {
    throw (new TypeError('"atom" argument of atomToMutation is expected to be type of "Atom" only (i.e. "Data" | "Mutation").'))
  }

  const { type = 'both' } = options

  if (isMutation(atom)) {
    return mutationToMutation(transform, atom, { type })
  }
  if (isData(atom)) {
    return dataToMutation(transform, atom, { type })
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToMutation, expected "Mutation" | "Data".'))
})
