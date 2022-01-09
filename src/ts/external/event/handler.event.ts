import {
  Data, ReplayDataMediator,
  replayWithLatest,
  TriggerDataMediator,
  createFunctionTriggerAgent, createDataFromFunction
} from '../../atom'

import type { SynthesizeEvent, EventHandler } from '../../@types'
import type { TriggerController, TriggerMediatorOptions, DataTrigger } from '../../atom'

type EventHandlerBatch<Target extends EventTarget = EventTarget, Returned = Event> = [
  EventHandler<Target>, Data<Returned>, TriggerDataMediator<Returned>, TriggerMediatorOptions, DataTrigger<Returned>, TriggerController
]
/**
 * @see {@link makeGeneralEventHandler}
 */
export const makeEventHandler = <Target extends EventTarget = EventTarget, Returned = Event>(
  handler?: (event: SynthesizeEvent<Target>) => Returned
): [...EventHandlerBatch<Target, Returned>] => {
  const defaultHandler = (event: SynthesizeEvent<Target>): SynthesizeEvent<Target> => event
  const agent = createFunctionTriggerAgent<[event: SynthesizeEvent<Target>], Returned>(handler ?? defaultHandler as any)
  const collection = createDataFromFunction({ ...agent })

  return [agent.emit!, ...collection]
}

type GeneralEventHandlerBatch<Target extends EventTarget = EventTarget, Returned = Event> = [
  ReplayDataMediator<EventHandler<Target>>, EventHandler<Target>,
  Data<Returned>, TriggerDataMediator<Returned>,
  TriggerMediatorOptions, DataTrigger<Returned>, TriggerController
]
/**
 * @see {@link makeEventHandler}
 */
export function makeGeneralEventHandler <Target extends EventTarget = EventTarget, Returned = Event> (
  handler?: (event: SynthesizeEvent<Target>) => Returned
): [...GeneralEventHandlerBatch<Target, Returned>] {
  const eventHandlerCollection = makeEventHandler(handler)
  const [eventHandler] = eventHandlerCollection
  const eventHandlerRD = replayWithLatest(1, Data.of(eventHandler))
  return [eventHandlerRD, ...eventHandlerCollection]
}
