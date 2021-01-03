import { Mutation, isMutation, Data, isData, isAtom } from '../atom.js'
import { pipeAtom } from '../helpers.js'

export const mutationToData = mutation => {
  if (!isMutation(mutation)) {
    throw (new TypeError('Argument of mutationToData is expected to be type of "Mutation" only.'))
  }
  const _data = Data.empty()
  _data.observe(mutation)
  return _data
}

export const dataToData = (data, transform = prev => prev) => {
  if (!isData(data)) {
    throw (new TypeError('Argument of dataToData is expected to be type of "Data" only.'))
  }
  const _mutation = Mutation.ofLiftBoth(transform)
  const _data = Data.empty()

  pipeAtom(data, _mutation, _data)

  return _data
}

export const atomToData = (atom, transform) => {
  if (!isAtom(atom)) {
    throw (new TypeError('Argument of atomToData is expected to be type of "Atom" only (i.e. "Data" | "Mutation").'))
  }
  if (isMutation(atom)) {
    return mutationToData(atom, transform)
  }
  if (isData(atom)) {
    return transform ? dataToData(transform) : atom
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToData.'))
}

export const dataToMutation = (data, transform = prev => prev) => {
  if (!isData(data)) {
    throw (new TypeError('Argument of dataToMutation is expected to be type of "Data" only.'))
  }
  const _mutation = Mutation.ofLiftBoth(transform)
  _mutation.observe(data)
  return _mutation
}

export const mutationToMutation = (mutation, transform = prev => prev) => {
  if (!isMutation(mutation)) {
    throw (new TypeError('Argument of mutationToMutation is expected to be type of "Mutation" only.'))
  }
  const _data = Data.empty()
  const _mutation = Mutation.ofLiftBoth(transform)

  pipeAtom(mutation, _data, _mutation)

  return _mutation
}

export const atomToMutation = (atom, transform) => {
  if (!isAtom(atom)) {
    throw (new TypeError('Argument of atomToMutation is expected to be type of "Atom" only (i.e. "Data" | "Mutation").'))
  }
  if (isMutation(atom)) {
    return transform ? mutationToMutation(atom, transform) : atom
  }

  if (isData(atom)) {
    return dataToMutation(atom, transform)
  }

  throw (new TypeError('Unrecognized type of "Atom" received in atomToMutation.'))
}
