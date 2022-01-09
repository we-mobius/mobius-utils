import {
  isFunction, isNumber, isPlainObject,
  isEventTarget, isObservable, isIterable,
  asIs
} from '../../internal/base'
import { pipe } from '../../functional'
import { createDataWithTrigger, createMutationWithTrigger } from './hybrid-create.helpers'

import type { SynthesizeEvent } from '../../@types'
import type { InternalTrigger, Trigger } from '../atoms'
import type { Observable, Subscription } from 'rxjs'

/************************************************************************************************************************
 *
 *                                                 IterableTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface IterableTriggerCreateOptions<V = any, R = any> {
  iterable: Iterable<V>
  autoStart?: boolean
  repeatable?: boolean
  handler?: (arg: V, ...args: any[]) => R
}

const DEFAULT_ITERABLE_TRIGGER_CREATE_OPTIONS: Omit<Required<IterableTriggerCreateOptions<any, any>>, 'iterable'> = {
  autoStart: false,
  repeatable: true,
  handler: asIs
}

/**
 * @param options.iterable which values will be trigged in sequence
 * @param [options.autoStart = false] indicate if the iterable will be iterated automatically
 * @param [options.repeatable = true] indicate if the iterable will be iterated repeatedly
 * @param [options.handler = asIs] will be apply to values before them passed to trigger
 */
export const createIterableTrigger = <V = any, R = V>(options: IterableTriggerCreateOptions<V, R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions: Required<IterableTriggerCreateOptions<V, R>> = {
    ...DEFAULT_ITERABLE_TRIGGER_CREATE_OPTIONS, ...options
  }
  const { iterable, autoStart, repeatable, handler } = preparedOptions

  if (!isIterable(iterable)) {
    throw (new TypeError('"iterable" is expected to be type of "Iterable".'))
  }
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be type of "Function".'))
  }

  interface IterateStates { times: number, done: boolean, values: V[] }

  const iterateStates: IterateStates = { times: 0, done: false, values: [] }
  const internalTriggers: Set<InternalTrigger<R>> = new Set()

  const iterate = (): IterateStates => {
    try {
      iterateStates.values = [...iterable]
      iterateStates.values.forEach(i => {
        internalTriggers.forEach(trigger => {
          trigger(handler(i))
        })
      })
      iterateStates.done = true
      iterateStates.times += 1
    } catch (error) {
    }
    return iterateStates
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (autoStart) {
      iterate()
    }

    return {
      start: () => {
        if (repeatable || iterateStates.times === 0) {
          return iterate()
        }
        return iterateStates
      },
      pause: () => {
        // do nothing
      },
      cancel: () => {
        // do nothing
      }
    }
  }
}
export const createDataFromIterable = pipe(createIterableTrigger, createDataWithTrigger)
export const createMutationFromIterable = pipe(createIterableTrigger, createMutationWithTrigger)

/************************************************************************************************************************
 *
 *                                                 EventTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface EventTriggerCreateOptions<Target extends EventTarget = EventTarget, Returned = Event> {
  target: Target
  type: string
  autoStart?: boolean
  handler?: (event: SynthesizeEvent<Target>, ...args: any[]) => Returned
}

const DEFAULT_EVENT_TRIGGER_CREATE_OPTIONS: Omit<Required<EventTriggerCreateOptions<any, any>>, 'target' | 'type'> = {
  autoStart: true,
  handler: asIs
}

/**
 * @param options.target which has addEventListener method & removeEventListener method
 * @param options.type event type which will pass as first argument of addEventListener & removeEventListener
 * @param [options.autoStart = true] indicate if the event will be listened automatically
 * @param [options.handler = asIs] will be apply to event argument before it passed to trigger
 */
