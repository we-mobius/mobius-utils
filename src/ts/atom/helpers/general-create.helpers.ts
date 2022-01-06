import { isUndefined } from '../../internal/base'
import { isVacuo, TERMINATOR } from '../metas'
import {
  Data, Mutation, DataOptions, MutationOptions, DEFAULT_DATA_OPTIONS, DEFAULT_MUTATION_OPTIONS
} from '../atoms'
import { ReplayDataMediator, ReplayMutationMediator, DEFAULT_REPLAY_MEDIATOR_OPTIONS } from '../mediators'

import type { Terminator } from '../metas'
import type { MutationLike } from '../atoms'
import type { ReplayMediatorOptions } from '../mediators'

interface GeneralDataCreateOptions extends DataOptions {
  isReplay?: boolean
  replay?: ReplayMediatorOptions
}
export const DEFAULT_GENERAL_DATA_CREATE_OPTIONS: GeneralDataCreateOptions = {
  ...DEFAULT_DATA_OPTIONS,
  isReplay: false
}

export function data <V> (value: V): Data<V>
export function data <V> (value: V, options: GeneralDataCreateOptions & { isReplay?: false }): Data<V>
export function data <V> (value: V, options: GeneralDataCreateOptions & { isReplay?: true }): ReplayDataMediator<V>
export function data <V> (
  value: V, options: GeneralDataCreateOptions = DEFAULT_GENERAL_DATA_CREATE_OPTIONS
): Data<V> | ReplayDataMediator<V> {
  const preparedOptions = { ...DEFAULT_GENERAL_DATA_CREATE_OPTIONS, ...options }

  // if `isReplay` is not provided, but `replay` is provided, then `isReplay` is true
  const isReplay = isUndefined(preparedOptions.replay) ? (preparedOptions.isReplay ?? false) : true
  const replayMediatorOptions = isReplay ? { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...preparedOptions.replay } : undefined

  const preparedData = Data.of(value, preparedOptions)
  let finalData: Data<V> | ReplayDataMediator<V> = preparedData

  if (isReplay) {
    finalData = ReplayDataMediator.of(preparedData, replayMediatorOptions)
  }

  return finalData
}

interface GeneralMutationCreateOptions extends MutationOptions {
  isReplay?: boolean
  replay?: ReplayMediatorOptions
}
export const DEFAULT_GENERAL_MUTATION_CREATE_OPTIONS: GeneralMutationCreateOptions = {
  ...DEFAULT_MUTATION_OPTIONS,
  isReplay: false
}

export function mutation <P, C> (
  transformation: (prev: P, cur: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C
): Mutation<P, C | Terminator>
export function mutation <P, C> (
  transformation: (prev: P, cur: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C,
  options: GeneralMutationCreateOptions & { isReplay?: false }
): Mutation<P, C | Terminator>
export function mutation <P, C> (
  transformation: (prev: P, cur: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C,
  options: GeneralMutationCreateOptions & { isReplay?: true }
): ReplayMutationMediator<P, C | Terminator>
export function mutation <P, C> (
  transformation: (prev: P, cur: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C,
  options: MutationOptions<P, C | Terminator> = DEFAULT_GENERAL_MUTATION_CREATE_OPTIONS
): Mutation<P, C | Terminator> | ReplayMutationMediator<P, C | Terminator> {
  const preparedOptions = { ...DEFAULT_GENERAL_DATA_CREATE_OPTIONS, ...options }

  // if `isReplay` is not provided, but `replay` is provided, then `isReplay` is true
  const isReplay = isUndefined(preparedOptions.replay) ? (preparedOptions.isReplay ?? false) : true
  const replayMediatorOptions = isReplay ? { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...preparedOptions.replay } : undefined

  const preparedMutation = Mutation.ofLiftBoth((prev, cur, mutation, ...contexts) => {
    if (isVacuo(prev)) return TERMINATOR
    return transformation(prev, cur as unknown as C, mutation, ...contexts)
  }, options)
  let finalMutation: Mutation<P, C | Terminator> | ReplayMutationMediator<P, C | Terminator> = preparedMutation

  if (isReplay) {
    finalMutation = ReplayMutationMediator.of(preparedMutation, replayMediatorOptions)
  }

  return finalMutation
}
