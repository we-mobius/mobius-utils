import { looseCurryN } from '../../functional'
import { Data, Mutation } from '../atoms'
import {
  TriggerMediator,
  ReplayMediator,
  FlatMediator
} from '../mediators'

import type { MutatorTransformation } from '../particles'
import type { Trigger, TriggerController } from '../atoms'
import type {
  TriggerMediatorOptions, ReplayMediatorOptions, FlatMediatorOptions,
  TriggerDataMediator, TriggerMutationMediator,
  ReplayDataMediator, ReplayMutationMediator,
  FlatDataMediator, FlatMutationMediator
} from '../mediators'

interface IWithMediator {
  <V>(
    atom: Data<V>, mediatorRepresentative: typeof TriggerMediator, options?: TriggerMediatorOptions
  ): [Data<V>, TriggerDataMediator<V>]
  <P, C>(
    atom: Mutation<P, C>, mediatorRepresentative: typeof TriggerMediator, options?: TriggerMediatorOptions
  ): [Mutation<P, C>, TriggerMutationMediator<P, C>]
  <V>(
    atom: Data<V>, mediatorRepresentative: typeof ReplayMediator, options?: ReplayMediatorOptions
  ): [Data<V>, ReplayDataMediator<V>]
  <P, C>(
    atom: Mutation<P, C>, mediatorRepresentative: typeof ReplayMediator, options?: ReplayMediatorOptions
  ): [Mutation<P, C>, ReplayMutationMediator<P, C>]
  <V>(
    atom: Data<V>, mediatorRepresentative: typeof FlatMediator, options?: FlatMediatorOptions
  ): [Data<V>, FlatDataMediator<V>]
  <P, C>(
    atom: Mutation<P, C>, mediatorRepresentative: typeof FlatMediator, options?: FlatMediatorOptions
  ): [Mutation<P, C>, FlatMutationMediator<P, C>]
}
/**
 * Create mediator of given atom, then return tuple of given atom & created mediator.
 *
 * @param atom Atom, i.e. Data or Mutation
 * @param mediatorRepresentative Mediator Representative
 * @param { Record<string, any> } [options] options of specified Mediator Representative.
 */
export const withMediator: IWithMediator = (atom: any, mediatorRepresentative: any, options: Record<string, any> = {}): any => {
  const _mediator = mediatorRepresentative.of(atom, options)
  return [atom, _mediator]
}
export const withMediator_ = looseCurryN(2, withMediator)

interface IWithTriggerMediator {
  <V>(atom: Data<V>, options?: TriggerMediatorOptions): [Data<V>, TriggerDataMediator<V>]
  <P, C>(atom: Mutation<P, C>, options?: TriggerMediatorOptions): [Mutation<P, C>, TriggerMutationMediator<P, C>]
}
/**
 * Create trigger mediator of given atom, then return tuple of given atom & created mediator.
 *
 * @param atom Atom, i.e. Data or Mutation
 * @param { TriggerMediatorOptions } [options] options of trigger mediator representative.
 */
export const withTriggerMediator: IWithTriggerMediator = (atom: any, options: any = {}): any => withMediator(atom, TriggerMediator, options)
export const withTriggerMediator_ = looseCurryN(1, withTriggerMediator)

interface IWithReplayMediator {
  <V>(atom: Data<V>, options?: ReplayMediatorOptions): [Data<V>, ReplayDataMediator<V>]
  <P, C>(atom: Mutation<P, C>, options?: ReplayMediatorOptions): [Mutation<P, C>, ReplayMutationMediator<P, C>]
}
/**
 * Create replay mediator of given atom, then return tuple of given atom & created mediator.
 *
 * @param atom Atom, i.e. Data or Mutation
 * @param { TriggerMediatorOptions } [options] options of replay mediator representative.
 */
export const withReplayMediator: IWithReplayMediator = (atom: any, options: any = {}): any => withMediator(atom, ReplayMediator, options)
export const withReplayMediator_ = looseCurryN(1, withReplayMediator)

interface IWithFlatMediator {
  <V>(atom: Data<V>, options?: FlatMediatorOptions): [Data<V>, FlatDataMediator<V>]
  <P, C>(atom: Mutation<P, C>, options?: FlatMediatorOptions): [Mutation<P, C>, FlatMutationMediator<P, C>]
}
/**
 * Create flat mediator of given atom, then return tuple of given atom & created mediator.
 *
 * @param atom Atom, i.e. Data or Mutation
 * @param { TriggerMediatorOptions } [options] options of flat mediator representative.
 */
export const withFlatMediator: IWithFlatMediator = (atom: any, options: any = {}): any => withMediator(atom, FlatMediator, options)
export const withFlatMediator_ = looseCurryN(1, withFlatMediator)

/**
 *
 */
