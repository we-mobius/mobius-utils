import {
  isString, isFunction, isBoolean, isNumber, isPlainObject,
  isEventTarget, isObservable, isGeneralObject, isIterable,
  hasOwnProperty, asIs
} from '../../internal'
import { compose } from '../../functional'
import { createDataWithTrigger, createMutationWithTrigger } from './hybrid-create.helpers'

/************************************************************************************************************************
 *                                                 IterableTrigger creators
 ************************************************************************************************************************/
/**
 * @param iterable Iterable, which values will be trigged in sequence
 * @param autoStart Boolean, optional, default to false, indicate if the iterable will be iterated automatically
 * @param repeatable Boolean, optional, defautl to true, indicate if the iterable will be iterated repeatedly
 * @param handler Function, optional, default to asIS, will be apply to values before them passed to trigger
 */
export const createIterableTrigger = ({ iterable, handler = asIs, autoStart = false, repeatable = true } = {}) => {
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }
  if (!isIterable(iterable)) {
    throw (new TypeError('"iterable" is expected to be iterable.'))
  }

  const iterateState = { times: 0, done: false, values: [] }
  const internalTriggers = new WeakSet()

  const iterate = () => {
    try {
      iterateState.values = [...iterable]
      iterateState.values.forEach(i => {
        internalTriggers.forEach(trigger => {
          trigger(handler(i))
        })
      })
      iterateState.done = true
      iterateState.times += 1
    } catch (error) {
    }

    return iterateState
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (autoStart) {
      iterate()
    }

    return {
      start: () => {
        if (repeatable || iterateState.times === 0) {
          iterate()
        }
        return iterateState
      },
      cancel: () => {}
    }
  }
}
export const formatIterableTriggerCreatorFlatArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    // accept ({ iterable, ... })
    // accept (Any)
    if (isPlainObject(args[0]) && hasOwnProperty('iterable', args[0])) {
      res = args[0]
    } else {
      res = { iterable: args[0] }
    }
  } else if (args.length > 1) {
    const argsKeyList = ['autoStart', 'repeatable']
    args.forEach(arg => {
      if (isIterable(arg)) {
        res.iterable = res.iterable || arg
      } else if (isFunction(arg)) {
        res.handler = res.handler || arg
      } else if (isBoolean(arg)) {
        res[argsKeyList.shift()] = arg
      }
    })
  }

  return res
}
export const createIterableTriggerF = compose(createIterableTrigger, formatIterableTriggerCreatorFlatArgs)
export const createDataFromIterable = compose(createDataWithTrigger, createIterableTriggerF)
export const createMutationFromIterable = compose(createMutationWithTrigger, createIterableTriggerF)

/************************************************************************************************************************
 *                                                 EventTrigger creators
 ************************************************************************************************************************/
/**
 * @param target EventTarget, which has addEventListener method & removeEventListener method
 * @param type String, event type which will pass as first argument of addEventListener & removeEventListener
 * @param handler Function, optional, default to asIS, will be apply to event argument before it passed to trigger
 * @return Trigger
 */
export const createEventTrigger = ({ target, type, handler = asIs } = {}) => {
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }
  if (!isEventTarget(target)) {
    throw (new TypeError('"target" is expected to be an instance of EventTarget.'))
  }
  return internalTrigger => {
    const listener = e => {
      internalTrigger(handler(e))
    }
    target.addEventListener(type, listener)
    return {
      cancel: () => {
        target.removeEventListener(type, listener)
      }
    }
  }
}
export const formatEventTriggerCreatorFlatArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    // accept ({ target: EventTarget, ... })
    // accept (Any)
    if (isPlainObject(args[0]) && hasOwnProperty('target', args[0])) {
      res = args[0]
    } else {
      res = { target: args[0] }
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if (isGeneralObject(arg)) {
        res.target = res.target || arg
      } else if (isString(arg)) {
        res.type = res.type || arg
      } else if (isFunction(arg)) {
        res.handler = res.handler || arg
      }
    })
  }

  return res
}
export const createEventTriggerF = compose(createEventTrigger, formatEventTriggerCreatorFlatArgs)
export const createDataFromEvent = compose(createDataWithTrigger, createEventTriggerF)
export const createMutationFromEvent = compose(createMutationWithTrigger, createEventTriggerF)

