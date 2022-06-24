import { isUndefined } from '../../internal/base'
import { isVacuo, TERMINATOR } from '../metas'
import {
  Data, Mutation, DataOptions, MutationOptions, DEFAULT_DATA_OPTIONS, DEFAULT_MUTATION_OPTIONS
} from '../atoms'
import { ReplayDataMediator, ReplayMutationMediator, DEFAULT_REPLAY_MEDIATOR_OPTIONS } from '../mediators'

import type { Terminator } from '../metas'
import type { MutationLike } from '../atoms'
import type { ReplayMediatorOptions } from '../mediators'

interface GeneralDataMakeOptions extends DataOptions {
  isReplay?: boolean
  replayOptions?: ReplayMediatorOptions
}
export const DEFAULT_GENERAL_DATA_MAKE_OPTIONS: Required<Omit<GeneralDataMakeOptions, 'replayOptions'>> = {
  ...DEFAULT_DATA_OPTIONS,
  isReplay: false
}

export function data <V = any> (value: V): Data<V>
export function data <V = any> (value: V, options: GeneralDataMakeOptions & { isReplay: false }): Data<V>
export function data <V = any> (value: V, options: GeneralDataMakeOptions & { isReplay: true }): ReplayDataMediator<V>
export function data <V = any> (
  value: V, options: GeneralDataMakeOptions = DEFAULT_GENERAL_DATA_MAKE_OPTIONS
): Data<V> | ReplayDataMediator<V> {
  const preparedOptions = { ...DEFAULT_GENERAL_DATA_MAKE_OPTIONS, ...options }

  // if `replayOptions` is exist, it is reasonable to set `isReplay` to true.
  if (!isUndefined(preparedOptions.replayOptions)) {
    preparedOptions.isReplay = true
    preparedOptions.replayOptions = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...preparedOptions.replayOptions }
  }

  const { isReplay, replayOptions: replayMediatorOptions } = preparedOptions

  const preparedData = Data.of(value, preparedOptions)
  let finalData: Data<V> | ReplayDataMediator<V> = preparedData

  if (isReplay) {
    finalData = ReplayDataMediator.of(preparedData, replayMediatorOptions)
  }

  return finalData
}

interface GeneralMutationMakeOptions<P = any, C = any, Contexts extends any[] = any[]> extends MutationOptions<P, C, Contexts> {
  isReplay?: boolean
  replayOptions?: ReplayMediatorOptions
}
export const DEFAULT_GENERAL_MUTATION_MAKE_OPTIONS: Required<Omit<GeneralMutationMakeOptions, 'replayOptions'>> = {
  ...DEFAULT_MUTATION_OPTIONS,
  isReplay: false
}

export function mutation <P = any, C = any> (
  transformation: (previous: P, current: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C
): Mutation<P, C | Terminator>
export function mutation <P = any, C = any> (
  transformation: (previous: P, current: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C,
  options: GeneralMutationMakeOptions & { isReplay: false }
): Mutation<P, C | Terminator>
export function mutation <P = any, C = any> (
  transformation: (previous: P, current: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C,
  options: GeneralMutationMakeOptions & { isReplay: true }
): ReplayMutationMediator<P, C | Terminator>
export function mutation <P = any, C = any> (
  transformation: (previous: P, current: C, mutation?: MutationLike<P, C | Terminator>, ...contexts: any[]) => C,
  options: GeneralMutationMakeOptions<P, C | Terminator> = DEFAULT_GENERAL_MUTATION_MAKE_OPTIONS
): Mutation<P, C | Terminator> | ReplayMutationMediator<P, C | Terminator> {
  const preparedOptions = { ...DEFAULT_GENERAL_DATA_MAKE_OPTIONS, ...options }

  // if `replayOptions` is exist, it is reasonable to set `isReplay` to true.
  if (!isUndefined(preparedOptions.replayOptions)) {
    preparedOptions.isReplay = true
    preparedOptions.replayOptions = { ...DEFAULT_REPLAY_MEDIATOR_OPTIONS, ...preparedOptions.replayOptions }
  }

  const { isReplay, replayOptions: replayMediatorOptions } = preparedOptions

  const preparedMutation = Mutation.ofLiftBoth((previous, current, mutation, ...contexts) => {
    if (isVacuo(previous)) return TERMINATOR
    return transformation(previous, current as unknown as C, mutation, ...contexts)
  }, options)
  let finalMutation: Mutation<P, C | Terminator> | ReplayMutationMediator<P, C | Terminator> = preparedMutation

  if (isReplay) {
    finalMutation = ReplayMutationMediator.of(preparedMutation, replayMediatorOptions)
  }

  return finalMutation
}
