import {
  isFunction, isNumber, isPlainObject,
  isEventTarget, isObservable, isIterable,
  asIs
} from '../../internal/base'
import { compose } from '../../functional'
import { createDataWithTrigger, createMutationWithTrigger } from './hybrid-create.helpers'

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
interface IterableTriggerCreateOptions<V, R> {
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
 * @param { Iterable } options.iterable which values will be trigged in sequence
 * @param { boolean } [options.autoStart = false] indicate if the iterable will be iterated automatically
 * @param { boolean } [options.repeatable = true] indicate if the iterable will be iterated repeatedly
 * @param { Function } [options.handler = asIs] will be apply to values before them passed to trigger
 */
export const createIterableTrigger = <V = any, R = V>(options: IterableTriggerCreateOptions<V, R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const { iterable, autoStart, repeatable, handler } = { ...DEFAULT_ITERABLE_TRIGGER_CREATE_OPTIONS, ...options }

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
export const createDataFromIterable = compose(createDataWithTrigger, createIterableTrigger)
export const createMutationFromIterable = compose(createMutationWithTrigger, createIterableTrigger)

/************************************************************************************************************************
 *
 *                                                 EventTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface EventTriggerCreateOptions<R> {
  target: EventTarget
  type: string
  autoStart?: boolean
  handler?: (arg: Event, ...args: any[]) => R
}

const DEFAULT_EVENT_TRIGGER_CREATE_OPTIONS: Omit<Required<EventTriggerCreateOptions<any>>, 'target' | 'type'> = {
  autoStart: true,
  handler: asIs
}

/**
 * @param { EventTarget } options.target which has addEventListener method & removeEventListener method
 * @param { string } options.type event type which will pass as first argument of addEventListener & removeEventListener
 * @param { boolean } [options.autoStart = true] indicate if the event will be listened automatically
 * @param { Function } [options.handler = asIs] will be apply to event argument before it passed to trigger
 */
export const createEventTrigger = <R = any>(options: EventTriggerCreateOptions<R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const { target, type, autoStart, handler } = { ...DEFAULT_EVENT_TRIGGER_CREATE_OPTIONS, ...options }

  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be type of "Function".'))
  }

  if (!isEventTarget(target)) {
    throw (new TypeError('"target" is expected to be type of "EventTarget".'))
  }

  return internalTrigger => {
    const listener: EventListenerOrEventListenerObject = e => {
      internalTrigger(handler(e))
    }

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
export const createDataFromEvent = compose(createDataWithTrigger, createEventTrigger)
export const createMutationFromEvent = compose(createMutationWithTrigger, createEventTrigger)

/************************************************************************************************************************
 *
 *                                                 IntervalTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface IntervalTriggerCreateOptions<R> {
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
 * @param { number } [options.start = 0] (in millisecond) will be the start value of interval value
 * @param { number } [options.step = 1000] (in millisecond) will add to start value when interval goes
 * @param { number } [options.interval = 1000] (in millisecond) will be the ms argument of setInterval
 * @param { boolean } [options.autoStart = true] indicate if the interval will auto start
 * @param { Function } [options.handler = asIs] will be apply to interval value before it passed to trigger
 * @return Trigger
 */
export const createIntervalTrigger = <R = any>(options: IntervalTriggerCreateOptions<R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const { start, step, interval, autoStart, handler } = { ...DEFAULT_INTERVAL_TRIGGER_CREATE_OPTIONS, ...options }

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
export const createDataFromInterval = compose(createDataWithTrigger, createIntervalTrigger)
export const createMutationFromInterval = compose(createMutationWithTrigger, createIntervalTrigger)

/************************************************************************************************************************
 *
 *                                                 TimeoutTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface TimeoutTriggerCreateOptions<R> {
  timeout: number
  autoStart?: boolean
  handler?: (...args: any[]) => R
}

const DEFAULT_TIMEOUT_TRIGGER_CREATE_OPTIONS: Omit<Required<TimeoutTriggerCreateOptions<any>>, 'timeout'> = {
  autoStart: true,
  handler: asIs
}

/**
 * @param { number } options.timeout (in millisecond) will be the ms argument of setTimeout
 * @param { boolean } [options.autoStart = true] indicate if the timeout will auto start
 * @param { Function } [options.handler = asIs] result of its execution will be passed to trigger
 */
export const createTimeoutTrigger = <R = any>(options: TimeoutTriggerCreateOptions<R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const { timeout, autoStart, handler } = { ...DEFAULT_TIMEOUT_TRIGGER_CREATE_OPTIONS, ...options }

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
          trigger(handler())
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
export const createDataFromTimeout = compose(createDataWithTrigger, createTimeoutTrigger)
export const createMutationFromTimeout = compose(createMutationWithTrigger, createTimeoutTrigger)

/************************************************************************************************************************
 *
 *                                                 ObservableTrigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
interface ObservableTriggerCreateOptions<V, R> {
  observable: Observable<V>
  autoStart?: boolean
  handler?: (arg: V, ...args: any[]) => R
}
const DEFAULT_OBSERVABLE_TRIGGER_CREATE_OPTIONS: Omit<Required<ObservableTriggerCreateOptions<any, any>>, 'observable'> = {
  autoStart: true,
  handler: asIs
}

/**
 * @param { Observable } options.observable Observable(Rx)
 * @param { boolean } [options.autoStart = true] indicate if the Observable will be subscribed automatically
 * @param { Function } [options.handler = asIs] will be apply to emitted value of Observable before it passed to trigger
 */
export const createObservableTrigger = <V = any, R = V>(options: ObservableTriggerCreateOptions<V, R>): Trigger<R> => {
  if (!isPlainObject(options)) {
    throw (new TypeError('"options" is expected to be type of "PlainObject".'))
  }

  const { observable, autoStart, handler } = { ...DEFAULT_OBSERVABLE_TRIGGER_CREATE_OPTIONS, ...options }

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
export const createDataFromObservable = compose(createDataWithTrigger, createObservableTrigger)
export const createMutationFromObservable = compose(createMutationWithTrigger, createObservableTrigger)

/************************************************************************************************************************
 *
 *                                                 normal function trigger creators
 *
 ************************************************************************************************************************/

/**
 *
 */
type emitFunction<P extends any[]> = (...args: P) => void
interface FunctionTriggerCreateOptions<P extends any[], R> {
  agent: (emitFunction: emitFunction<P>) => void
  autoBind?: boolean
  autoStart?: boolean
  handler?: (...args: P) => R
}
const DEFAULT_FUNCTION_TRIGGER_CREATE_OPTIONS: Omit<Required<FunctionTriggerCreateOptions<any[], any>>, 'agent'> = {
  autoBind: true,
  autoStart: true,
  handler: asIs
}

/**
 * @param { Function } options.agent which takes emitFunction as argument, it will execute in create process
 * @param { boolean } [options.autoStart = true] indicate if the shouldEmit will be set to true initially
 * @param { Function } [options.handler = asIs] will be apply to emitted value of emitFunction before it passed to trigger
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

  const { agent, autoBind, autoStart, handler } = { ...DEFAULT_FUNCTION_TRIGGER_CREATE_OPTIONS, ...options }

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
export const createDataFromFunction = compose(createDataWithTrigger, createFunctionTrigger)
export const createMutationFromFunction = compose(createMutationWithTrigger, createFunctionTrigger)

interface FunctionTriggerAgent<P extends any[], R> {
  agent: (emitFunction: emitFunction<P>) => void
  handler: (...args: P) => R
  emit?: emitFunction<P>
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
export const createFunctionTriggerAgent = <P extends any[], R>(
  handler: (...args: P) => R
): FunctionTriggerAgent<P, R> => {
  const agentCollection: FunctionTriggerAgent<P, R> = {
    handler: handler,
    isBound: false,
    emit: undefined,
    agent: (innerEmit: emitFunction<P>): void => {
      agentCollection.emit = innerEmit
      agentCollection.isBound = true
    }
  }

  return agentCollection
}
