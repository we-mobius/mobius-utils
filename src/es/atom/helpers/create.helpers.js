import { asIs, isEventTarget, hasOwnProperty, isObservable, isObject, isFunction, isBoolean, isNumber } from '../../internal.js'
import { compose } from '../../functional.js'
import { Data, Mutation } from '../atom.js'
import { TriggerMediator, ReplayMediator } from '../mediators.js'

export const withMediator = (atom, mediator) => {
  const _mediator = mediator.of(atom)
  return [atom, _mediator]
}

export const withTriggerMediator = atom => withMediator(atom, TriggerMediator)
export const withReplayMediator = atom => withMediator(atom, ReplayMediator)

// createMutationWithTriggerMediator :: () => [mutation, triggerMediator]
export const createMutationWithTriggerMediator = () => withTriggerMediator(Mutation.empty())
// createDataWithTriggerMediator :: () => [data, triggerMediator]
export const createDataWithTriggerMediator = () => withTriggerMediator(Data.empty())
// createMutationWithReplayMediator :: () => [mutation, replayMediator]
export const createMutationWithReplayMediator = () => withReplayMediator(Mutation.empty())
// createDataWithReplayMediator :: () => [data, replayMediator]
export const createDataWithReplayMediator = () => withReplayMediator(Data.empty())

// createMutationWithTrigger :: trigger -> [mutation, triggerMediator, trigger]
export const createMutationWithTrigger = trigger => {
  const [mutation, triggerMediator] = createMutationWithTriggerMediator()
  triggerMediator.register(trigger)
  return [mutation, triggerMediator, trigger]
}
// createDataWithTrigger :: trigger -> [data, triggerMediator, trigger]
export const createDataWithTrigger = trigger => {
  const [mutation, triggerMediator] = createDataWithTriggerMediator()
  triggerMediator.register(trigger)
  return [mutation, triggerMediator, trigger]
}

// EventTrigger creators
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
export const formatEventTriggerCreatorFlattenArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (hasOwnProperty('target', args[0])) {
      res = args[0]
    } else {
      res = { target: args[0] }
    }
  } else if (args.length > 1) {
    res = {
      target: args[0],
      type: args[1],
      handler: args[2] || asIs
    }
  }

  return res
}
export const createEventTriggerF = compose(createEventTrigger, formatEventTriggerCreatorFlattenArgs)
export const createMutationFromEvent = compose(createMutationWithTrigger, createEventTriggerF)
export const createDataFromEvent = compose(createDataWithTrigger, createEventTriggerF)

// IntervalTrigger creators
export const createIntervalTrigger = ({ handler = asIs, start = 0, step = 1000, interval = 1000 } = {}) => {
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }
  let i = start
  return internalTrigger => {
    const timer = setInterval(() => {
      i += step
      internalTrigger(handler(i))
    }, interval)

    return {
      cancel: () => {
        clearInterval(timer)
      }
    }
  }
}
export const formatIntervalTriggerCreatorFlattenArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isObject(args[0])) {
      res = args[0]
    }
  } else if (args.length > 1) {
    const argsKeyList = ['start', 'step', 'interval', 'handler']
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
export const createIntervalTriggerF = compose(createIntervalTrigger, formatIntervalTriggerCreatorFlattenArgs)
export const createMutationFromInterval = compose(createMutationWithTrigger, createIntervalTriggerF)
export const createDataFromInterval = compose(createDataWithTrigger, createIntervalTriggerF)

// TimeoutTrigger creators
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
export const formatTimeoutTriggerCreatorFlattenArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isObject(args[0])) {
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
export const createTimeoutTriggerF = compose(createTimeoutTrigger, formatTimeoutTriggerCreatorFlattenArgs)
export const createMutationFromTimeout = compose(createMutationWithTrigger, createTimeoutTriggerF)
export const createDataFromTimeout = compose(createDataWithTrigger, createTimeoutTriggerF)

// ObservableTrigger creators
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
export const formatObservableTriggerCreatorFlattenArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isObject(args[0])) {
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
export const createObservableTriggerF = compose(createObservableTrigger, formatObservableTriggerCreatorFlattenArgs)
export const createMutationFromObservable = compose(createMutationWithTrigger, createObservableTriggerF)
export const createDataFromObservable = compose(createDataWithTrigger, createObservableTriggerF)

// normal function trigger creators
export const createFunctionTrigger = ({ containerFn, handler = asIs, autoStart = true }) => {
  if (!isFunction(containerFn)) {
    throw (new TypeError('"containerFn" is expected to be a Function.'))
  }
  if (!isFunction(handler)) {
    throw (new TypeError('"handler" is expected to be a Function.'))
  }

  let started = autoStart

  return internalTrigger => {
    let functionHandler = (...args) => {
      if (started) {
        internalTrigger(handler(...args))
      }
    }
    containerFn(functionHandler)
    return {
      start: () => { started = true },
      pause: () => { started = false },
      cancel: () => {
        started = false
        functionHandler = null
      }
    }
  }
}
export const formatFunctionTriggerCreatorFlattenArgs = (...args) => {
  let res = {}

  if (args.length === 1) {
    if (isObject(args[0])) {
      res = args[0]
    } else if (isFunction(args[0])) {
      res.containerFn = args[0]
    }
  } else if (args.length > 1) {
    args.forEach(arg => {
      if (isFunction(arg)) {
        if (!res.containerFn) {
          res.containerFn = arg
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
export const createFunctionTriggerF = compose(createFunctionTrigger, formatFunctionTriggerCreatorFlattenArgs)
export const createMutationFromFunction = compose(createMutationWithTrigger, createFunctionTriggerF)
export const createDataFromFunction = compose(createDataWithTrigger, createFunctionTriggerF)