/************************************************************************************************************************
 *                                                 IntervalTrigger creators
 ************************************************************************************************************************/
/**
 * @param start Number, optional, default to 0, (in millisecond) will be the start value of interval value
 * @param step Number, optional, default to 1000, (in millisecond) will add to start value when interval goes
 * @param interval Number, optional, default to 1000, (in millisecond) will be the ms argument of setInterval
 * @param autoStart Boolean, optional, default to true, indicate if the interval will auto start
 * @param handler Function, optional, default to asIs, will be apply to interval value before it passed to trigger
 * @return Trigger
 */
export const createIntervalTrigger = ({ handler = asIs, start = 0, step = 1000, interval = 1000, autoStart = true } = {}) => {
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }
  let i = start
  let timer = 0
  let started = false
  const internalTriggers = new WeakSet()

  const startInterval = () => {
    started = true
    try {
      timer = setInterval(() => {
        i += step
        internalTriggers.forEach(trigger => {
          trigger(handler(i))
        })
      }, interval)
    } catch (error) {
      started = false
    }

    return timer
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (!started && autoStart) {
      startInterval()
    }

    return {
      start: () => {
        if (!started) {
          return startInterval()
        }
        return timer
      },
      cancel: () => {
        clearInterval(timer)
      }
    }
  }
}
export const formatIntervalTriggerCreatorFlatArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isPlainObject(args[0])) {
      res = args[0]
    }
  } else if (args.length > 1) {
    const argsKeyList = ['start', 'step', 'interval', 'autoStart', 'handler']
    args.forEach((val) => {
      if (isFunction(val)) {
        res.handler = res.handler || val
      } else {
        res[argsKeyList.shift()] = val
      }
    })
  }

  return res
}
export const createIntervalTriggerF = compose(createIntervalTrigger, formatIntervalTriggerCreatorFlatArgs)
export const createDataFromInterval = compose(createDataWithTrigger, createIntervalTriggerF)
export const createMutationFromInterval = compose(createMutationWithTrigger, createIntervalTriggerF)

/************************************************************************************************************************
 *                                                 TimeoutTrigger creators
 ************************************************************************************************************************/
/**
 * @param timeout Number, required, (in millisecond) will be the ms argument of setTimeout
 * @param autoStart Boolean, optional, default to true, indicate if the timeout will auto start
 * @param handler Function, optional, default to asIs, result of its execution will be passed to trigger
 * @return Trigger
 */
export const createTimeoutTrigger = ({ timeout, handler = asIs, autoStart = true } = {}) => {
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }
  if (!isNumber(timeout)) {
    throw (new TypeError('"timeout" is required and expected to be a Number.'))
  }

  let started = false
  let timer = 0
  const internalTriggers = new WeakSet()

  const start = () => {
    started = true
    try {
      timer = setTimeout(() => {
        internalTriggers.forEach(trigger => {
          trigger(handler())
        })
      }, timeout)
    } catch (error) {
      started = false
    }

    return timer
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (!started && autoStart) {
      start()
    }

    return {
      start: () => {
        if (!started) {
          return start()
        }
        return timer
      },
      cancel: () => {
        clearTimeout(timer)
      }
    }
  }
}
export const formatTimeoutTriggerCreatorFlatArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isPlainObject(args[0])) {
      res = args[0]
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if (isNumber(arg)) {
        res.timeout = hasOwnProperty('timeout', res) ? res.timeout : arg
      } else if (isFunction(arg)) {
        res.handler = hasOwnProperty('handler', res) ? res.handler : arg
      } else if (isBoolean(arg)) {
        res.autoStart = hasOwnProperty('autoStart', res) ? res.autoStart : arg
      }
    })
  }

  return res
}
export const createTimeoutTriggerF = compose(createTimeoutTrigger, formatTimeoutTriggerCreatorFlatArgs)
export const createDataFromTimeout = compose(createDataWithTrigger, createTimeoutTriggerF)
export const createMutationFromTimeout = compose(createMutationWithTrigger, createTimeoutTriggerF)