export const createEventTrigger = <Target extends EventTarget = EventTarget, Returned = Event>(
  options: EventTriggerCreateOptions<Target, Returned>
): Trigger<Returned> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }
  const preparedOptions: Required<EventTriggerCreateOptions<Target, Returned>> = {
    ...DEFAULT_EVENT_TRIGGER_CREATE_OPTIONS, ...options
  }
  const { target, type, autoStart, handler } = preparedOptions

  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be type of "Function".'))
  }

  if (!isEventTarget(target)) {
    throw (new TypeError('"target" is expected to be type of "EventTarget".'))
  }

  return internalTrigger => {
    const listener = ((event: SynthesizeEvent<Target>) => {
      internalTrigger(handler(event))
    }) as unknown as EventListener

    const listen = (): void => {
      target.addEventListener(type, listener)
    }

    if (autoStart) {
      listen()
    }

    return {
      start: () => {
        if (!autoStart) {
          listen()
        }
      },
      pause: () => {
        // TODO: pause logic
      },
      cancel: () => {
        target.removeEventListener(type, listener)
      }
    }
  }
}
export const createDataFromEvent = pipe(createEventTrigger, createDataWithTrigger)
export const createMutationFromEvent = pipe(createEventTrigger, createMutationWithTrigger)

/************************************************************************************************************************
 *
 *                                                 IntervalTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface IntervalTriggerCreateOptions<R = number> {
  start?: number
  step?: number
  interval?: number
  autoStart?: boolean
  handler?: (arg: number, ...args: any[]) => R
}

const DEFAULT_INTERVAL_TRIGGER_CREATE_OPTIONS: Required<IntervalTriggerCreateOptions<any>> = {
  start: 0,
  step: 1000,
  interval: 1000,
  autoStart: true,
  handler: asIs
}

/**
 * @param [options.start = 0] (in millisecond) will be the start value of interval value
 * @param [options.step = 1000] (in millisecond) will add to start value when interval goes
 * @param [options.interval = 1000] (in millisecond) will be the ms argument of setInterval
 * @param [options.autoStart = true] indicate if the interval will auto start
 * @param [options.handler = asIs] will be apply to interval value before it passed to trigger
 * @return Trigger
 */
export const createIntervalTrigger = <R = number>(options: IntervalTriggerCreateOptions<R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }
  const preparedOptions: Required<IntervalTriggerCreateOptions<R>> = {
    ...DEFAULT_INTERVAL_TRIGGER_CREATE_OPTIONS, ...options
  }
  const { start, step, interval, autoStart, handler } = preparedOptions

  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be type of "Function".'))
  }

  interface IntervalStates { i: number, timer: NodeJS.Timeout, started: boolean }
  const intervalStates: IntervalStates = { i: start, timer: 0 as unknown as NodeJS.Timeout, started: false }

  const internalTriggers: Set<InternalTrigger<R>> = new Set()

  const startInterval = (): IntervalStates => {
    intervalStates.started = true
    try {
      intervalStates.timer = setInterval(() => {
        intervalStates.i += step
        internalTriggers.forEach(trigger => {
          trigger(handler(intervalStates.i))
        })
      }, interval)
    } catch (error) {
      intervalStates.started = false
    }

    return intervalStates
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (!intervalStates.started && autoStart) {
      startInterval()
    }

    return {
      start: () => {
        if (!intervalStates.started) {
          return startInterval()
        }
        return intervalStates
      },
      pause: () => {
        // TODO: pause logic
      },
      cancel: () => {
        clearInterval(intervalStates.timer)
      }
    }
  }
}
export const createDataFromInterval = pipe(createIntervalTrigger, createDataWithTrigger)
export const createMutationFromInterval = pipe(createIntervalTrigger, createMutationWithTrigger)

/************************************************************************************************************************
 *
 *                                                 TimeoutTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface TimeoutTriggerCreateOptions<R = number> {
  timeout: number
  autoStart?: boolean
  handler?: (arg: number, ...args: any[]) => R
}

const DEFAULT_TIMEOUT_TRIGGER_CREATE_OPTIONS: Omit<Required<TimeoutTriggerCreateOptions<any>>, 'timeout'> = {
  autoStart: true,
  handler: asIs
}

/**
 * @param options.timeout (in millisecond) will be the ms argument of setTimeout
 * @param [options.autoStart = true] indicate if the timeout will auto start
 * @param [options.handler = asIs] result of its execution will be passed to trigger
 */
