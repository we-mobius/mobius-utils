import { looseCurryN } from '../../functional'
import { Data, Mutation } from '../atoms'
import {
  TriggerMediator,
  ReplayMediator,
  FlatMediator
} from '../mediators'

import type { Trigger, TriggerController } from '../atoms'
import type {
  TriggerMediatorOptions, ReplayMediatorOptions, FlatMediatorOptions,
  TriggerDataMediator, TriggerMutationMediator,
  ReplayDataMediator, ReplayMutationMediator,
  FlatDataMediator, FlatMutationMediator
} from '../mediators'

interface IWithMediator {
  <I extends Data<any>>(
    atom: I, mediatorRepresentative: typeof TriggerMediator, options?: TriggerMediatorOptions
  ): [I, TriggerDataMediator<I>]
  <I extends Mutation<any, any>>(
    atom: I, mediatorRepresentative: typeof TriggerMediator, options?: TriggerMediatorOptions
  ): [I, TriggerMutationMediator<I>]
  <I extends Data<any>>(
    atom: I, mediatorRepresentative: typeof ReplayMediator, options?: ReplayMediatorOptions
  ): [I, ReplayDataMediator<I>]
  <I extends Mutation<any, any>>(
    atom: I, mediatorRepresentative: typeof ReplayMediator, options?: ReplayMediatorOptions
  ): [I, ReplayMutationMediator<I>]
  <I extends Data<any>>(
    atom: I, mediatorRepresentative: typeof FlatMediator, options?: FlatMediatorOptions
  ): [I, FlatDataMediator<I>]
  <I extends Mutation<any, any>>(
    atom: I, mediatorRepresentative: typeof FlatMediator, options?: FlatMediatorOptions
  ): [I, FlatMutationMediator<I>]
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
  <I extends Data<any>>(atom: I, options?: TriggerMediatorOptions): [I, TriggerDataMediator<I>]
  <I extends Mutation<any, any>>(atom: I, options?: TriggerMediatorOptions): [I, TriggerMutationMediator<I>]
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
  <I extends Data<any>>(atom: I, options?: ReplayMediatorOptions): [I, ReplayDataMediator<I>]
  <I extends Mutation<any, any>>(atom: I, options?: ReplayMediatorOptions): [I, ReplayMutationMediator<I>]
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
  <I extends Data<any>>(atom: I, options?: FlatMediatorOptions): [I, FlatDataMediator<I>]
  <I extends Mutation<any, any>>(atom: I, options?: FlatMediatorOptions): [I, FlatMutationMediator<I>]
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
export const createDataWithTriggerMediator = (
  options: TriggerMediatorOptions = {}
): [Data<any>, TriggerDataMediator<Data<any>>] => withTriggerMediator(Data.empty(), options)
export const createDataWithTriggerMediator_ = looseCurryN(0, createDataWithTriggerMediator)
/**
 *
 */
export const createMutationWithTriggerMediator = (
  options: TriggerMediatorOptions = {}
): [Mutation<any, any>, TriggerMutationMediator<Mutation<any, any>>] => withTriggerMediator(Mutation.empty(), options)
export const createMutationWithTriggerMediator_ = looseCurryN(0, createMutationWithTriggerMediator)

/**
 *
 */
export const createDataWithReplayMediator = (
  options: ReplayMediatorOptions = {}
): [Data<any>, ReplayDataMediator<Data<any>>] => withReplayMediator(Data.empty(), options)
export const createDataWithReplayMediator_ = looseCurryN(0, createDataWithReplayMediator)
/**
 *
 */
export const createMutationWithReplayMediator = (
  options: ReplayMediatorOptions = {}
): [Mutation<any, any>, ReplayMutationMediator<Mutation<any, any>>] => withReplayMediator(Mutation.empty(), options)
export const createMutationWithReplayMediator_ = looseCurryN(0, createMutationWithReplayMediator)

/**
 *
 */
export const createDataWithFlatMediator = (
  options: FlatMediatorOptions = {}
): [Data<any>, FlatDataMediator<Data<any>>] => withFlatMediator(Data.empty(), options)
export const createDataWithFlatMediator_ = looseCurryN(0, createDataWithFlatMediator)
/**
 *
 */
export const createMutationWithFlatMediator = (
  options: FlatMediatorOptions = {}
): [Mutation<any, any>, FlatMutationMediator<Mutation<any, any>>] => withFlatMediator(Mutation.empty(), options)
export const createMutationWithFlatMediator_ = looseCurryN(0, createMutationWithFlatMediator)

/**
 *
 */
export const createDataWithTrigger = <V = any>(
  trigger: Trigger<V>,
  options: TriggerMediatorOptions = {}
): [Data<V>, TriggerDataMediator<Data<V>>, typeof options, typeof trigger, TriggerController] => {
  const [data, mediator] = createDataWithTriggerMediator(options)
  const controller = mediator.register(trigger)
  return [data, mediator, options, trigger, controller]
}
export const createDataWithTrigger_ = looseCurryN(1, createDataWithTrigger)
/**
 *
 */
export const createMutationWithTrigger = (
  trigger: Trigger<any>,
  options: TriggerMediatorOptions = {}
): [Mutation<any, any>, TriggerMutationMediator<Mutation<any, any>>, typeof options, typeof trigger, TriggerController] => {
  const [data, mediator] = createMutationWithTriggerMediator(options)
  const controller = mediator.register(trigger)
  return [data, mediator, options, trigger, controller]
}
export const createMutationWithTrigger_ = looseCurryN(1, createMutationWithTrigger)

/**
 *
 */
export const createDataWithReplay = (
  options: ReplayMediatorOptions = {}
): [Data<any>, ReplayDataMediator<Data<any>>, typeof options] => {
  const [data, mediator] = createDataWithReplayMediator(options)
  return [data, mediator, options]
}
export const createDataWithReplay_ = looseCurryN(0, createDataWithReplay)
/**
 *
 */
export const createMutationWithReplay = (
  options: ReplayMediatorOptions = {}
): [Mutation<any, any>, ReplayMutationMediator<Mutation<any, any>>, typeof options] => {
  const [mutation, mediator] = createMutationWithReplayMediator(options)
  return [mutation, mediator, options]
}
export const createMutationWithReplay_ = looseCurryN(0, createMutationWithReplay)

/**
 *
 */
export const createDataWithFlat = (
  options: FlatMediatorOptions = {}
): [Data<any>, FlatDataMediator<Data<any>>, typeof options] => {
  const [data, mediator] = createDataWithFlatMediator(options)
  return [data, mediator, options]
}
export const createDataWithFlat_ = looseCurryN(0, createDataWithFlat)
/**
 *
 */
export const createMutationWithFlat = (
  options: FlatMediatorOptions = {}
): [Mutation<any, any>, FlatMutationMediator<Mutation<any, any>>, typeof options] => {
  const [mutation, mediator] = createMutationWithFlatMediator(options)
  return [mutation, mediator, options]
}
export const createMutationWithFlat_ = looseCurryN(0, createMutationWithFlat)