export const createDataWithTriggerMediator = <V = any>(
  options: TriggerMediatorOptions = {}
): [Data<V>, TriggerDataMediator<V>] => withTriggerMediator<V>(Data.empty(), options)
export const createDataWithTriggerMediator_ = looseCurryN(0, createDataWithTriggerMediator)

/**
 *
 */
export const createMutationWithTriggerMediator = <P = any, C = any>(
  options: TriggerMediatorOptions = {}
): [Mutation<P, C>, TriggerMutationMediator<P, C>] => withTriggerMediator<P, C>(Mutation.empty(), options)
export const createMutationWithTriggerMediator_ = looseCurryN(0, createMutationWithTriggerMediator)

/**
 *
 */
export const createDataWithReplayMediator = <V = any>(
  options: ReplayMediatorOptions = {}
): [Data<V>, ReplayDataMediator<V>] => withReplayMediator<V>(Data.empty(), options)
export const createDataWithReplayMediator_ = looseCurryN(0, createDataWithReplayMediator)
/**
 *
 */
export const createMutationWithReplayMediator = <P = any, C = any>(
  options: ReplayMediatorOptions = {}
): [Mutation<P, C>, ReplayMutationMediator<P, C>] => withReplayMediator<P, C>(Mutation.empty(), options)
export const createMutationWithReplayMediator_ = looseCurryN(0, createMutationWithReplayMediator)

/**
 *
 */
export const createDataWithFlatMediator = <V = any>(
  options: FlatMediatorOptions = {}
): [Data<V>, FlatDataMediator<V>] => withFlatMediator<V>(Data.empty(), options)
export const createDataWithFlatMediator_ = looseCurryN(0, createDataWithFlatMediator)
/**
 *
 */
export const createMutationWithFlatMediator = <P = any, C = any>(
  options: FlatMediatorOptions = {}
): [Mutation<P, C>, FlatMutationMediator<P, C>] => withFlatMediator<P, C>(Mutation.empty<C>(), options)
export const createMutationWithFlatMediator_ = looseCurryN(0, createMutationWithFlatMediator)

/**
 *
 */
export const createDataWithTrigger = <V = any>(
  trigger: Trigger<V>,
  options: TriggerMediatorOptions = {}
): [Data<V>, TriggerDataMediator<V>, typeof options, typeof trigger, TriggerController] => {
  const [data, mediator] = createDataWithTriggerMediator<V>(options)
  const controller = mediator.register(trigger)
  return [data, mediator, options, trigger, controller]
}
export const createDataWithTrigger_ = looseCurryN(1, createDataWithTrigger)
/**
 *
 */
export const createMutationWithTrigger = <P = any, C = any>(
  trigger: Trigger<MutatorTransformation<P, C>>,
  options: TriggerMediatorOptions = {}
): [Mutation<P, C>, TriggerMutationMediator<P, C>, typeof options, typeof trigger, TriggerController] => {
  const [mutation, mediator] = createMutationWithTriggerMediator<P, C>(options)
  const controller = mediator.register(trigger)
  return [mutation, mediator, options, trigger, controller]
}
export const createMutationWithTrigger_ = looseCurryN(1, createMutationWithTrigger)

/**
 *
 */
export const createDataWithReplay = <V = any>(
  options: ReplayMediatorOptions = {}
): [Data<V>, ReplayDataMediator<V>, typeof options] => {
  const [data, mediator] = createDataWithReplayMediator<V>(options)
  return [data, mediator, options]
}
export const createDataWithReplay_ = looseCurryN(0, createDataWithReplay)
/**
 *
 */
export const createMutationWithReplay = <P = any, C = any>(
  options: ReplayMediatorOptions = {}
): [Mutation<P, C>, ReplayMutationMediator<P, C>, typeof options] => {
  const [mutation, mediator] = createMutationWithReplayMediator<P, C>(options)
  return [mutation, mediator, options]
}
export const createMutationWithReplay_ = looseCurryN(0, createMutationWithReplay)

/**
 *
 */
export const createDataWithFlat = <V = any>(
  options: FlatMediatorOptions = {}
): [Data<V>, FlatDataMediator<V>, typeof options] => {
  const [data, mediator] = createDataWithFlatMediator<V>(options)
  return [data, mediator, options]
}
export const createDataWithFlat_ = looseCurryN(0, createDataWithFlat)
/**
 *
 */
export const createMutationWithFlat = <P = any, C = any>(
  options: FlatMediatorOptions = {}
): [Mutation<P, C>, FlatMutationMediator<P, C>, typeof options] => {
  const [mutation, mediator] = createMutationWithFlatMediator<P, C>(options)
  return [mutation, mediator, options]
}
export const createMutationWithFlat_ = looseCurryN(0, createMutationWithFlat)