export const createTimeoutTrigger = <R = number>(options: TimeoutTriggerCreateOptions<R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }
  const preparedOptions: Required<TimeoutTriggerCreateOptions<R>> = {
    ...DEFAULT_TIMEOUT_TRIGGER_CREATE_OPTIONS, ...options
  }
  const { timeout, autoStart, handler } = preparedOptions

  if (!isNumber(timeout)) {
    throw (new TypeError('"timeout" is expected to be type of "Number".'))
  }
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be type of "Function".'))
  }

  interface TimeoutStates { timer: NodeJS.Timeout, started: boolean }
  const timeoutStates: TimeoutStates = { timer: 0 as unknown as NodeJS.Timeout, started: false }

  const internalTriggers: Set<InternalTrigger<R>> = new Set()

  const start = (): TimeoutStates => {
    timeoutStates.started = true

    try {
      timeoutStates.timer = setTimeout(() => {
        internalTriggers.forEach(trigger => {
          trigger(handler(timeout))
        })
      }, timeout)
    } catch (error) {
      timeoutStates.started = false
    }

    return timeoutStates
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (!timeoutStates.started && autoStart) {
      start()
    }

    return {
      start: () => {
        if (!timeoutStates.started) {
          return start()
        }
        return timeoutStates
      },
      pause: () => {
        // TODO: pause logic
      },
      cancel: () => {
        clearTimeout(timeoutStates.timer)
      }
    }
  }
}
export const createDataFromTimeout = pipe(createTimeoutTrigger, createDataWithTrigger)
export const createMutationFromTimeout = pipe(createTimeoutTrigger, createMutationWithTrigger)

/************************************************************************************************************************
 *
 *                                                 ObservableTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface ObservableTriggerCreateOptions<V = any, R = any> {
  observable: Observable<V>
  autoStart?: boolean
  handler?: (arg: V, ...args: any[]) => R
}
const DEFAULT_OBSERVABLE_TRIGGER_CREATE_OPTIONS: Omit<Required<ObservableTriggerCreateOptions<any, any>>, 'observable'> = {
  autoStart: true,
  handler: asIs
}

/**
 * @param options.observable Observable(Rx)
 * @param [options.autoStart = true] indicate if the Observable will be subscribed automatically
 * @param [options.handler = asIs] will be apply to emitted value of Observable before it passed to trigger
 */
export const createObservableTrigger = <V = any, R = V>(options: ObservableTriggerCreateOptions<V, R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const preparedOptions: Required<ObservableTriggerCreateOptions<V, R>> = {
    ...DEFAULT_OBSERVABLE_TRIGGER_CREATE_OPTIONS, ...options
  }
  const { observable, autoStart, handler } = preparedOptions

  if (!isObservable(observable)) {
    throw (new TypeError('"observable" is expected to be type of "Observable" which implements the "subscribe" method.'))
  }
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be type of "Function".'))
  }

  interface ObservableStates { subscription: Subscription, started: boolean }
  const observableStates: ObservableStates = { subscription: null as unknown as Subscription, started: false }

  const internalTriggers: Set<InternalTrigger<R>> = new Set()

  const start = (): ObservableStates => {
    try {
      observableStates.started = true
      observableStates.subscription = observable.subscribe(val => {
        internalTriggers.forEach(trigger => {
          trigger(handler(val))
        })
      })
    } catch (error) {
      observableStates.started = false
    }

    return observableStates
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (!observableStates.started && autoStart) {
      start()
    }

    return {
      start: () => {
        if (!observableStates.started) {
          return start()
        }
        return observableStates
      },
      cancel: () => {
        return observableStates.subscription.unsubscribe()
      }
    }
  }
}
export const createDataFromObservable = pipe(createObservableTrigger, createDataWithTrigger)
export const createMutationFromObservable = pipe(createObservableTrigger, createMutationWithTrigger)