/************************************************************************************************************************
 *                                                 ObservableTrigger creators
 ************************************************************************************************************************/
/**
 * @param observable Observable, required
 * @param autoStart Boolean, optional, default to true, indicate if the Observable will be subscribed automatically
 * @param handler Function, optional, default to asIs, will be apply to emitted value of Observable before it passed to trigger
 * @return Trigger
 */
export const createObservableTrigger = ({ observable, handler = asIs, autoStart = true }) => {
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }
  if (!isObservable(observable)) {
    throw (new TypeError('"observable" is expected to be an observable object which implements the subscribe method.'))
  }

  let started = false
  let subscription
  const internalTriggers = new WeakSet()

  const start = () => {
    try {
      started = true
      subscription = observable.subscribe(val => {
        internalTriggers.forEach(trigger => {
          trigger(handler(val))
        })
      })
    } catch (error) {
      started = false
    }
    return subscription
  }

  return internalTrigger => {
    internalTriggers.add(internalTrigger)

    if (!started && autoStart) {
      start()
    }

    return {
      start: () => {
        if (!started) {
          return start()
        }
        return subscription
      },
      cancel: () => {
        return subscription.unsubscribe()
      }
    }
  }
}
export const formatObservableTriggerCreatorFlatArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isPlainObject(args[0])) {
      res = args[0]
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if (isObservable(arg)) {
        res.observable = hasOwnProperty('observable', res) ? res.observable : arg
      } else if (isFunction(arg)) {
        res.handler = hasOwnProperty('handler', res) ? res.handler : arg
      } else if (isBoolean(arg)) {
        res.autoStart = hasOwnProperty('autoStart', res) ? res.autoStart : arg
      }
    })
  }
  return res
}
export const createObservableTriggerF = compose(createObservableTrigger, formatObservableTriggerCreatorFlatArgs)
export const createDataFromObservable = compose(createDataWithTrigger, createObservableTriggerF)
export const createMutationFromObservable = compose(createMutationWithTrigger, createObservableTriggerF)

/************************************************************************************************************************
 *                                                 normal function trigger creators
 ************************************************************************************************************************/
/**
 * @param agent Function, required, which takes emitFunction as argument, it will execute in create process
 * @param autoStart Boolean, optional, default to true, indicate if the shouldEmit will be set to true initially
 * @param handler Function, optional, default to asIs, will be apply to emitted value of emitFunction before it passed to trigger
 * @return Trigger
 */
export const createFunctionTrigger = ({ agent, handler = asIs, autoStart = true }) => {
  if (!isFunction(agent)) {
    throw (new TypeError('"agent" is expected to be a Function.'))
  }
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }

  let shouldEmit = autoStart

  return internalTrigger => {
    let emitFunction = (...args) => {
      if (shouldEmit) {
        internalTrigger(handler(...args))
      }
    }
    agent(emitFunction)
    return {
      start: () => { shouldEmit = true },
      pause: () => { shouldEmit = false },
      cancel: () => {
        shouldEmit = false
        emitFunction = null
      }
    }
  }
}
export const formatFunctionTriggerCreatorFlatArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isPlainObject(args[0])) {
      res = args[0]
    } else if (isFunction(args[0])) {
      res.agent = args[0]
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if (isFunction(arg)) {
        if (!res.agent) {
          res.agent = arg
        } else if (!res.handler) {
          res.handler = arg
        }
      } else if (isBoolean(arg)) {
        res.autoStart = hasOwnProperty('autoStart', res) ? res.autoStart : arg
      }
    })
  }
  return res
}
export const createFunctionTriggerF = compose(createFunctionTrigger, formatFunctionTriggerCreatorFlatArgs)
export const createDataFromFunction = compose(createDataWithTrigger, createFunctionTriggerF)
export const createMutationFromFunction = compose(createMutationWithTrigger, createFunctionTriggerF)
