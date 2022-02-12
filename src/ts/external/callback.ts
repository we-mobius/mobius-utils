import {
  Data, ReplayDataMediator,
  replayWithLatest,
  TriggerDataMediator,
  createFunctionTriggerAgent, createDataFromFunction
} from '../atom'

import type { TriggerController, TriggerMediatorOptions, DataTrigger } from '../atom'

type CallbackBatch<Value = any, Returned = Value> = [
  (value: Value) => void, Data<Returned>, TriggerDataMediator<Returned>, TriggerMediatorOptions, DataTrigger<Returned>, TriggerController
]
/**
 * @see {@link makeGeneralCallback}
 */
export const makeCallback = <Value = any, Returned = Value>(
  handler?: (value: Value) => Returned
): [...CallbackBatch<Value, Returned>] => {
  const defaultHandler = (value: Value): Value => value
  const agent = createFunctionTriggerAgent<[value: Value], Returned>(handler ?? defaultHandler as any)
  const collection = createDataFromFunction({ ...agent })

  return [agent.emit!, ...collection]
}

type GeneralCallbackBatch<Value = any, Returned = Value> = [
  ReplayDataMediator<(value: Value) => void>, (value: Value) => void,
  Data<Returned>, TriggerDataMediator<Returned>,
  TriggerMediatorOptions, DataTrigger<Returned>, TriggerController
]
/**
 * @see {@link makeCallback}
 */
export function makeGeneralCallback <Value = any, Returned = Value> (
  handler?: (value: Value) => Returned
): [...GeneralCallbackBatch<Value, Returned>] {
  const callbackCollection = makeCallback(handler)
  const [callback] = callbackCollection
  const callbackRD = replayWithLatest(1, Data.of(callback))
  return [callbackRD, ...callbackCollection]
}
