import { isFunction } from '../../internal.js'
import { looseCurryN } from '../../functional.js'
import { Mutation, isMutation, Data, isData, isAtom } from '../atom.js'
import { isReplayMediator, replayWithLatest } from '../mediators.js'
import { isObject } from '../../internal/base.js'

const DEFAULT_MUTATION_OPTIONS = { liftType: 'both' }

/**
 * @param mutation Mutation
 * @return atom Data
 */
export const mutationToDataS = looseCurryN(1, (mutation, options = {}) => {
  if (!isMutation(mutation)) {
    throw (new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`))
  }
  if (!isObject(options)) {
    throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
  }

  const _data = Data.empty(options)
  _data.observe(mutation)

  if (isReplayMediator(mutation)) {
    return replayWithLatest(1, _data)
  } else {
    return _data
  }
})

/**
 * @param transform Function
 * @param mutation Mutation
 * @param options Object, optional
 * @return atom Data | ReplayMediator, same type of param "mutation"
 */
export const mutationToData = looseCurryN(2, (transform, mutation, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`))
  }
  if (!isObject(options)) {
    throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
  }

  const _data = Data.empty()
  const _mutation = Mutation.ofLift(transform, options)
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
    throw (new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`))
  }
  if (!isData(data)) {
    throw (new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`))
  }
  if (!isObject(options)) {
    throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
  }

  const _mutation = Mutation.ofLift(transform, options)
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
    throw (new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`))
  }
  if (!isAtom(atom)) {
    throw (new TypeError(`"atom" is expected to be type of "Mutation" | "Data", but received "${typeof atom}".`))
  }

  if (isMutation(atom)) {
    return mutationToData(transform, atom, options)
  }
  if (isData(atom)) {
    return dataToData(transform, atom, options)
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToData, expected "Mutation" | "Data".'))
})

/**
 * @param data Data
 * @return atom Mutation
 */
export const dataToMutationS = looseCurryN(1, (data, options = {}) => {
  if (!isData(data)) {
    throw (new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`))
  }
  if (!isObject(options)) {
    throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
  }

  const _mutation = Mutation.ofLiftBoth(prev => prev, options)

  _mutation.observe(data)

  if (isReplayMediator(data)) {
    return replayWithLatest(1, _mutation)
  } else {
    return _mutation
  }
})

/**
 * @param transform Function
 * @param data Atom
 * @param options Object, optional
 * @retrun atom Mutation
 */
export const dataToMutation = looseCurryN(2, (transform, data, options = { ...DEFAULT_MUTATION_OPTIONS }) => {
  if (!isFunction(transform)) {
    throw (new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`))
  }
  if (!isData(data)) {
    throw (new TypeError(`"data" is expected to be type of "Data", but received "${typeof data}".`))
  }
  if (!isObject(options)) {
    throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
  }

  const _mutation = Mutation.ofLift(transform, options)

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
    throw (new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`))
  }
  if (!isMutation(mutation)) {
    throw (new TypeError(`"mutation" is expected to be type of "Mutation", but received "${typeof mutation}".`))
  }
  if (!isObject(options)) {
    throw (new TypeError(`"options" is expected to be type of "Object", but received "${typeof options}".`))
  }

  const _data = Data.empty()
  const _mutation = Mutation.ofLift(transform, options)

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
    throw (new TypeError(`"transform" is expected to be type of "Function", but received "${typeof transform}".`))
  }
  if (!isAtom(atom)) {
    throw (new TypeError(`"atom" is expected to be type of "Mutation" | "Data", but received "${typeof atom}".`))
  }

  if (isMutation(atom)) {
    return mutationToMutation(transform, atom, options)
  }
  if (isData(atom)) {
    return dataToMutation(transform, atom, options)
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToMutation, expected "Mutation" | "Data".'))
})