/************************************************************************************************************************
 *
 *                                                 normal function trigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
type emitFunction<P extends any[]> = (...args: [...P]) => void
interface FunctionTriggerCreateOptions<P extends any[] = any[], R = any> {
  agent: (emitFunction: emitFunction<[...P]>) => void
  autoBind?: boolean
  autoStart?: boolean
  handler?: (...args: [...P]) => R
}
const DEFAULT_FUNCTION_TRIGGER_CREATE_OPTIONS: Omit<Required<FunctionTriggerCreateOptions<any[], any>>, 'agent'> = {
  autoBind: true,
  autoStart: true,
  handler: asIs
}

/**
 * @param options.agent which takes emitFunction as argument, it will execute in create process
 * @param [options.autoStart = true] indicate if the shouldEmit will be set to true initially
 * @param [options.handler = asIs] will be apply to emitted value of emitFunction before it passed to trigger
 * @example
 * ```ts
 * //                                  slow usecase
 * // first create an emit variable which used to hold the real emit function,
 * //   we can separately call this function to emit values to our trigger later
 * let emit
 *
 * // then we create an agent function, which takes an inner emit function as 1st argument,
 * //   and internally assign the inner emit function to the emit variable which we created in last step
 * const agent = (innerEmit) => {
 *   emit = innerEmit
 * }
 *
 * // then create a trigger, specify the agent function
 * //   and the handler function which will be called with the arguments passed to emit function later
 * //   the return value will be passed to the trigger
 * const trigger = createFunctionTrigger({ agent, handler: (score) => score + 1 })
 *
 * // call the emit function which hold be the pre-declared variable
 * //   the trigger will emit 100 (which equals to `99 + 1`)
 * emit(99)
 *
 * //                                 quick usecase
 * // create all we need using the `createFunctionTriggerAgent` function
 * //   only need to specify the handler function
 * const agent = createFunctionTriggerAgent((score: number) => score + 1)
 *
 * // then pass the created agent to the FunctionTrigger creator using the spread operator
 * const const trigger = createFunctionTrigger({ ...agent })
 *
 * // call the emit function hold by `agent` to trigger value
 * agent.emit(99)
 * ```
 */
export const createFunctionTrigger = <P extends any[] = any[], R = any>(options: FunctionTriggerCreateOptions<P, R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }
  const preparedOptions: Required<FunctionTriggerCreateOptions<P, R>> = {
    ...DEFAULT_FUNCTION_TRIGGER_CREATE_OPTIONS, ...options
  }
  const { agent, autoBind, autoStart, handler } = preparedOptions

  if (!isFunction(agent)) {
    throw (new TypeError('"agent" is expected to be type of "Function".'))
  }
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be type of "Function".'))
  }

  interface FunctionStates { isBound: boolean, shouldEmit: boolean, emitFunction: ((...args: P) => void) | null }
  const functionStates: FunctionStates = { isBound: false, shouldEmit: autoStart, emitFunction: null }

  return internalTrigger => {
    functionStates.emitFunction = (...args) => {
      if (functionStates.emitFunction !== null && functionStates.shouldEmit) {
        internalTrigger(handler(...args))
      }
    }

    const bind = (): void => {
      if (!functionStates.isBound && functionStates.emitFunction !== null) {
        agent(functionStates.emitFunction)
      }
    }

    if (autoBind) {
      bind()
    }

    return {
      start: () => {
        bind()
        functionStates.shouldEmit = true
        return functionStates
      },
      pause: () => {
        functionStates.shouldEmit = false
      },
      cancel: () => {
        functionStates.shouldEmit = false
      }
    }
  }
}
export const createDataFromFunction = pipe(createFunctionTrigger, createDataWithTrigger)
export const createMutationFromFunction = pipe(createFunctionTrigger, createMutationWithTrigger)

interface FunctionTriggerAgent<P extends any[] = any[], R = any> {
  agent: (emitFunction: emitFunction<[...P]>) => void
  handler: (...args: [...P]) => R
  emit?: emitFunction<[...P]>
  isBound: boolean
}
/**
 * Function Trigger Agent is designed to be passed to `createFunctionTrigger` function
 *   as part of its options.
 *
 * @example
 * ```js
 * createFunctionTrigger({ ...createFunctionTriggerAgent(handler), ...otherOptions })
 * ```
 */
export const createFunctionTriggerAgent = <P extends any[] = any[], R = any>(
  handler: (...args: [...P]) => R
): FunctionTriggerAgent<[...P], R> => {
  const agentCollection: FunctionTriggerAgent<[...P], R> = {
    handler: handler,
    isBound: false,
    emit: undefined,
    agent: (innerEmit: emitFunction<[...P]>): void => {
      agentCollection.emit = innerEmit
      agentCollection.isBound = true
    }
  }

  return agentCollection
}
