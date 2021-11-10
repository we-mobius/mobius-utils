import { looseCurryN } from '../../functional'
import { Data, Mutation } from '../atom'
import { ReplayMediator, TriggerMediator } from '../mediators'

/**
 * create mediator of given atom, then return array of given atom & created mediator
 *
 * @param atom Atom
 * @param mediator Mediator
 * @param options optional, options of specified Mediator
 */
export const withMediator = looseCurryN(2, (atom, mediator, options) => {
  const _mediator = mediator.of(atom, options)
  return [atom, _mediator]
})

export const withReplayMediator = looseCurryN(1, (atom, options = {}) => withMediator(atom, ReplayMediator, options))
export const withTriggerMediator = looseCurryN(1, (atom, options = {}) => withMediator(atom, TriggerMediator, options))

/**
 * @return [data, replayMediator]
 */
export const createDataWithReplayMediator = (options = {}) => withReplayMediator(Data.empty(), options)
/**
 * @return [mutation, replayMediator]
 */
export const createMutationWithReplayMediator = (options = {}) => withReplayMediator(Mutation.empty(), options)

/**
 * @return [data, triggerMediator]
 */
export const createDataWithTriggerMediator = () => withTriggerMediator(Data.empty())
/**
 * @return [mutation, triggerMediator]
 */
export const createMutationWithTriggerMediator = () => withTriggerMediator(Mutation.empty())

/**
 * @param options optional, options of ReplayMediator
 * @return [data, replayMediator, options]
 */
export const createDataWithReplay = (options = {}) => {
  const [data, replayMediator] = createDataWithReplayMediator(options)
  return [data, replayMediator, options]
}
/**
 * @param options optional, options of ReplayMediator
 * @return [mutation, replayMediator, options]
 */
export const createMutationWithReplay = (options = {}) => {
  const [mutation, replayMediator] = createMutationWithReplayMediator(options)
  return [mutation, replayMediator, options]
}

/**
 * @param trigger Trigger
 * @return [data, triggerMediator, trigger, controller]
 */
export const createDataWithTrigger = trigger => {
  const [data, triggerMediator] = createDataWithTriggerMediator()
  const controller = triggerMediator.register(trigger)
  return [data, triggerMediator, trigger, controller]
}
/**
 * @param trigger Trigger
 * @return [mutation, triggerMediator, trigger, controller]
 */
export const createMutationWithTrigger = trigger => {
  const [mutation, triggerMediator] = createMutationWithTriggerMediator()
  const controller = triggerMediator.register(trigger)
  return [mutation, triggerMediator, trigger, controller]
}
